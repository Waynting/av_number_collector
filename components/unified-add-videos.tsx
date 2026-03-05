"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { addItemToPlaylist, bulkAddItemsToPlaylist } from "@/app/actions/playlists"
import { toast } from "sonner"
import { Plus, ListPlus, Link2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import {
  parseVideoInput,
  parseMultipleInputs,
  getParseStats,
  type ParseResult
} from "@/lib/url-parser"
import { trackAddItems } from "@/lib/analytics"

type Mode = "single" | "bulk"

export function UnifiedAddVideos({ playlistId }: { playlistId: string }) {
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

  // Parse input in real-time
  useEffect(() => {
    if (!input.trim()) {
      setSingleResult(null)
      setBulkResults([])
      return
    }

    if (mode === "single") {
      const result = parseVideoInput(input)
      setSingleResult(result)
    } else {
      const results = parseMultipleInputs(input)
      setBulkResults(results)
    }
  }, [input, mode])

  const stats = getParseStats(bulkResults)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "single") {
      if (!singleResult?.success) {
        toast.error(singleResult?.error || "Invalid input")
        return
      }

      setLoading(true)
      try {
        await addItemToPlaylist(playlistId, singleResult.normalizedCode!)

        // Track event
        trackAddItems({
          playlist_id: playlistId,
          item_count: 1,
          method: "url_parse",
        })

        toast.success("Video added!")
        setInput("")
        setSingleResult(null)
        router.refresh()
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
          .filter(r => r.success)
          .map(r => r.normalizedCode!)

        // Process in batches of 50 to avoid request size limits
        const BATCH_SIZE = 50
        let totalAdded = 0

        for (let i = 0; i < validCodes.length; i += BATCH_SIZE) {
          const batch = validCodes.slice(i, i + BATCH_SIZE)
          const count = await bulkAddItemsToPlaylist(playlistId, batch)
          totalAdded += count
        }

        // Track event
        trackAddItems({
          playlist_id: playlistId,
          item_count: totalAdded,
          method: "bulk",
        })

        if (stats.failed > 0) {
          toast.success(`Added ${totalAdded} codes (${stats.failed} failed to parse)`)
        } else {
          toast.success(`Added ${totalAdded} video codes!`)
        }

        setInput("")
        setBulkResults([])
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || "Failed to add codes")
      } finally {
        setLoading(false)
      }
    }
  }

  const isValid = mode === "single" ? singleResult?.success : stats.successful > 0

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header with Mode Toggle */}
      <div className="p-4 bg-black border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">
            Add Videos
          </h3>

          {/* Mode Toggle */}
          <div className="flex bg-slate-800 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                mode === "single"
                  ? "bg-white text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                mode === "bulk"
                  ? "bg-white text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bulk
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          {mode === "single"
            ? "URL or code"
            : "One per line"
          }
        </p>
      </div>

      {/* Input Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            id="video-input"
            placeholder={
              mode === "single"
                ? "SSIS-123, fc2-ppv-1234567, or URL..."
                : "SSIS-123\nIPX-920\nFC2-PPV-1234567\n..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={mode === "single" ? 2 : 8}
            required
            disabled={loading}
            className={`border-slate-300 focus:border-black focus:ring-black transition-all text-sm ${
              mode === "bulk" ? "font-mono" : ""
            }`}
          />

          {/* Real-time Preview */}
          {mode === "single" && singleResult && (
            <div className="text-xs">
              {singleResult.success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <code className="font-mono font-semibold">{singleResult.normalizedCode}</code>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>{singleResult.error}</span>
                </div>
              )}
            </div>
          )}

          {/* Bulk Stats */}
          {mode === "bulk" && bulkResults.length > 0 && (
            <div className="text-xs space-y-2">
              <div className="flex items-center gap-3">
                {stats.successful > 0 && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="font-semibold">{stats.successful}</span>
                  </div>
                )}
                {stats.failed > 0 && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>{stats.failed}</span>
                  </div>
                )}
              </div>

              {/* Show failed items if any */}
              {stats.failed > 0 && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <p className="text-slate-600 mb-1">
                    {stats.failed} failed
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {bulkResults
                      .filter(r => !r.success)
                      .slice(0, 3)
                      .map((r, i) => (
                        <div key={i} className="text-xs font-mono text-slate-500 truncate">
                          {r.originalInput}
                        </div>
                      ))}
                    {stats.failed > 3 && (
                      <p className="text-slate-400">
                        +{stats.failed - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-black hover:bg-slate-800 text-white"
            disabled={loading || !isValid}
          >
            {mode === "single" ? (
              loading ? "Adding..." : "Add"
            ) : (
              loading ? "Adding..." : `Add ${stats.successful}`
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
