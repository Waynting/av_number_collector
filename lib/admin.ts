import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

/**
 * CRITICAL SECURITY: Admin status is stored ONLY in the database
 *
 * Admin privileges are determined by the `isAdmin` field in the database.
 * This field can ONLY be modified directly in the database by a database administrator.
 *
 * There is NO way to grant admin privileges through code or configuration files.
 */

/**
 * Check if the current user is an admin
 * Reads from database `isAdmin` field only
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    // Check database for isAdmin status
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true },
    })

    return dbUser?.isAdmin ?? false
  } catch (error) {
    return false
  }
}

/**
 * Check if a user is an admin and throw an error if not
 * Use this in Server Actions that require admin privileges
 */
export async function requireAdmin(): Promise<void> {
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    throw new Error("Unauthorized: Admin access required")
  }
}

/**
 * Get the current authenticated user if they are an admin
 * Returns null if not authenticated or not an admin
 */
export async function getAdminUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    // Only return user if they are an admin
    if (!dbUser?.isAdmin) {
      return null
    }

    return dbUser
  } catch (error) {
    return null
  }
}
