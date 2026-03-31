"use client"

import { useState, useMemo } from "react"
import { Copy, Check, ExternalLink, StickyNote, Plus, ChevronDown, ChevronUp, Search } from "lucide-react"
import { toast } from "sonner"
import { DEFAULT_TEMPLATES } from "@/lib/default-templates"
import { AddItemsToPlaylistDialog } from "@/components/add-items-to-playlist-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { trackEvent } from "@/lib/analytics"

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

    // Track event
    trackEvent("copy_code_from_share", {
      playlist_id: playlistId,
      code: code,
    })

    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCopyUrl = (url: string, sourceName: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast.success(`Copied ${sourceName} link!`)

    // Track event
    trackEvent("copy_url_from_share", {
      playlist_id: playlistId,
      source_name: sourceName,
    })

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
          className="pl-10 h-12 text-base"
        />
        {searchQuery && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {filteredItems.length} of {items.length}
          </div>
        )}
      </div>

      {/* Action Bar - Add All Items */}
      {isAuthenticated && !isOwner && filteredItems.length > 0 && (
        <div className="bg-zinc-900 text-white rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold mb-1">Want to save these codes?</h3>
              <p className="text-sm text-zinc-400">
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
        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 sm:p-6 text-center">
          <p className="text-zinc-500 mb-4">
            Want to save these codes to your own collection?
          </p>
          <Link href="/login">
            <Button>
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
          className="border border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-sm transition-all duration-150 rounded-xl overflow-hidden"
        >
          {/* Video Code Header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-300">#{index + 1}</span>
              <h3 className="text-base font-semibold font-mono text-zinc-900">{item.normalizedCode}</h3>
              {item.note && (
                <StickyNote className="h-3.5 w-3.5 text-zinc-300" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && !isOwner ? (
                <AddItemsToPlaylistDialog
                  sourcePlaylistId={playlistId}
                  items={[item]}
                  trigger={
                    <button
                      className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-700 transition-all duration-150 rounded-lg text-xs font-medium whitespace-nowrap"
                      title="Add to my playlist"
                    >
                      加入清單
                    </button>
                  }
                />
              ) : !isAuthenticated ? (
                <Link href="/login">
                  <button
                    className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-700 transition-all duration-150 rounded-lg text-xs font-medium whitespace-nowrap"
                    title="Sign in to add to your playlist"
                  >
                    加入清單
                  </button>
                </Link>
              ) : null}
              <button
                onClick={() => handleCopyCode(item.normalizedCode)}
                className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 transition-all duration-150 rounded-lg"
                title="Copy code"
              >
                {copiedCode === item.normalizedCode ? (
                  <Check className="h-4 w-4 text-green-600" strokeWidth={3} />
                ) : (
                  <Copy className="h-4 w-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          {/* Author Note */}
          {item.note && (
            <div className="px-4 py-2.5">
              <div className="flex items-start gap-2">
                <StickyNote className="h-3.5 w-3.5 text-zinc-300 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-zinc-600 whitespace-pre-wrap">{item.note}</p>
              </div>
            </div>
          )}

          {/* Source Links - Collapsible */}
          <div>
            <button
              onClick={() => toggleExpanded(item.id)}
              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-zinc-50 transition-colors duration-150 border-t border-zinc-100"
            >
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-zinc-400">Sources</p>
                <span className="text-xs text-zinc-300">({DEFAULT_TEMPLATES.length})</span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-zinc-300" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-300" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-1 space-y-1.5">
                {DEFAULT_TEMPLATES.map((template) => {
                  const url = template.baseTemplate.replace("{code}", item.normalizedCode)
                  const isCopied = copiedUrl === url

                  return (
                    <div
                      key={template.id}
                      className="group flex items-center gap-3 p-2.5 hover:bg-zinc-50 transition-all duration-150 rounded-lg"
                    >
                      {/* Source Icon */}
                      <div className="flex-shrink-0 w-7 h-7 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center font-semibold text-xs">
                        {template.name.substring(0, 2).toUpperCase()}
                      </div>

                      {/* Source Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-800">
                          {template.name}
                        </p>
                        <p className="text-xs font-mono text-zinc-400 truncate">{url}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 transition-all duration-150 rounded-lg"
                          title="Open link"
                        >
                          <ExternalLink className="h-4 w-4 text-zinc-400" />
                        </a>
                        <button
                          onClick={() => handleCopyUrl(url, template.name)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 transition-all duration-150 rounded-lg"
                          title="Copy link"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-600" strokeWidth={3} />
                          ) : (
                            <Copy className="h-4 w-4 text-zinc-400" />
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
