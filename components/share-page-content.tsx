"use client"

import { useState, useMemo } from "react"
import { Copy, Check, ExternalLink, StickyNote, Plus, ChevronDown, ChevronUp, Search } from "lucide-react"
import { toast } from "sonner"
import { DEFAULT_TEMPLATES } from "@/lib/default-templates"
import { AddItemsToPlaylistDialog } from "@/components/add-items-to-playlist-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface PlaylistItem {
  id: string
  normalizedCode: string
  videoCode: string
  note: string | null
}

interface SharePageContentProps {
  items: PlaylistItem[]
  playlistId: string
  isAuthenticated: boolean
  isOwner: boolean
}

export function SharePageContent({
  items,
  playlistId,
  isAuthenticated,
  isOwner,
}: SharePageContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items

    const query = searchQuery.toLowerCase()
    return items.filter(item =>
      item.normalizedCode.toLowerCase().includes(query) ||
      item.videoCode.toLowerCase().includes(query) ||
      (item.note && item.note.toLowerCase().includes(query))
    )
  }, [items, searchQuery])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">This playlist is empty.</p>
      </div>
    )
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Copied ${code}!`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCopyUrl = (url: string, sourceName: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast.success(`Copied ${sourceName} link!`)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by code or note..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 border-2 border-gray-300 focus:border-black text-base"
        />
        {searchQuery && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {filteredItems.length} of {items.length}
          </div>
        )}
      </div>

      {/* Action Bar - Add All Items */}
      {isAuthenticated && !isOwner && filteredItems.length > 0 && (
        <div className="bg-black text-white border-2 border-black rounded-lg p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Want to save these codes?</h3>
              <p className="text-sm text-gray-300">
                Add {searchQuery ? `${filteredItems.length} filtered` : `all ${items.length}`} {filteredItems.length === 1 ? "code" : "codes"} to your collection
              </p>
            </div>
            <AddItemsToPlaylistDialog
              sourcePlaylistId={playlistId}
              items={searchQuery ? filteredItems : items}
              trigger={
                <Button className="bg-white text-black hover:bg-gray-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Add {searchQuery ? "Filtered" : "All"} to My Playlist
                </Button>
              }
            />
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-gray-600 mb-4">
            Want to save these codes to your own collection?
          </p>
          <Link href="/login">
            <Button className="bg-black hover:bg-gray-800 text-white">
              Sign In to Save
            </Button>
          </Link>
        </div>
      )}

      {/* No Results */}
      {filteredItems.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-600">No codes found matching "{searchQuery}"</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-4"
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Video Items */}
      {filteredItems.map((item, index) => {
        const isExpanded = expandedItems.has(item.id)

        return (
          <div
          key={item.id}
          className="border-2 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg overflow-hidden"
        >
          {/* Video Code Header */}
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-400">#{index + 1}</span>
              <h3 className="text-lg font-bold font-mono">{item.normalizedCode}</h3>
            </div>
            <div className="flex items-center gap-2">
              {item.note && (
                <StickyNote className="h-4 w-4 text-gray-400" />
              )}
              {/* Copy Code Button */}
              <button
                onClick={() => handleCopyCode(item.normalizedCode)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-800 transition-all rounded"
                title="Copy code"
              >
                {copiedCode === item.normalizedCode ? (
                  <Check className="h-4 w-4 text-green-400" strokeWidth={3} />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Author Note */}
          {item.note && (
            <div className="px-4 py-3 bg-gray-50 border-b-2 border-gray-200">
              <div className="flex items-start gap-2">
                <StickyNote className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Author's Note</p>
                  <p className="text-sm text-black whitespace-pre-wrap">{item.note}</p>
                </div>
              </div>
            </div>
          )}

          {/* Source Links - Collapsible */}
          <div className="border-t-2 border-gray-200">
            <button
              onClick={() => toggleExpanded(item.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-gray-600">AVAILABLE SOURCES</p>
                <span className="text-xs text-gray-500">({DEFAULT_TEMPLATES.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {isAuthenticated && !isOwner && (
                  <AddItemsToPlaylistDialog
                    sourcePlaylistId={playlistId}
                    items={[item]}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    }
                  />
                )}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-2 space-y-2 bg-gray-50">
                {DEFAULT_TEMPLATES.map((template) => {
                  const url = template.baseTemplate.replace("{code}", item.normalizedCode)
                  const isCopied = copiedUrl === url

                  return (
                    <div
                      key={template.id}
                      className="group flex items-center gap-3 p-3 bg-white hover:bg-gray-100 border border-gray-200 hover:border-black transition-all rounded"
                    >
                      {/* Source Icon */}
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold text-xs">
                        {template.name.substring(0, 2).toUpperCase()}
                      </div>

                      {/* Source Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-black mb-0.5">
                          {template.name}
                        </p>
                        <p className="text-xs font-mono text-gray-600 truncate">{url}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Open Link */}
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-all rounded"
                          title="Open link"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyUrl(url, template.name)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-all rounded"
                          title="Copy link"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-600" strokeWidth={3} />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        )
      })}
    </div>
  )
}
