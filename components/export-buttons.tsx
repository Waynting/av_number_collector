"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Export & Share</CardTitle>
        <CardDescription>Download or share your playlist</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full" onClick={handleCopyAll}>
          <Copy className="h-4 w-4 mr-2" />
          Copy All Codes
        </Button>
        <Button variant="outline" className="w-full" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Export as TXT
        </Button>
        {isPublic && shareSlug && (
          <Button variant="outline" className="w-full" onClick={handleCopyShareLink}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Copy Share Link
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
