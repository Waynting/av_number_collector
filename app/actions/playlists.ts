"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"
import { normalizeVideoCode } from "@/lib/code-normalizer"

export async function createPlaylist(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  const playlist = await prisma.playlist.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      shareSlug: nanoid(10),
    },
  })

  revalidatePath("/dashboard")
  return playlist
}

export async function updatePlaylist(playlistId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId: user.id },
  })

  if (!playlist) {
    throw new Error("Playlist not found")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const isPublic = formData.get("isPublic") === "true"

  const updated = await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      name,
      description: description || null,
      isPublic,
    },
  })

  revalidatePath(`/playlist/${playlistId}`)
  revalidatePath("/dashboard")
  return updated
}

export async function deletePlaylist(playlistId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId: user.id },
  })

  if (!playlist) {
    throw new Error("Playlist not found")
  }

  await prisma.playlist.delete({
    where: { id: playlistId },
  })

  revalidatePath("/dashboard")
}

export async function addItemToPlaylist(playlistId: string, videoCode: string, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId: user.id },
  })

  if (!playlist) {
    throw new Error("Playlist not found")
  }

  const normalizedCode = normalizeVideoCode(videoCode)

  // Get the highest position
  const lastItem = await prisma.playlistItem.findFirst({
    where: { playlistId },
    orderBy: { position: 'desc' },
  })

  const position = (lastItem?.position ?? -1) + 1

  const item = await prisma.playlistItem.create({
    data: {
      playlistId,
      videoCode,
      normalizedCode,
      note: note || null,
      position,
    },
  })

  revalidatePath(`/playlist/${playlistId}`)
  return item
}

export async function bulkAddItemsToPlaylist(playlistId: string, videoCodes: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId: user.id },
  })

  if (!playlist) {
    throw new Error("Playlist not found")
  }

  // Get the highest position
  const lastItem = await prisma.playlistItem.findFirst({
    where: { playlistId },
    orderBy: { position: 'desc' },
  })

  let position = (lastItem?.position ?? -1) + 1

  const items = videoCodes
    .filter(code => code.trim().length > 0)
    .map(videoCode => {
      const normalizedCode = normalizeVideoCode(videoCode.trim())
      return {
        playlistId,
        videoCode: videoCode.trim(),
        normalizedCode,
        position: position++,
      }
    })

  await prisma.playlistItem.createMany({
    data: items,
  })

  revalidatePath(`/playlist/${playlistId}`)
  return items.length
}

export async function deletePlaylistItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership through playlist
  const item = await prisma.playlistItem.findUnique({
    where: { id: itemId },
    include: { playlist: true },
  })

  if (!item || item.playlist.userId !== user.id) {
    throw new Error("Item not found")
  }

  await prisma.playlistItem.delete({
    where: { id: itemId },
  })

  revalidatePath(`/playlist/${item.playlistId}`)
}

export async function updatePlaylistItemNote(itemId: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify ownership through playlist
  const item = await prisma.playlistItem.findUnique({
    where: { id: itemId },
    include: { playlist: true },
  })

  if (!item || item.playlist.userId !== user.id) {
    throw new Error("Item not found")
  }

  const updated = await prisma.playlistItem.update({
    where: { id: itemId },
    data: { note: note || null },
  })

  revalidatePath(`/playlist/${item.playlistId}`)
  return updated
}
