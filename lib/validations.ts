/**
 * Input validation schemas using Zod
 * Ensures all user inputs are properly validated before processing
 */

import { z } from "zod"

/**
 * Maximum lengths to prevent abuse
 */
export const LIMITS = {
  PLAYLIST_NAME_MAX: 100,
  PLAYLIST_DESCRIPTION_MAX: 500,
  VIDEO_CODE_MAX: 50,
  NOTE_MAX: 500,
  TEMPLATE_NAME_MAX: 100,
  TEMPLATE_URL_MAX: 500,
  DISPLAY_NAME_MAX: 100,
  AVATAR_URL_MAX: 500,
  BULK_ITEMS_MAX: 100,
  SEARCH_QUERY_MAX: 100,
} as const

/**
 * Playlist validation schemas
 */
export const createPlaylistSchema = z.object({
  name: z.string()
    .min(1, "Playlist name is required")
    .max(LIMITS.PLAYLIST_NAME_MAX, `Playlist name must be less than ${LIMITS.PLAYLIST_NAME_MAX} characters`),
  description: z.string()
    .max(LIMITS.PLAYLIST_DESCRIPTION_MAX, `Description must be less than ${LIMITS.PLAYLIST_DESCRIPTION_MAX} characters`)
    .optional()
    .nullable(),
})

export const updatePlaylistSchema = z.object({
  name: z.string()
    .min(1, "Playlist name is required")
    .max(LIMITS.PLAYLIST_NAME_MAX, `Playlist name must be less than ${LIMITS.PLAYLIST_NAME_MAX} characters`),
  description: z.string()
    .max(LIMITS.PLAYLIST_DESCRIPTION_MAX, `Description must be less than ${LIMITS.PLAYLIST_DESCRIPTION_MAX} characters`)
    .optional()
    .nullable(),
  isPublic: z.boolean(),
})

export const addItemToPlaylistSchema = z.object({
  playlistId: z.string().uuid("Invalid playlist ID"),
  videoCode: z.string()
    .min(1, "Video code is required")
    .max(LIMITS.VIDEO_CODE_MAX, `Video code must be less than ${LIMITS.VIDEO_CODE_MAX} characters`),
  note: z.string()
    .max(LIMITS.NOTE_MAX, `Note must be less than ${LIMITS.NOTE_MAX} characters`)
    .optional()
    .nullable(),
})

export const bulkAddItemsSchema = z.object({
  playlistId: z.string().uuid("Invalid playlist ID"),
  videoCodes: z.array(z.string().max(LIMITS.VIDEO_CODE_MAX))
    .min(1, "At least one video code is required")
    .max(LIMITS.BULK_ITEMS_MAX, `Cannot add more than ${LIMITS.BULK_ITEMS_MAX} items at once`),
})

export const bulkDeleteItemsSchema = z.object({
  itemIds: z.array(z.string().uuid())
    .min(1, "At least one item ID is required")
    .max(LIMITS.BULK_ITEMS_MAX, `Cannot delete more than ${LIMITS.BULK_ITEMS_MAX} items at once`),
})

export const updatePlaylistItemNoteSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  note: z.string()
    .max(LIMITS.NOTE_MAX, `Note must be less than ${LIMITS.NOTE_MAX} characters`),
})

/**
 * Source template validation schemas
 */
export const createSourceTemplateSchema = z.object({
  name: z.string()
    .min(1, "Template name is required")
    .max(LIMITS.TEMPLATE_NAME_MAX, `Template name must be less than ${LIMITS.TEMPLATE_NAME_MAX} characters`),
  baseTemplate: z.string()
    .min(1, "Template URL is required")
    .max(LIMITS.TEMPLATE_URL_MAX, `Template URL must be less than ${LIMITS.TEMPLATE_URL_MAX} characters`)
    .refine(
      (url) => {
        // Must contain {code} placeholder
        if (!url.includes('{code}')) {
          return false
        }
        // Basic URL validation - should start with http:// or https://
        try {
          // Replace {code} with a test value for URL validation
          const testUrl = url.replace('{code}', 'TEST-123')
          new URL(testUrl)
          return true
        } catch {
          return false
        }
      },
      { message: "Template must be a valid URL containing {code} placeholder" }
    ),
  isDefault: z.boolean().optional(),
})

