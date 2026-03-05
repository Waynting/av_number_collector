"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Share2, Download, Globe } from "lucide-react"
import Link from "next/link"
import { deletePlaylist, updatePlaylist } from "@/app/actions/playlists"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Playlist {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  shareSlug: string | null
  _count: { items: number }
}

export function PlaylistHeader({ playlist }: { playlist: Playlist }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deletePlaylist(playlist.id)
      toast.success("Playlist deleted")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await updatePlaylist(playlist.id, formData)
      toast.success("Playlist updated")
      setEditOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update")
    } finally {
      setLoading(false)
    }
  }

  const togglePublic = async () => {
    const formData = new FormData()
    formData.set("name", playlist.name)
    formData.set("description", playlist.description || "")
    formData.set("isPublic", (!playlist.isPublic).toString())

    try {
      await updatePlaylist(playlist.id, formData)
      toast.success(playlist.isPublic ? "Playlist is now private" : "Playlist is now public")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update")
    }
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{playlist.name}</h1>
            {playlist.isPublic && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                <Globe className="h-3 w-3" />
                Public
              </span>
            )}
          </div>
          {playlist.description && (
            <p className="text-slate-600 mt-2">{playlist.description}</p>
          )}
          <p className="text-sm text-slate-500 mt-2">
            {playlist._count.items} {playlist._count.items === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={togglePublic}>
            <Share2 className="h-4 w-4 mr-2" />
            {playlist.isPublic ? "Make Private" : "Make Public"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Playlist</DialogTitle>
              <DialogDescription>
                Update your playlist details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={playlist.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={playlist.description || ""}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Playlist?</DialogTitle>
            <DialogDescription>
              This will permanently delete "{playlist.name}" and all its items.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete Playlist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
