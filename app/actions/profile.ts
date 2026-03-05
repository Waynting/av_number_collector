"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface UserPreferences {
  theme?: "light" | "dark" | "system"
  language?: string
  defaultPrivacy?: "public" | "private"
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      preferences: true,
      createdAt: true,
    },
  })

  return profile
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const displayName = formData.get("displayName") as string
  const avatarUrl = formData.get("avatarUrl") as string

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: displayName || null,
      avatarUrl: avatarUrl || null,
    },
  })

  revalidatePath("/profile")
  return updated
}

export async function updateUserPreferences(preferences: UserPreferences) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Get current preferences
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferences: true },
  })

  // Merge with new preferences
  const currentPreferences = (currentUser?.preferences as UserPreferences) || {}
  const mergedPreferences = {
    ...currentPreferences,
    ...preferences,
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      preferences: mergedPreferences,
    },
  })

  revalidatePath("/profile")
  return updated
}
