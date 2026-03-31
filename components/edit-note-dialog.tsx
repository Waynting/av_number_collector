"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { updatePlaylistItemNote } from "@/app/actions/playlists"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

interface EditNoteDialogProps {
  itemId: string
  videoCode: string
  currentNote: string | null
}

export function EditNoteDialog({ itemId, videoCode, currentNote }: EditNoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState(currentNote || "")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updatePlaylistItemNote(itemId, note)
      toast.success("Note updated")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update note")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-gray-100 hover:text-black transition-smooth h-8 w-8 sm:h-9 sm:w-9 p-0"
        >
          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Add or edit a note for <code className="px-1.5 py-0.5 bg-gray-100 text-black rounded text-sm font-semibold">{videoCode}</code>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="note" className="text-sm font-semibold text-black">
              Note
            </Label>
            <Textarea
              id="note"
              placeholder="Add a note about this video..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              className="mt-2 min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className=""
            >
              {loading ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
