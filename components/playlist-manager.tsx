"use client"

import { useState, useRef } from "react"
import { PlaylistItemsTable } from "./playlist-items-table"
import { FloatingActionBar } from "./floating-action-bar"
import { GenerateLinksDialog } from "./generate-links-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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

interface PlaylistManagerProps {
  playlistId: string
  items: PlaylistItem[]
  templates: SourceTemplate[]
}

export function PlaylistManager({ playlistId, items, templates }: PlaylistManagerProps) {
  const [selectedItems, setSelectedItems] = useState<PlaylistItem[]>([])
  const [showGenerateLinks, setShowGenerateLinks] = useState(false)
  const router = useRouter()

  const handleClearSelection = () => {
    setSelectedItems([])
  }

  const handleGenerateLinks = () => {
    if (templates.length === 0) {
      toast.error("Please set up source templates in Settings first")
      return
    }
    setShowGenerateLinks(true)
  }

  const handleExport = () => {
    const codes = selectedItems.map(item => item.normalizedCode).join('\n')
    const blob = new Blob([codes], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selected-codes-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${selectedItems.length} codes!`)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'}?`)) {
      return
    }

    try {
      // Import the delete action
      const { bulkDeletePlaylistItems } = await import("@/app/actions/playlists")
      await bulkDeletePlaylistItems(selectedItems.map(item => item.id))
      toast.success(`Deleted ${selectedItems.length} ${selectedItems.length === 1 ? 'item' : 'items'}!`)
      setSelectedItems([])
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete items")
    }
  }

  return (
    <>
      <PlaylistItemsTable
        playlistId={playlistId}
        items={items}
        onSelectionChange={setSelectedItems}
      />

      <FloatingActionBar
        selectedItems={selectedItems}
        onClearSelection={handleClearSelection}
        onGenerateLinks={handleGenerateLinks}
        onExport={handleExport}
        onDelete={handleDelete}
      />

      {/* Generate Links Dialog for selected items */}
      {showGenerateLinks && selectedItems.length > 0 && (
        <GenerateLinksDialog
          items={selectedItems}
          templates={templates}
          open={showGenerateLinks}
          onOpenChange={setShowGenerateLinks}
        />
      )}
    </>
  )
}
