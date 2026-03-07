"use server"

import { isAdmin as checkIsAdmin } from "@/lib/admin"

/**
 * Server action to check if the current user is an admin
 * This is called from client components to determine UI visibility
 */
export async function checkAdminStatus(): Promise<boolean> {
  try {
    return await checkIsAdmin()
  } catch (error) {
    return false
  }
}
