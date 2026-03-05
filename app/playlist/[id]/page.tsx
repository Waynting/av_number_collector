import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { PlaylistHeader } from "@/components/playlist-header"
import { PlaylistPageClient } from "@/components/playlist-page-client"
import { mergeTemplates } from "@/lib/default-templates"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlaylistPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [playlist, userTemplates] = await Promise.all([
    prisma.playlist.findFirst({
      where: { id, userId: user.id },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.sourceTemplate.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    }),
  ])

  if (!playlist) {
    notFound()
  }

  // Merge user templates with default built-in templates
  const allTemplates = mergeTemplates(userTemplates)

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 md:pb-8">
      <PlaylistHeader playlist={playlist} />

      <PlaylistPageClient
        playlistId={playlist.id}
        playlistName={playlist.name}
        items={playlist.items}
        templates={allTemplates}
      />
    </div>
  )
}
