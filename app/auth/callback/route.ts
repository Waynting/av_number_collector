import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Create user in database if doesn't exist, or update with OAuth data
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          // Update avatar and display name if they come from OAuth provider
          ...(user.user_metadata?.avatar_url && { avatarUrl: user.user_metadata.avatar_url }),
          ...(user.user_metadata?.full_name && !user.user_metadata?.display_name && {
            displayName: user.user_metadata.full_name
          }),
        },
        create: {
          id: user.id,
          email: user.email!,
          avatarUrl: user.user_metadata?.avatar_url || null,
          displayName: user.user_metadata?.full_name || null,
        },
      })
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
}
