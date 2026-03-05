"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, FolderPlus } from "lucide-react"
import { toast } from "sonner"
import { addItemsToUserPlaylist, getUserPlaylistsForDropdown } from "@/app/actions/surf"

interface PlaylistItem {
  id: string
  normalizedCode: string
  videoCode: string
  note: string | null
}

interface AddItemsToPlaylistDialogProps {
  sourcePlaylistId: string
  items: PlaylistItem[]
  trigger?: React.ReactNode
}

export function AddItemsToPlaylistDialog({
  sourcePlaylistId,
  items,
  trigger,
}: AddItemsToPlaylistDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("")
  const [userPlaylists, setUserPlaylists] = useState<
    Array<{ id: string; name: string; _count: { items: number } }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)
  const router = useRouter()

  // Load user's playlists when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoadingPlaylists(true)
      getUserPlaylistsForDropdown()
        .then(setUserPlaylists)
        .catch((error) => {
          toast.error("Failed to load your playlists")
          console.error(error)
        })
        .finally(() => setIsLoadingPlaylists(false))
    }
  }, [open])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPlaylistId) {
      toast.error("Please select a playlist")
      return
    }

    setIsLoading(true)

    try {
      const itemIds = items.map((item) => item.id)
      const count = await addItemsToUserPlaylist(
        selectedPlaylistId,
        sourcePlaylistId,
        itemIds
      )

      toast.success(`Successfully added ${count} ${count === 1 ? "code" : "codes"} to your playlist!`)
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to add items")
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="border-2 border-black hover:bg-black hover:text-white"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add to My Playlist
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            Add Items to Your Playlist
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select which playlist you want to add {items.length} {items.length === 1 ? "code" : "codes"} to
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAdd} className="space-y-6 mt-4">
          {/* Preview Codes */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">CODES TO ADD</p>
            <div className="flex flex-wrap gap-2">
              {items.slice(0, 5).map((item) => (
                <code
                  key={item.id}
                  className="px-2.5 py-1 bg-white border border-gray-300 text-black rounded text-xs font-semibold"
                >
                  {item.normalizedCode}
                </code>
              ))}
              {items.length > 5 && (
                <span className="px-2.5 py-1 text-xs text-gray-500">
                  +{items.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Playlist Selection */}
          <div className="space-y-2">
            <Label htmlFor="playlist" className="text-sm font-semibold text-black">
              Select Destination Playlist *
            </Label>
            {isLoadingPlaylists ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : userPlaylists.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <FolderPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">
                  You don't have any playlists yet
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setOpen(false)
                    router.push("/dashboard/new")
                  }}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Create Your First Playlist
                </Button>
              </div>
            ) : (
              <Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
                <SelectTrigger className="border-2 border-gray-300 focus:border-black">
                  <SelectValue placeholder="Choose a playlist..." />
                </SelectTrigger>
                <SelectContent>
                  {userPlaylists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold">{playlist.name}</span>
                        <span className="text-xs text-gray-500 ml-4">
                          ({playlist._count.items} {playlist._count.items === 1 ? "code" : "codes"})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Actions */}
          {userPlaylists.length > 0 && (
            <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="flex-1 border-2 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !selectedPlaylistId}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Playlist
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
