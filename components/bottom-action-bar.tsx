"use client"

import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"
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
  const itemCount = itemsToUse.length

  if (allItems.length === 0) {
    return null
  }

  const handleCopy = () => {
    const codes = itemsToUse.map(item => item.normalizedCode).join('\n')
    navigator.clipboard.writeText(codes)
    toast.success(`Copied ${itemCount} ${itemCount === 1 ? 'code' : 'codes'}!`)
  }

  const handleExport = () => {
    const codes = itemsToUse.map(item => item.normalizedCode).join('\n')
    const blob = new Blob([codes], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${playlistName}-${hasSelection ? 'selected' : 'all'}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${itemCount} ${itemCount === 1 ? 'code' : 'codes'}!`)
  }

  return (
    <div className="sticky bottom-0 z-40 bg-white border-t-2 border-black">
      <div className="px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-center gap-3">
          {/* Generate Links - New Popover */}
          <LinkGeneratorPopover items={itemsToUse} />

          {/* Copy Codes Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shadow-sm border-2 border-gray-300 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Copy className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Copy Codes</span>
            <span className="ml-1.5 text-xs text-gray-500">({itemCount})</span>
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="shadow-sm border-2 border-gray-300 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Download className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Export TXT</span>
            <span className="ml-1.5 text-xs text-gray-500">({itemCount})</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
