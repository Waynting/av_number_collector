"use client"

import { useState, useEffect } from "react"
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
import { bulkAddItemsToPlaylist } from "@/app/actions/playlists"
import { toast } from "sonner"
import { ListPlus, Link2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { parseMultipleInputs, getParseStats, type ParseResult } from "@/lib/url-parser"

export function BulkAddDialog({ playlistId }: { playlistId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("")
  const [parseResults, setParseResults] = useState<ParseResult[]>([])
  const router = useRouter()

  // Parse inputs in real-time
  useEffect(() => {
    if (text.trim()) {
      const results = parseMultipleInputs(text)
      setParseResults(results)
    } else {
      setParseResults([])
    }
  }, [text])

  const stats = getParseStats(parseResults)

  const handleBulkAdd = async () => {
    if (stats.successful === 0) {
      toast.error("No valid codes to add")
      return
    }

    setLoading(true)

    try {
      // Only add successfully parsed codes
      const validCodes = parseResults
        .filter(r => r.success)
        .map(r => r.normalizedCode!)

      const count = await bulkAddItemsToPlaylist(playlistId, validCodes)

      if (stats.failed > 0) {
        toast.success(`Added ${count} codes (${stats.failed} failed to parse)`)
      } else {
        toast.success(`Added ${count} video codes!`)
      }

      setText("")
      setParseResults([])
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
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-2xl p-6 cursor-pointer transition-smooth hover:shadow-elevated hover:border-purple-400 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-smooth">
              <ListPlus className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Bulk Add</h3>
          </div>
          <p className="text-sm text-slate-600">
            Paste multiple video codes at once
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Bulk Add Videos</DialogTitle>
          <DialogDescription className="text-slate-600">
            Paste URLs or video codes, one per line. Mixed input supported.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="bulk-codes" className="text-sm font-semibold text-slate-700">
              Video URLs or Codes
            </Label>
            <Textarea
              id="bulk-codes"
              placeholder={"https://missav.com/SSIS-123\nIPX-920\nhttps://javdb.com/v/waaa412\nABP-777\n..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              className="font-mono text-sm shadow-sm border-slate-300 focus:border-purple-500 focus:ring-purple-500"
            />

            {/* Parse statistics */}
            {parseResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {stats.successful > 0 && (
                    <div className="px-2.5 py-1 bg-green-100 border border-green-300 rounded-md font-medium text-green-700 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {stats.successful} valid
                    </div>
                  )}
                  {stats.failed > 0 && (
                    <div className="px-2.5 py-1 bg-red-100 border border-red-300 rounded-md font-medium text-red-700 text-xs flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                      {stats.failed} failed
                    </div>
                  )}
                  {stats.fromUrl > 0 && (
                    <div className="px-2.5 py-1 bg-blue-100 border border-blue-300 rounded-md font-medium text-blue-700 text-xs flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5" />
                      {stats.fromUrl} from URLs
                    </div>
                  )}
                </div>

                {/* Show failed items if any */}
                {stats.failed > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs font-medium text-amber-900">
                        {stats.failed} {stats.failed === 1 ? 'item' : 'items'} failed to parse
                      </p>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {parseResults
                        .filter(r => !r.success)
                        .slice(0, 5)
                        .map((r, i) => (
                          <div key={i} className="text-xs text-amber-800 font-mono bg-white px-2 py-1 rounded border border-amber-200 truncate">
                            {r.originalInput}
                          </div>
                        ))}
                      {stats.failed > 5 && (
                        <p className="text-xs text-amber-700 pt-1">
                          and {stats.failed - 5} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {parseResults.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Link2 className="h-3.5 w-3.5" />
                <span>Supports URLs from missav, javdb, and direct codes</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBulkAdd}
            disabled={loading || stats.successful === 0}
            className="shadow-sm"
          >
            <ListPlus className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : `Add ${stats.successful} ${stats.successful === 1 ? 'Code' : 'Codes'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
