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
import { Trash2, ListVideo, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-br from-white to-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Video Codes</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {items.length} {items.length === 1 ? 'code' : 'codes'} in this playlist
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by code or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 shadow-sm text-sm sm:text-base"
            />
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            {items.length === 0 ? (
              <>
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-30"></div>
                  <ListVideo className="relative h-16 w-16 sm:h-20 sm:w-20 text-blue-500 mx-auto" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                  Your playlist is empty
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mb-6 max-w-md mx-auto leading-relaxed px-4">
                  Start building your collection by adding video codes. You can add them one by one or paste multiple codes at once.
                </p>
                <div className="flex flex-col gap-3 justify-center items-center px-4">
                  <div className="text-xs sm:text-sm text-slate-500">
                    Try adding codes like:
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <code className="px-2.5 sm:px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-medium border border-blue-200">
                      SSIS-123
                    </code>
                    <code className="px-2.5 sm:px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs sm:text-sm font-medium border border-purple-200">
                      IPX-920
                    </code>
                    <code className="px-2.5 sm:px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs sm:text-sm font-medium border border-indigo-200">
                      WAAA-412
                    </code>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  No results found
                </h3>
                <p className="text-sm sm:text-base text-slate-600 px-4">
                  No codes match "{searchQuery}". Try adjusting your search.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
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
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-slate-50/50'
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
                      <TableCell className="text-slate-500 font-mono text-xs sm:text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-slate-700 text-xs sm:text-sm hidden sm:table-cell">{item.videoCode}</TableCell>
                      <TableCell>
                        <code className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap">
                          {item.normalizedCode}
                        </code>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-slate-600 hidden md:table-cell max-w-xs truncate">
                        {item.note || <span className="text-slate-400">—</span>}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="hover:bg-red-50 hover:text-red-600 transition-smooth h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
