"use client"

import { useState, useMemo } from "react"
import { adminDeletePlaylist } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ExternalLink, Loader2, Lock, Globe, Search } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Playlist {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  shareSlug: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
  }
  _count: {
    items: number
  }
  items: Array<{
    id: string
    normalizedCode: string
    note: string | null
  }>
}

interface AdminAllPlaylistsTableProps {
  playlists: Playlist[]
}

export function AdminAllPlaylistsTable({ playlists }: AdminAllPlaylistsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter playlists based on search query
  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return playlists

    const query = searchQuery.toLowerCase()
    return playlists.filter((playlist) => {
      const nameMatch = playlist.name.toLowerCase().includes(query)
      const descriptionMatch = playlist.description?.toLowerCase().includes(query)
      const emailMatch = playlist.user.email.toLowerCase().includes(query)
      const displayNameMatch = playlist.user.displayName?.toLowerCase().includes(query)

      return nameMatch || descriptionMatch || emailMatch || displayNameMatch
    })
  }, [playlists, searchQuery])

  const handleDeleteClick = (playlist: Playlist) => {
    setPlaylistToDelete(playlist)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!playlistToDelete) return

    setDeletingId(playlistToDelete.id)
    try {
      const result = await adminDeletePlaylist(playlistToDelete.id)
      toast.success(result.message)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete playlist")
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setPlaylistToDelete(null)
    }
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜尋列表名稱或用戶名稱... / Search playlist or user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            找到 {filteredPlaylists.length} 個結果 / Found {filteredPlaylists.length} results
          </p>
        )}
      </div>

      <div className="space-y-4">
        {filteredPlaylists.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">沒有找到結果</h3>
            <p className="text-gray-600">嘗試使用不同的搜尋關鍵字</p>
          </div>
        ) : (
          filteredPlaylists.map((playlist) => (
          <div
            key={playlist.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-semibold text-lg text-black truncate">
                    {playlist.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {playlist.isPublic ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                        <Globe className="h-3 w-3" />
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                      {playlist._count.items} items
                    </span>
                  </div>
                </div>

                {playlist.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {playlist.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Creator:</span>
                    <span>{playlist.user.displayName || playlist.user.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Created:</span>
                    <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Updated:</span>
                    <span>{new Date(playlist.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Preview Items */}
                {playlist.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Preview:</p>
                    <div className="flex flex-wrap gap-2">
                      {playlist.items.map((item) => (
                        <span
                          key={item.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                        >
                          {item.normalizedCode}
                        </span>
                      ))}
                      {playlist._count.items > playlist.items.length && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{playlist._count.items - playlist.items.length} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/playlist/${playlist.id}`} target="_blank">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(playlist)}
                  disabled={deletingId === playlist.id}
                  className="gap-2"
                >
                  {deletingId === playlist.id ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  You are about to delete the playlist <strong>&quot;{playlistToDelete?.name}&quot;</strong> created by{" "}
                  <strong>{playlistToDelete?.user.email}</strong>.
                </p>
                <p className="mt-2">
                  This playlist contains <strong>{playlistToDelete?._count.items} items</strong> and is{" "}
                  <strong>{playlistToDelete?.isPublic ? "public" : "private"}</strong>.
                </p>
                <p className="mt-2 text-red-600 font-semibold">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Playlist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
