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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { bulkAddItemsToPlaylist } from "@/app/actions/playlists"
import { toast } from "sonner"
import { ListPlus } from "lucide-react"

export function BulkAddDialog({ playlistId }: { playlistId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("")
  const router = useRouter()

  const handleBulkAdd = async () => {
    setLoading(true)

    try {
      // Split by newlines and filter out empty lines
      const codes = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      if (codes.length === 0) {
        toast.error("Please enter at least one video code")
        return
      }

      const count = await bulkAddItemsToPlaylist(playlistId, codes)
      toast.success(`Added ${count} video codes!`)
      setText("")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to add codes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ListPlus className="h-5 w-5" />
              Bulk Add
            </CardTitle>
            <CardDescription>
              Paste multiple video codes at once
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Add Video Codes</DialogTitle>
          <DialogDescription>
            Paste multiple video codes, one per line. They'll be automatically normalized.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-codes">Video Codes</Label>
            <Textarea
              id="bulk-codes"
              placeholder={"SSIS-123\nIPX-920\nABP-777\nwaaa412\n..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              {text.split('\n').filter(l => l.trim().length > 0).length} codes to add
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleBulkAdd} disabled={loading}>
            {loading ? "Adding..." : "Add All Codes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
