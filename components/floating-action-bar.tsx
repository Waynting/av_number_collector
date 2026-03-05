"use client"

import { Button } from "@/components/ui/button"
import { Link as LinkIcon, Copy, Download, Trash2, X } from "lucide-react"
import { toast } from "sonner"

interface PlaylistItem {
  id: string
  normalizedCode: string
  videoCode: string
  note: string | null
}

interface FloatingActionBarProps {
  selectedItems: PlaylistItem[]
  onClearSelection: () => void
  onGenerateLinks: () => void
  onExport: () => void
  onDelete: () => void
}

export function FloatingActionBar({
  selectedItems,
  onClearSelection,
  onGenerateLinks,
  onExport,
  onDelete,
}: FloatingActionBarProps) {
  if (selectedItems.length === 0) {
    return null
  }

  const handleCopy = () => {
    const codes = selectedItems.map(item => item.normalizedCode).join(' ')
    navigator.clipboard.writeText(codes)
    toast.success(`Copied ${selectedItems.length} codes to clipboard!`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent backdrop-blur-sm pointer-events-none" />

      {/* Action bar */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg backdrop-blur-sm">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {selectedItems.length}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base">
                    {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                  </h3>
                  <p className="text-blue-100 text-xs hidden sm:block">
                    Choose an action below
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white px-4 sm:px-6 py-3 sm:py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateLinks}
                className="flex-1 justify-start shadow-sm hover:shadow hover:bg-green-50 hover:border-green-300 transition-smooth group"
              >
                <LinkIcon className="h-4 w-4 mr-2 text-slate-600 group-hover:text-green-600" />
                <span className="hidden sm:inline">Generate Links</span>
                <span className="sm:hidden">Links</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1 justify-start shadow-sm hover:shadow hover:bg-blue-50 hover:border-blue-300 transition-smooth group"
              >
                <Copy className="h-4 w-4 mr-2 text-slate-600 group-hover:text-blue-600" />
                <span className="hidden sm:inline">Copy Codes</span>
                <span className="sm:hidden">Copy</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="flex-1 justify-start shadow-sm hover:shadow hover:bg-amber-50 hover:border-amber-300 transition-smooth group"
              >
                <Download className="h-4 w-4 mr-2 text-slate-600 group-hover:text-amber-600" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex-1 justify-start shadow-sm hover:shadow hover:bg-red-50 hover:border-red-300 transition-smooth group"
              >
                <Trash2 className="h-4 w-4 mr-2 text-slate-600 group-hover:text-red-600" />
                <span className="hidden sm:inline">Delete</span>
                <span className="sm:hidden">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
