import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { AddCodeForm } from "@/components/add-code-form"
import { PlaylistItemsTable } from "@/components/playlist-items-table"
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
    <div className="space-y-6">
      <PlaylistHeader playlist={playlist} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlaylistItemsTable playlistId={playlist.id} items={playlist.items} />
        </div>

        <div className="space-y-4">
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
