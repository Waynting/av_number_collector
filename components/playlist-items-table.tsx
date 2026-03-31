"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deletePlaylistItem } from "@/app/actions/playlists"
import { toast } from "sonner"
import { Trash2, ListVideo, Search, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EditNoteDialog } from "@/components/edit-note-dialog"
import { LinkGeneratorPopover } from "@/components/link-generator-popover"

interface PlaylistItem {
  id: string
  videoCode: string
  normalizedCode: string
  note: string | null
  position: number
  createdAt: Date
}

export function PlaylistItemsTable({
  playlistId,
  items,
  onSelectionChange,
}: {
  playlistId: string
  items: PlaylistItem[]
  onSelectionChange?: (selectedItems: PlaylistItem[]) => void
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isTableExpanded, setIsTableExpanded] = useState(true)

  const filteredItems = items.filter(
    (item) =>
      item.normalizedCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.videoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.note?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredItems.map(item => item.id))
      setSelectedIds(allIds)
      onSelectionChange?.(filteredItems)
    } else {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds)
    if (checked) {
      newSelectedIds.add(itemId)
    } else {
      newSelectedIds.delete(itemId)
    }
    setSelectedIds(newSelectedIds)

    const selectedItems = items.filter(item => newSelectedIds.has(item.id))
    onSelectionChange?.(selectedItems)
  }

  const isAllSelected = filteredItems.length > 0 && filteredItems.every(item => selectedIds.has(item.id))
  const isSomeSelected = filteredItems.some(item => selectedIds.has(item.id)) && !isAllSelected

  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId)
    try {
      await deletePlaylistItem(itemId)
      toast.success("Item removed")
      // Remove from selection if it was selected
      const newSelectedIds = new Set(selectedIds)
      newSelectedIds.delete(itemId)
      setSelectedIds(newSelectedIds)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden">
      {/* Header with collapse toggle */}
      <div className="p-4 sm:p-6 border-b border-zinc-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-zinc-800">Video Codes</h3>
            <span className="text-sm text-zinc-400">({items.length})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            className="hover:bg-zinc-100"
          >
            {isTableExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Expand
              </>
            )}
          </Button>
        </div>

        {items.length > 0 && isTableExpanded && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by code or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
        )}
      </div>

      {isTableExpanded && (
        <div className="p-4 sm:p-6">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            {items.length === 0 ? (
              <>
                <div className="mb-6">
                  <ListVideo className="h-10 w-10 sm:h-12 sm:w-12 text-zinc-300 mx-auto" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 mb-2">
                  Your playlist is empty
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto leading-relaxed px-4">
                  Start building your collection by adding video codes. You can add them one by one or paste multiple codes at once.
                </p>
                <div className="flex flex-col gap-3 justify-center items-center px-4">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Try adding codes like:
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <code className="px-2.5 sm:px-3 py-1.5 bg-zinc-100 text-zinc-800 rounded-lg text-xs sm:text-sm font-medium">
                      SSIS-123
                    </code>
                    <code className="px-2.5 sm:px-3 py-1.5 bg-zinc-100 text-zinc-800 rounded-lg text-xs sm:text-sm font-medium">
                      IPX-920
                    </code>
                    <code className="px-2.5 sm:px-3 py-1.5 bg-zinc-100 text-zinc-800 rounded-lg text-xs sm:text-sm font-medium">
                      WAAA-412
                    </code>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-black mb-2">
                  No results found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">
                  No codes match "{searchQuery}". Try adjusting your search.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-xl overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12 sm:w-14">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className="mx-auto"
                    />
                  </TableHead>
                  <TableHead className="w-12 font-semibold text-xs sm:text-sm">#</TableHead>
                  <TableHead className="font-semibold text-xs sm:text-sm hidden sm:table-cell">Original Code</TableHead>
                  <TableHead className="font-semibold text-xs sm:text-sm">Normalized Code</TableHead>
                  <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Note</TableHead>
                  <TableHead className="w-16 sm:w-24 font-semibold text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item, index) => {
                  const isSelected = selectedIds.has(item.id)
                  return (
                    <TableRow
                      key={item.id}
                      className={`transition-smooth ${
                        isSelected
                          ? 'bg-gray-100 hover:bg-gray-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                          aria-label={`Select ${item.normalizedCode}`}
                          className="mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-gray-500 font-mono text-xs sm:text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-black text-xs sm:text-sm hidden sm:table-cell">{item.videoCode}</TableCell>
                      <TableCell>
                        <code className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-zinc-100 text-zinc-800 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">
                          {item.normalizedCode}
                        </code>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-gray-600 hidden md:table-cell max-w-xs truncate">
                        {item.note || <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <LinkGeneratorPopover
                            items={[item]}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-gray-100 transition-smooth h-8 w-8 sm:h-9 sm:w-9 p-0"
                              >
                                <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            }
                          />
                          <EditNoteDialog
                            itemId={item.id}
                            videoCode={item.normalizedCode}
                            currentNote={item.note}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="hover:bg-red-50 hover:text-red-600 transition-smooth h-8 w-8 sm:h-9 sm:w-9 p-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
        </div>
      )}
    </div>
  )
}
