"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { addItemToPlaylist } from "@/app/actions/playlists"
import { toast } from "sonner"
import { Plus } from "lucide-react"

export function AddCodeForm({ playlistId }: { playlistId: string }) {
  const [loading, setLoading] = useState(false)
  const [videoCode, setVideoCode] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addItemToPlaylist(playlistId, videoCode)
      toast.success("Video code added!")
      setVideoCode("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to add code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Video Code</CardTitle>
        <CardDescription>Add a single video code to this playlist</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-code">Video Code</Label>
            <Input
              id="video-code"
              placeholder="e.g., SSIS-123"
              value={videoCode}
              onChange={(e) => setVideoCode(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-slate-500">
              Will be normalized (e.g., "ssis123" → "SSIS-123")
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : "Add Code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
