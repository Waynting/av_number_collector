"use client"

import { LinkGeneratorPopover } from "@/components/link-generator-popover"

interface PlaylistItem {
  id: string
  normalizedCode: string
  videoCode: string
  note: string | null
}

interface BottomActionBarProps {
  allItems: PlaylistItem[]
  selectedItems: PlaylistItem[]
  playlistName: string
}

export function BottomActionBar({
  allItems,
  selectedItems,
  playlistName,
}: BottomActionBarProps) {
  const hasSelection = selectedItems.length > 0
  const itemsToUse = hasSelection ? selectedItems : allItems

  if (allItems.length === 0) {
    return null
  }

  return (
    <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-sm border-t border-zinc-200/80 mb-16 md:mb-0">
      <div className="px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-center">
          {/* Generate Links - Popover */}
          <LinkGeneratorPopover items={itemsToUse} />
        </div>
      </div>
    </div>
  )
}
