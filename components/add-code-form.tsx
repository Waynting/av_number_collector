"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addItemToPlaylist } from "@/app/actions/playlists"
import { toast } from "sonner"
import { Plus, Link2, CheckCircle2, XCircle } from "lucide-react"
import { parseVideoInput, type ParseResult } from "@/lib/url-parser"

export function AddCodeForm({ playlistId }: { playlistId: string }) {
  const [loading, setLoading] = useState(false)
  const [videoCode, setVideoCode] = useState("")
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const router = useRouter()

  // Parse input in real-time
  useEffect(() => {
    if (videoCode.trim()) {
      const result = parseVideoInput(videoCode)
      setParseResult(result)
    } else {
      setParseResult(null)
    }
  }, [videoCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!parseResult?.success) {
      toast.error(parseResult?.error || "Invalid input")
      return
    }

    setLoading(true)

    try {
      // Use the parsed code (either extracted from URL or direct input)
      await addItemToPlaylist(playlistId, parseResult.normalizedCode!)
      toast.success("Video code added!")
      setVideoCode("")
      setParseResult(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to add code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden">
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Add Video</h3>
        </div>
        <p className="text-sm text-slate-600">Paste a URL or enter a video code</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-code" className="text-sm font-semibold text-slate-700">
              Video URL or Code
            </Label>
            <Input
              id="video-code"
              placeholder="e.g., SSIS-123, fc2-ppv-1234567, or URL"
              value={videoCode}
              onChange={(e) => setVideoCode(e.target.value)}
              required
              disabled={loading}
              className="shadow-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />

            {/* Parse preview */}
            {parseResult && (
              <div className="space-y-2">
                {parseResult.success ? (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-900 mb-1">
                        {parseResult.source === 'url' ? '✓ Extracted from URL' : '✓ Valid code'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-700">Will add:</span>
                        <code className="px-2 py-1 bg-white border border-green-300 text-green-800 rounded text-xs font-semibold">
                          {parseResult.normalizedCode}
                        </code>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-red-900 mb-1">Invalid input</p>
                      <p className="text-xs text-red-700">{parseResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!parseResult && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Link2 className="h-3.5 w-3.5" />
                <span>Supports URLs from missav, javdb, FC2, and direct codes</span>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full shadow-sm hover:shadow transition-smooth"
            disabled={loading || !parseResult?.success}
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : "Add Video"}
          </Button>
        </form>
      </div>
    </div>
  )
}
