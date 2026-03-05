"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addPlaylistToFavorites(playlistId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify the playlist exists and is public
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  })

  if (!playlist) {
    throw new Error("Playlist not found")
  }

  if (!playlist.isPublic && playlist.userId !== user.id) {
    throw new Error("Cannot favorite a private playlist")
  }

  // Check if already favorited
  const existing = await prisma.favoritePlaylist.findUnique({
    where: {
      userId_playlistId: {
        userId: user.id,
        playlistId,
      },
    },
  })

  if (existing) {
    throw new Error("Playlist already in favorites")
  }

  // Add to favorites
  const favorite = await prisma.favoritePlaylist.create({
    data: {
      userId: user.id,
      playlistId,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath(`/share/${playlist.shareSlug}`)
  return favorite
}

export async function removePlaylistFromFavorites(playlistId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if favorited
  const existing = await prisma.favoritePlaylist.findUnique({
    where: {
      userId_playlistId: {
        userId: user.id,
        playlistId,
      },
    },
  })

  if (!existing) {
    throw new Error("Playlist not in favorites")
  }

  // Remove from favorites
  await prisma.favoritePlaylist.delete({
    where: {
      userId_playlistId: {
        userId: user.id,
        playlistId,
      },
    },
  })

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  })

  revalidatePath("/dashboard")
  if (playlist?.shareSlug) {
    revalidatePath(`/share/${playlist.shareSlug}`)
  }
}

export async function getUserFavorites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const favorites = await prisma.favoritePlaylist.findMany({
    where: { userId: user.id },
    include: {
      playlist: {
        include: {
          user: {
            select: {
              displayName: true,
              email: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return favorites
}

export async function checkIsFavorited(playlistId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const favorite = await prisma.favoritePlaylist.findUnique({
    where: {
      userId_playlistId: {
        userId: user.id,
        playlistId,
      },
    },
  })

  return !!favorite
}