export const updateSourceTemplateSchema = createSourceTemplateSchema

/**
 * Profile validation schemas
 */
export const updateUserProfileSchema = z.object({
  displayName: z.string()
    .max(LIMITS.DISPLAY_NAME_MAX, `Display name must be less than ${LIMITS.DISPLAY_NAME_MAX} characters`)
    .optional()
    .nullable(),
  avatarUrl: z.string()
    .max(LIMITS.AVATAR_URL_MAX, `Avatar URL must be less than ${LIMITS.AVATAR_URL_MAX} characters`)
    .url("Avatar must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal('')), // Allow empty string
})

export const updateUserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  defaultPrivacy: z.enum(['public', 'private']).optional(),
})

/**
 * Search validation schemas
 */
export const searchPublicPlaylistsSchema = z.object({
  query: z.string()
    .max(LIMITS.SEARCH_QUERY_MAX, `Search query must be less than ${LIMITS.SEARCH_QUERY_MAX} characters`)
    .optional(),
})

export const copyPlaylistSchema = z.object({
  sourcePlaylistId: z.string().uuid("Invalid source playlist ID"),
  newPlaylistName: z.string()
    .min(1, "Playlist name is required")
    .max(LIMITS.PLAYLIST_NAME_MAX, `Playlist name must be less than ${LIMITS.PLAYLIST_NAME_MAX} characters`),
  newPlaylistDescription: z.string()
    .max(LIMITS.PLAYLIST_DESCRIPTION_MAX, `Description must be less than ${LIMITS.PLAYLIST_DESCRIPTION_MAX} characters`)
    .optional(),
})

export const addItemsToUserPlaylistSchema = z.object({
  targetPlaylistId: z.string().uuid("Invalid target playlist ID"),
  sourcePlaylistId: z.string().uuid("Invalid source playlist ID"),
  itemIds: z.array(z.string().uuid())
    .min(1, "At least one item is required")
    .max(LIMITS.BULK_ITEMS_MAX, `Cannot add more than ${LIMITS.BULK_ITEMS_MAX} items at once`),
})

/**
 * Helper function to validate FormData against a schema
 */
export function validateFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const rawData = Object.fromEntries(formData.entries())

    // Create a new object with proper types
    const data: Record<string, string | boolean | File> = {}

    // Convert string booleans to actual booleans
    for (const [key, value] of Object.entries(rawData)) {
      if (value === 'true') {
        data[key] = true
      } else if (value === 'false') {
        data[key] = false
      } else {
        data[key] = value
      }
    }

    const result = schema.safeParse(data)

    if (!result.success) {
      const firstError = result.error.errors[0]
      return {
        success: false,
        error: firstError.message
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid form data'
    }
  }
}

/**
 * Helper function to validate plain objects against a schema
 */
export function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.safeParse(data)

    if (!result.success) {
      const firstError = result.error.errors[0]
      return {
        success: false,
        error: firstError.message
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid data'
    }
  }
}

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Known safe error messages
    const safeMessages = [
      'Unauthorized',
      'Not found',
      'Forbidden',
      'Invalid input',
      'Rate limit exceeded',
      'Playlist not found',
      'Template not found',
      'Item not found',
      'This code is already in the playlist',
      'Cannot copy a private playlist',
      'Unauthorized to delete some items',
    ]

    if (safeMessages.some(msg => error.message.includes(msg))) {
      return error.message
    }

    // Log the actual error for debugging
    console.error('Sanitized error:', error)

    // Return generic error message
    return 'An error occurred while processing your request'
  }

  console.error('Unknown error type:', error)
  return 'An unexpected error occurred'
}
