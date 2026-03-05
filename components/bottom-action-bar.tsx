"use client"

import { Button } from "@/components/ui/button"
import { Link as LinkIcon, Copy, Download, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { DEFAULT_TEMPLATES } from "@/lib/default-templates"

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
  onOpenGenerateLinks: () => void
}

export function BottomActionBar({
  allItems,
  selectedItems,
  playlistName,
  onOpenGenerateLinks,
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

  const handleQuickLink = (templateName: string) => {
    const template = DEFAULT_TEMPLATES.find(t => t.name === templateName)
    if (!template) return

    const codes = itemsToUse.map(item => item.normalizedCode)
    const links = codes.map(code => template.baseTemplate.replace('{code}', code))
    const linksText = links.join('\n')

    navigator.clipboard.writeText(linksText)
    toast.success(`Copied ${itemCount} ${template.name} ${itemCount === 1 ? 'link' : 'links'}!`)
  }

  return (
    <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="px-4 sm:px-6 py-4 space-y-3">
        {/* Quick Source Buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-600 mr-1">Quick Links:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickLink('MissAV')}
            className="shadow-sm hover:bg-slate-50 h-7 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            MissAV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickLink('Jable')}
            className="shadow-sm hover:bg-slate-50 h-7 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Jable
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickLink('JAVDB')}
            className="shadow-sm hover:bg-slate-50 h-7 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            JAVDB
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickLink('JavLibrary')}
            className="shadow-sm hover:bg-slate-50 h-7 text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            JavLibrary
          </Button>
        </div>

        {/* Main Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          {/* More Links Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenGenerateLinks}
            className="shadow-sm"
          >
            <LinkIcon className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">More Links</span>
            <span className="ml-1.5 text-xs text-slate-500">({itemCount})</span>
          </Button>

          {/* Copy Codes Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shadow-sm"
          >
            <Copy className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Copy Codes</span>
            <span className="ml-1.5 text-xs text-slate-500">({itemCount})</span>
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="shadow-sm"
          >
            <Download className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Export TXT</span>
            <span className="ml-1.5 text-xs text-slate-500">({itemCount})</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
