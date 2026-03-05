"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SmartActionToolbar } from "./smart-action-toolbar"
import { PlaylistManager } from "./playlist-manager"
import { UnifiedAddVideosDialog } from "./unified-add-videos-dialog"
import { trackDeleteItems } from "@/lib/analytics"

interface PlaylistItem {
  id: string
  videoCode: string
  normalizedCode: string
  note: string | null
  position: number
  createdAt: Date
}

interface SourceTemplate {
  id: string
  name: string
  baseTemplate: string
  isDefault: boolean
}

interface PlaylistPageClientProps {
  playlistId: string
  playlistName: string
  items: PlaylistItem[]
  templates: SourceTemplate[]
}

export function PlaylistPageClient({
  playlistId,
  playlistName,
  items,
  templates,
}: PlaylistPageClientProps) {
  const [selectedItems, setSelectedItems] = useState<PlaylistItem[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const router = useRouter()

  const handleClearSelection = () => {
    setSelectedItems([])
  }

  const handleOpenAddDialog = () => {
    setShowAddDialog(true)
  }

  const handleDelete = async () => {
    if (selectedItems.length === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'}?`)) {
      return
    }

    try {
      // Import the delete action
      const { bulkDeletePlaylistItems } = await import("@/app/actions/playlists")
      await bulkDeletePlaylistItems(selectedItems.map(item => item.id))

      // Track event
      trackDeleteItems({
        playlist_id: playlistId,
        item_count: selectedItems.length,
      })

      toast.success(`Deleted ${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'}!`)
      setSelectedItems([])
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete items")
    }
  }

  return (
    <>
      {/* Smart Action Toolbar */}
      <SmartActionToolbar
        allItems={items}
        selectedItems={selectedItems}
        templates={templates}
        playlistId={playlistId}
        playlistName={playlistName}
        onClearSelection={handleClearSelection}
        onOpenAddDialog={handleOpenAddDialog}
        onDelete={handleDelete}
      />

      {/* Playlist Table */}
      <PlaylistManager
        playlistId={playlistId}
        items={items}
        onSelectionChange={setSelectedItems}
      />

      {/* Add Videos Dialog */}
      <UnifiedAddVideosDialog
        playlistId={playlistId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        existingItems={items}
      />
    </>
  )
}
