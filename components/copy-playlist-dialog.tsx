"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { copyPlaylistToUser } from "@/app/actions/surf"
import { trackCopyPublicPlaylist } from "@/lib/analytics"

interface CopyPlaylistDialogProps {
  playlistId: string
  playlistName: string
  itemCount: number
}

export function CopyPlaylistDialog({
  playlistId,
  playlistName,
  itemCount,
}: CopyPlaylistDialogProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState(`Copy of ${playlistName}`)
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCopy = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newName.trim()) {
      toast.error("Please enter a playlist name")
      return
    }

    setIsLoading(true)

    try {
      const newPlaylist = await copyPlaylistToUser(
        playlistId,
        newName.trim(),
        description.trim() || undefined
      )

      // Track event
      trackCopyPublicPlaylist({
        source_playlist_id: playlistId,
        item_count: itemCount,
      })

      toast.success(
        `Successfully copied ${itemCount} ${itemCount === 1 ? "code" : "codes"} to "${newName}"!`
      )
      setOpen(false)
      router.push(`/playlist/${newPlaylist.id}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to copy playlist")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-gray-800 text-white">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            Copy Playlist to Your Collection
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            This will create a new playlist with all {itemCount} codes from "{playlistName}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCopy} className="space-y-6 mt-4">
          {/* Preview Info */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Copying from</p>
                <p className="text-lg font-bold text-black">{playlistName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-black">{itemCount}</p>
                <p className="text-xs text-gray-600">{itemCount === 1 ? "code" : "codes"}</p>
              </div>
            </div>
          </div>

          {/* New Playlist Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-black">
              New Playlist Name *
            </Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My Copied Playlist"
              required
              className="border-2 border-gray-300 focus:border-black"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-black">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your new playlist..."
              className="border-2 border-gray-300 focus:border-black min-h-[80px]"
            />
          </div>

          {/* Actions */}
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
              disabled={isLoading}
              className="flex-1 bg-black hover:bg-gray-800 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to My Collection
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
