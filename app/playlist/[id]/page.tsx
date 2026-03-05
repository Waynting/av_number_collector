import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { AddCodeForm } from "@/components/add-code-form"
import { PlaylistManager } from "@/components/playlist-manager"
import { PlaylistHeader } from "@/components/playlist-header"
import { BulkAddDialog } from "@/components/bulk-add-dialog"
import { ExportButtons } from "@/components/export-buttons"
import { GenerateLinksDialog } from "@/components/generate-links-dialog"

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

  const [playlist, templates] = await Promise.all([
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <PlaylistHeader playlist={playlist} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main content - takes 8 columns on large screens */}
        <div className="lg:col-span-8 xl:col-span-8">
          <PlaylistManager
            playlistId={playlist.id}
            items={playlist.items}
            templates={templates}
          />
        </div>

        {/* Sidebar - takes 4 columns on large screens */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4 lg:space-y-6">
          <AddCodeForm playlistId={playlist.id} />
          <BulkAddDialog playlistId={playlist.id} />
          <GenerateLinksDialog items={playlist.items} templates={templates} />
          <ExportButtons
            playlistId={playlist.id}
            playlistName={playlist.name}
            items={playlist.items}
            shareSlug={playlist.shareSlug}
            isPublic={playlist.isPublic}
          />
        </div>
      </div>
    </div>
  )
}
