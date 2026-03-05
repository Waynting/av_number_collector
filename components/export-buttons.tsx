"use client"

import { Button } from "@/components/ui/button"
import { Download, Copy, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"

interface ExportButtonsProps {
  playlistId: string
  playlistName: string
  items: Array<{ normalizedCode: string }>
  shareSlug: string | null
  isPublic: boolean
}

export function ExportButtons({
  playlistId,
  playlistName,
  items,
  shareSlug,
  isPublic,
}: ExportButtonsProps) {
  const handleCopyAll = () => {
    const codes = items.map(item => item.normalizedCode).join('\n')
    navigator.clipboard.writeText(codes)
    toast.success(`Copied ${items.length} codes to clipboard!`)
  }

  const handleCopyShareLink = () => {
    if (!shareSlug) {
      toast.error("No share link available")
      return
    }

    const shareUrl = `${window.location.origin}/share/${shareSlug}`
    navigator.clipboard.writeText(shareUrl)
    toast.success("Share link copied to clipboard!")
  }

  const handleDownload = () => {
    window.open(`/api/playlists/${playlistId}/export`, '_blank')
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-soft overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-black rounded-lg">
            <Download className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-black">Export & Share</h3>
        </div>
        <p className="text-sm text-gray-600">Download or share your playlist</p>
      </div>
      <div className="p-6 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start shadow-sm hover:shadow hover:bg-gray-50 transition-smooth"
          onClick={handleCopyAll}
        >
          <Copy className="h-4 w-4 mr-3 text-gray-600" />
          <span className="flex-1 text-left">Copy All Codes</span>
          <span className="text-xs text-gray-500">{items.length}</span>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start shadow-sm hover:shadow hover:bg-gray-50 transition-smooth"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-3 text-gray-600" />
          <span className="flex-1 text-left">Export as TXT</span>
        </Button>
        {isPublic && shareSlug && (
          <Button
            variant="outline"
            className="w-full justify-start shadow-sm hover:shadow hover:bg-gray-50 hover:border-gray-400 transition-smooth group"
            onClick={handleCopyShareLink}
          >
            <LinkIcon className="h-4 w-4 mr-3 text-gray-600 group-hover:text-black" />
            <span className="flex-1 text-left">Copy Share Link</span>
            <span className="text-xs px-2 py-0.5 bg-black text-white rounded-md font-medium">Public</span>
          </Button>
        )}
      </div>
    </div>
  )
}
