"use client"

import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface PlaylistItem {
  id: string
  normalizedCode: string
  videoCode: string
  note: string | null
}

interface SourceTemplate {
  id: string
  name: string
  baseTemplate: string
  isDefault: boolean
}

interface SmartActionToolbarProps {
  allItems: PlaylistItem[]
  selectedItems: PlaylistItem[]
  templates: SourceTemplate[]
  playlistId: string
  playlistName: string
  onClearSelection: () => void
  onOpenAddDialog: () => void
  onDelete: () => void
}

export function SmartActionToolbar({
  allItems,
  selectedItems,
  templates,
  playlistId,
  playlistName,
  onClearSelection,
  onOpenAddDialog,
  onDelete,
}: SmartActionToolbarProps) {
  const hasSelection = selectedItems.length > 0
  const itemCount = selectedItems.length

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Status */}
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-black">
              {hasSelection ? (
                <span>
                  <span className="font-bold text-black">{selectedItems.length}</span>
                  <span className="text-gray-500 mx-1">of</span>
                  <span>{allItems.length}</span>
                  <span className="text-gray-500 ml-1">selected</span>
                </span>
              ) : (
                <span>
                  <span className="font-bold">{allItems.length}</span>
                  <span className="text-gray-500 ml-1">{allItems.length === 1 ? 'item' : 'items'}</span>
                </span>
              )}
            </div>
            {hasSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-7 px-2 text-xs text-gray-600 hover:text-black"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Add Button */}
            <Button
              size="sm"
              onClick={onOpenAddDialog}
              className="bg-black hover:bg-gray-800 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Add</span>
            </Button>

            {/* Delete (only show when items are selected) */}
            {hasSelection && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="shadow-sm text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Delete ({itemCount})</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
