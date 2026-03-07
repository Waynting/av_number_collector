"use server"

import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sanitizeError } from "@/lib/validations"

/**
 * Get all users with their statistics
 * Admin only
 */
export async function getAllUsers() {
  await requireAdmin()

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      isAdmin: true,
      createdAt: true,
      _count: {
        select: {
          playlists: true,
          sourceTemplates: true,
          favoritePlaylists: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users
}

/**
 * Delete a user and all their associated data
 * Admin only - uses cascade delete from Prisma schema
 */
export async function deleteUser(userId: string) {
  try {
    await requireAdmin()

    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required")
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        isAdmin: true,
        _count: {
          select: {
            playlists: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Prevent deleting admin users
    if (user.isAdmin) {
      throw new Error("Cannot delete admin users")
    }

    // Delete user - cascade delete will handle related data
    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath("/admin")
    revalidatePath("/surf")

    return {
      success: true,
      message: `User ${user.email} and ${user._count.playlists} playlists deleted successfully`,
    }
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

/**
 * Get all playlists (both public and private) with user information
 * Admin only
 */
export async function getAllPlaylists() {
  await requireAdmin()

  const playlists = await prisma.playlist.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: { items: true },
      },
      items: {
        take: 5, // Preview first 5 items
        orderBy: { position: 'asc' },
        select: {
          id: true,
          normalizedCode: true,
          note: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return playlists
}

/**
 * Get all public playlists with user information
 * Admin only
 */
export async function getAllPublicPlaylists() {
  await requireAdmin()

  const playlists = await prisma.playlist.findMany({
    where: {
      isPublic: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: { items: true },
      },
      items: {
        take: 5, // Preview first 5 items
        orderBy: { position: 'asc' },
        select: {
          id: true,
          normalizedCode: true,
          note: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return playlists
}

/**
 * Admin delete any playlist (including public ones)
 * Used for moderation purposes
 */
export async function adminDeletePlaylist(playlistId: string) {
  try {
    await requireAdmin()

    if (!playlistId || playlistId.trim() === "") {
      throw new Error("Playlist ID is required")
    }

    // Get playlist info before deletion
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      select: {
        name: true,
        isPublic: true,
        user: {
          select: {
            email: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    })

    if (!playlist) {
      throw new Error("Playlist not found")
    }

    // Delete playlist - cascade delete will handle items
    await prisma.playlist.delete({
      where: { id: playlistId },
    })

    revalidatePath("/admin/playlists")
    revalidatePath("/surf")

    return {
      success: true,
      message: `Deleted playlist "${playlist.name}" by ${playlist.user.email} (${playlist._count.items} items)`,
    }
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

/**
 * Get dashboard statistics for admin
 * Admin only
 */
export async function getAdminStats() {
  await requireAdmin()

  const [
    totalUsers,
    totalPlaylists,
    publicPlaylists,
    totalItems,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.playlist.count(),
    prisma.playlist.count({ where: { isPublic: true } }),
    prisma.playlistItem.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        email: true,
        displayName: true,
        createdAt: true,
      },
    }),
  ])

  return {
    totalUsers,
    totalPlaylists,
    publicPlaylists,
    privatePlaylists: totalPlaylists - publicPlaylists,
    totalItems,
    recentUsers,
  }
}

