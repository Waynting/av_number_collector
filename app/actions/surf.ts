"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"
import {
  validateData,
  searchPublicPlaylistsSchema,
  copyPlaylistSchema,
  addItemsToUserPlaylistSchema,
  sanitizeError,
} from "@/lib/validations"

/**
 * Search public playlists by name, description, or creator name
 */
export async function searchPublicPlaylists(query: string = "") {
  try {
    // Validate input
    const validation = validateData({ query }, searchPublicPlaylistsSchema)
    if (!validation.success) {
      throw new Error(validation.error)
    }

    const playlists = await prisma.playlist.findMany({
      where: {
        isPublic: true,
        OR: query ? [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          {
            user: {
              displayName: { contains: query, mode: 'insensitive' },
            },
          },
        ] : undefined,
      },
      include: {
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { items: true },
        },
        items: {
          take: 3, // Preview first 3 items
          orderBy: { position: 'asc' },
          select: {
            normalizedCode: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50, // Limit results
    })

    return playlists
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

/**
 * Copy all items from a public playlist to a new playlist owned by the current user
 */
export async function copyPlaylistToUser(
  sourcePlaylistId: string,
  newPlaylistName: string,
  newPlaylistDescription?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validation = validateData(
      { sourcePlaylistId, newPlaylistName, newPlaylistDescription },
      copyPlaylistSchema
    )
    if (!validation.success) {
      throw new Error(validation.error)
    }

    // Verify source playlist is public
    const sourcePlaylist = await prisma.playlist.findUnique({
      where: { id: sourcePlaylistId },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!sourcePlaylist) {
      throw new Error("Playlist not found")
    }

    if (!sourcePlaylist.isPublic && sourcePlaylist.userId !== user.id) {
      throw new Error("Cannot copy a private playlist")
    }

    // Create new playlist for user
    const newPlaylist = await prisma.playlist.create({
      data: {
        userId: user.id,
        name: newPlaylistName,
        description: newPlaylistDescription || null,
        shareSlug: nanoid(10),
        items: {
          createMany: {
            data: sourcePlaylist.items.map((item, index) => ({
              videoCode: item.videoCode,
              normalizedCode: item.normalizedCode,
              note: item.note,
              position: index,
            })),
          },
        },
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/playlist/${newPlaylist.id}`)

    return newPlaylist
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

/**
 * Add selected items from a public playlist to an existing user playlist
 */
export async function addItemsToUserPlaylist(
  targetPlaylistId: string,
  sourcePlaylistId: string,
  itemIds: string[]
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validation = validateData(
      { targetPlaylistId, sourcePlaylistId, itemIds },
      addItemsToUserPlaylistSchema
    )
    if (!validation.success) {
      throw new Error(validation.error)
    }

    // Verify target playlist ownership
    const targetPlaylist = await prisma.playlist.findFirst({
      where: { id: targetPlaylistId, userId: user.id },
      include: {
        items: {
          orderBy: { position: 'desc' },
          take: 1,
        },
      },
    })

    if (!targetPlaylist) {
      throw new Error("Target playlist not found")
    }

    // Verify source playlist is public
    const sourcePlaylist = await prisma.playlist.findUnique({
      where: { id: sourcePlaylistId },
    })

    if (!sourcePlaylist) {
      throw new Error("Source playlist not found")
    }

    if (!sourcePlaylist.isPublic && sourcePlaylist.userId !== user.id) {
      throw new Error("Cannot copy from a private playlist")
    }

    // Get items to copy
    const itemsToCopy = await prisma.playlistItem.findMany({
      where: {
        id: { in: itemIds },
        playlistId: sourcePlaylistId,
      },
    })

    if (itemsToCopy.length === 0) {
      throw new Error("No items to copy")
    }

    // Get starting position
    const lastPosition = targetPlaylist.items[0]?.position ?? -1
    let position = lastPosition + 1

    // Create new items in target playlist
    await prisma.playlistItem.createMany({
      data: itemsToCopy.map((item) => ({
        playlistId: targetPlaylistId,
        videoCode: item.videoCode,
        normalizedCode: item.normalizedCode,
        note: item.note,
        position: position++,
      })),
    })

    revalidatePath("/dashboard")
    revalidatePath(`/playlist/${targetPlaylistId}`)

    return itemsToCopy.length
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

/**
 * Get user's playlists for the "Add to Playlist" dropdown
 */
export async function getUserPlaylistsForDropdown() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return playlists
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}
