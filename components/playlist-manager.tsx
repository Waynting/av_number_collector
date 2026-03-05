"use client"

import { PlaylistItemsTable } from "./playlist-items-table"

interface PlaylistItem {
  id: string
  videoCode: string
  normalizedCode: string
  note: string | null
  position: number
  createdAt: Date
}

interface PlaylistManagerProps {
  playlistId: string
  items: PlaylistItem[]
  onSelectionChange: (items: PlaylistItem[]) => void
}

export function PlaylistManager({
  playlistId,
  items,
  onSelectionChange,
}: PlaylistManagerProps) {
  return (
    <PlaylistItemsTable
      playlistId={playlistId}
      items={items}
      onSelectionChange={onSelectionChange}
    />
  )
}
