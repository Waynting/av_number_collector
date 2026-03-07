/**
 * Environment variable validation
 * Validates required environment variables at startup
 */

import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),

  // Optional: Google Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables
 * Call this at the top of your app or in middleware
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        return `  - ${err.path.join('.')}: ${err.message}`
      })

      console.error('\n❌ Environment validation failed!')
      console.error('\nMissing or invalid environment variables:')
      console.error(missingVars.join('\n'))
      console.error('\n📝 Please check your .env.local file and ensure all required variables are set.')
      console.error('See .env.local.example for reference.\n')

      throw new Error('Environment validation failed')
    }
    throw error
  }
}

// Validate environment variables when this module is imported
// This ensures validation happens at build/startup time
if (typeof window === 'undefined') {
  // Only validate on server-side
  validateEnv()
}
