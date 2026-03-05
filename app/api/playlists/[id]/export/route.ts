import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const playlist = await prisma.playlist.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        orderBy: { position: 'asc' },
      },
    },
  })

  if (!playlist) {
    return new NextResponse('Playlist not found', { status: 404 })
  }

  // Generate text content
  const textContent = playlist.items
    .map((item: typeof playlist.items[0]) => item.normalizedCode)
    .join('\n')

  // Return as downloadable .txt file
  return new NextResponse(textContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${playlist.name.replace(/[^a-z0-9]/gi, '_')}.txt"`,
    },
  })
}
