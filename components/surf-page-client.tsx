"use client"

import { useState, useTransition, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, User, Copy, Heart } from "lucide-react"
import Link from "next/link"
import { searchPublicPlaylists } from "@/app/actions/surf"
import { CopyPlaylistDialog } from "@/components/copy-playlist-dialog"
import { FavoriteButton } from "@/components/favorite-button"
import { checkIsFavorited } from "@/app/actions/favorites"
import { trackSearchPublicPlaylists } from "@/lib/analytics"

interface PlaylistItem {
  normalizedCode: string
}

interface Playlist {
  id: string
  name: string
  description: string | null
  shareSlug: string | null
  updatedAt: Date
  user: {
    displayName: string | null
    avatarUrl: string | null
  }
  _count: {
    items: number
  }
  items: PlaylistItem[]
}

interface SurfPageClientProps {
  initialPlaylists: Playlist[]
}

export function SurfPageClient({ initialPlaylists }: SurfPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [playlists, setPlaylists] = useState(initialPlaylists)
  const [isPending, startTransition] = useTransition()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const results = await searchPublicPlaylists(searchQuery)
      setPlaylists(results)

      // Track search event
      trackSearchPublicPlaylists({
        query: searchQuery,
        results_count: results.length,
      })
    })
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search playlists by name, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="px-6"
          >
            {isPending ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      {/* Results */}
      {playlists.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-xl">
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <Search className="h-10 w-10 sm:h-12 sm:w-12 text-zinc-300 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 mb-2">
              No playlists found
            </h3>
            <p className="text-zinc-500 text-center max-w-md text-sm sm:text-base">
              {searchQuery
                ? `No public playlists match "${searchQuery}". Try a different search term.`
                : "No public playlists available yet. Be the first to share one!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {playlists.map((playlist) => {
            const creatorName = playlist.user.displayName || "Anonymous User"
            return (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                creatorName={creatorName}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function PlaylistCard({
  playlist,
  creatorName,
}: {
  playlist: Playlist
  creatorName: string
}) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true)

  // Check if favorited on mount
  useEffect(() => {
    checkIsFavorited(playlist.id).then((result) => {
      setIsFavorited(result)
      setIsCheckingFavorite(false)
    })
  }, [playlist.id])

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all duration-150 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-semibold text-zinc-900 line-clamp-2">
            {playlist.name}
          </h3>
          {!isCheckingFavorite && (
            <FavoriteButton
              playlistId={playlist.id}
              initialIsFavorited={isFavorited}
            />
          )}
        </div>

        {playlist.description && (
          <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
            {playlist.description}
          </p>
        )}

        {/* Creator Info */}
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <User className="h-4 w-4" />
          <span>
            By <span className="font-medium text-zinc-700">{creatorName}</span>
          </span>
        </div>
      </div>

      {/* Preview Codes */}
      {playlist.items.length > 0 && (
        <div className="px-6 py-3 border-t border-zinc-100">
          <p className="text-xs font-medium text-zinc-400 mb-2">PREVIEW</p>
          <div className="flex flex-wrap gap-1.5">
            {playlist.items.map((item, index) => (
              <code
                key={index}
                className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-md text-xs font-medium"
              >
                {item.normalizedCode}
              </code>
            ))}
            {playlist._count.items > 3 && (
              <span className="px-2.5 py-1 text-xs text-gray-500">
                +{playlist._count.items - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats & Actions */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center text-zinc-900">
              <span className="font-semibold">{playlist._count.items}</span>
              <span className="text-zinc-400 ml-1">
                {playlist._count.items === 1 ? "code" : "codes"}
              </span>
            </div>
            <div className="text-xs text-zinc-400">
              Updated {new Date(playlist.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/share/${playlist.shareSlug}`}
            className="flex-1"
          >
            <Button
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
          <CopyPlaylistDialog
            playlistId={playlist.id}
            playlistName={playlist.name}
            itemCount={playlist._count.items}
          />
        </div>
      </div>
    </div>
  )
}
