"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { addItemToPlaylist, bulkAddItemsToPlaylist } from "@/app/actions/playlists"
import { toast } from "sonner"
import { Plus, ListPlus, CheckCircle2, XCircle } from "lucide-react"
import {
  parseVideoInput,
  parseMultipleInputs,
  getParseStats,
  type ParseResult
} from "@/lib/url-parser"

type Mode = "single" | "bulk"

interface UnifiedAddVideosDialogProps {
  playlistId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  existingItems: Array<{ normalizedCode: string }>
}

export function UnifiedAddVideosDialog({
  playlistId,
  open,
  onOpenChange,
  existingItems,
}: UnifiedAddVideosDialogProps) {
  const [mode, setMode] = useState<Mode>("single")
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [singleResult, setSingleResult] = useState<ParseResult | null>(null)
  const [bulkResults, setBulkResults] = useState<ParseResult[]>([])
  const router = useRouter()

  // Smart mode detection based on input
  useEffect(() => {
    const lines = input.split('\n').filter(line => line.trim().length > 0)

    if (lines.length > 1 && mode === "single") {
      // Auto-switch to bulk if multiple lines detected
      setMode("bulk")
    }
  }, [input, mode])

  // Parse input in real-time with duplicate checking
  useEffect(() => {
    if (!input.trim()) {
      setSingleResult(null)
      setBulkResults([])
      return
    }

    // Create a Set of existing normalized codes for fast lookup
    const existingCodes = new Set(existingItems.map(item => item.normalizedCode))

    if (mode === "single") {
      const result = parseVideoInput(input)
      // Check if it's a duplicate
      if (result.success && result.normalizedCode && existingCodes.has(result.normalizedCode)) {
        result.isDuplicate = true
      }
      setSingleResult(result)
    } else {
      const results = parseMultipleInputs(input)
      // Mark duplicates in bulk results
      results.forEach(result => {
        if (result.success && result.normalizedCode && existingCodes.has(result.normalizedCode)) {
          result.isDuplicate = true
        }
      })
      setBulkResults(results)
    }
  }, [input, mode, existingItems])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setInput("")
      setMode("single")
      setSingleResult(null)
      setBulkResults([])
    }
  }, [open])

  const stats = getParseStats(bulkResults)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "single") {
      if (!singleResult?.success) {
        toast.error(singleResult?.error || "Invalid input")
        return
      }

      if (singleResult.isDuplicate) {
        toast.error("This code is already in the playlist")
        return
      }

      setLoading(true)
      try {
        await addItemToPlaylist(playlistId, singleResult.normalizedCode!)
        toast.success("Video added!")
        setInput("")
        setSingleResult(null)
        router.refresh()
        onOpenChange(false) // Close dialog on success
      } catch (error: any) {
        toast.error(error.message || "Failed to add video")
      } finally {
        setLoading(false)
      }
    } else {
      if (stats.successful === 0) {
        toast.error("No valid codes to add")
        return
      }

      setLoading(true)
      try {
        const validCodes = bulkResults
          .filter(r => r.success && !r.isDuplicate)
          .map(r => r.normalizedCode!)

        const count = await bulkAddItemsToPlaylist(playlistId, validCodes)

        const skippedDuplicates = stats.duplicates
        if (stats.failed > 0 || skippedDuplicates > 0) {
          const parts = []
          if (count > 0) parts.push(`Added ${count} codes`)
          if (skippedDuplicates > 0) parts.push(`${skippedDuplicates} duplicates skipped`)
          if (stats.failed > 0) parts.push(`${stats.failed} failed`)
          toast.success(parts.join(', '))
        } else {
          toast.success(`Added ${count} video codes!`)
        }

        setInput("")
        setBulkResults([])
        router.refresh()
        onOpenChange(false) // Close dialog on success
      } catch (error: any) {
        toast.error(error.message || "Failed to add codes")
      } finally {
        setLoading(false)
      }
    }
  }

  const isValid = mode === "single"
    ? (singleResult?.success && !singleResult?.isDuplicate)
    : stats.successful > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Add Videos</DialogTitle>
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "single"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <Plus className="h-3 w-3 inline mr-1" />
                Single
              </button>
              <button
                type="button"
                onClick={() => setMode("bulk")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "bulk"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                <ListPlus className="h-3 w-3 inline mr-1" />
                Bulk
              </button>
            </div>
          </div>
          <DialogDescription>
            {mode === "single"
              ? "Paste a URL or enter a video code"
              : "Paste multiple codes or URLs, one per line"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Textarea
              id="video-input"
              placeholder={
                mode === "single"
                  ? "SSIS-123, fc2-ppv-1234567, or URL..."
                  : "SSIS-123\nIPX-920\nFC2-PPV-1234567\n..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={mode === "single" ? 3 : 10}
              autoFocus
              required
              disabled={loading}
              className={`border-gray-300 focus:border-black focus:ring-black transition-all ${
                mode === "bulk" ? "font-mono text-sm" : ""
              }`}
            />

            {/* Real-time Preview */}
            {mode === "single" && singleResult && (
              <div className="text-sm">
                {singleResult.success ? (
                  singleResult.isDuplicate ? (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                      <XCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-amber-900 mb-1">⚠️ Already in playlist</p>
                        <code className="font-mono font-semibold text-amber-900">
                          {singleResult.normalizedCode}
                        </code>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-green-700 mb-1">
                          {singleResult.source === 'url' ? '✓ Extracted from URL' : '✓ Valid code'}
                        </p>
                        <code className="font-mono font-semibold text-green-900">
                          {singleResult.normalizedCode}
                        </code>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-red-900 mb-1">Invalid input</p>
                      <p className="text-xs text-red-700">{singleResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bulk Stats */}
            {mode === "bulk" && bulkResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm flex-wrap">
                  {stats.successful > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 border border-green-300 rounded-md">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-700" />
                      <span className="font-semibold text-green-900">{stats.successful} valid</span>
                    </div>
                  )}
                  {stats.duplicates > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-md">
                      <XCircle className="h-3.5 w-3.5 text-amber-700" />
                      <span className="text-amber-900">{stats.duplicates} duplicates</span>
                    </div>
                  )}
                  {stats.failed > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 border border-red-300 rounded-md">
                      <XCircle className="h-3.5 w-3.5 text-red-700" />
                      <span className="text-red-900">{stats.failed} failed</span>
                    </div>
                  )}
                </div>

                {/* Show duplicate items if any */}
                {stats.duplicates > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-medium text-amber-900 mb-2">
                      ⚠️ {stats.duplicates} {stats.duplicates === 1 ? 'code' : 'codes'} already in playlist
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {bulkResults
                        .filter(r => r.isDuplicate)
                        .slice(0, 5)
                        .map((r, i) => (
                          <div key={i} className="text-xs font-mono text-amber-800 bg-white px-2 py-1 rounded border border-amber-200 truncate">
                            {r.normalizedCode}
                          </div>
                        ))}
                      {stats.duplicates > 5 && (
                        <p className="text-xs text-amber-700 pt-1">
                          and {stats.duplicates - 5} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show failed items if any */}
                {stats.failed > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-900 mb-2">
                      {stats.failed} {stats.failed === 1 ? 'item' : 'items'} failed to parse
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {bulkResults
                        .filter(r => !r.success)
                        .slice(0, 5)
                        .map((r, i) => (
                          <div key={i} className="text-xs font-mono text-red-800 bg-white px-2 py-1 rounded border border-red-200 truncate">
                            {r.originalInput}
                          </div>
                        ))}
                      {stats.failed > 5 && (
                        <p className="text-xs text-red-700 pt-1">
                          and {stats.failed - 5} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white"
              disabled={loading || !isValid}
            >
              {mode === "single" ? (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  {loading ? "Adding..." : "Add Video"}
                </>
              ) : (
                <>
                  <ListPlus className="h-4 w-4 mr-1.5" />
                  {loading ? "Adding..." : `Add ${stats.successful} ${stats.successful === 1 ? 'Video' : 'Videos'}`}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
