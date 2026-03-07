"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
  validateFormData,
  validateData,
  updateUserProfileSchema,
  updateUserPreferencesSchema,
  sanitizeError,
} from "@/lib/validations"

export interface UserPreferences {
  theme?: "light" | "dark" | "system"
  language?: string
  defaultPrivacy?: "public" | "private"
}

export async function getUserProfile() {
  try {
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
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validation = validateFormData(formData, updateUserProfileSchema)
    if (!validation.success) {
      throw new Error(validation.error)
    }

    const { displayName, avatarUrl } = validation.data

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: displayName || null,
        avatarUrl: avatarUrl || null,
      },
    })

    revalidatePath("/profile")
    return updated
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}

export async function updateUserPreferences(preferences: UserPreferences) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Unauthorized")
    }

    // Validate input
    const validation = validateData(preferences, updateUserPreferencesSchema)
    if (!validation.success) {
      throw new Error(validation.error)
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
      ...validation.data,
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: mergedPreferences,
      },
    })

    revalidatePath("/profile")
    return updated
  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}
