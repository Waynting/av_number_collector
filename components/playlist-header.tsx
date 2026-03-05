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
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Playlists
          </Link>
        </Button>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-soft mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">
            {/* Title and badges */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight break-words">{playlist.name}</h1>
              {playlist.isPublic && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm flex-shrink-0">
                  <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Public
                </span>
              )}
            </div>

            {/* Description */}
            {playlist.description && (
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg mb-4 max-w-2xl leading-relaxed">{playlist.description}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="font-medium text-slate-700">{playlist._count.items}</span>
                <span>{playlist._count.items === 1 ? 'video code' : 'video codes'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 lg:ml-6">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePublic}
              className="shadow-sm hover:shadow transition-smooth flex-1 sm:flex-initial"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">{playlist.isPublic ? "Private" : "Public"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="shadow-sm hover:shadow transition-smooth flex-1 sm:flex-initial"
            >
              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="shadow-sm hover:shadow transition-smooth text-red-600 hover:text-red-700 hover:border-red-300 flex-1 sm:flex-initial"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
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
