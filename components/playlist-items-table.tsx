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
}: {
  playlistId: string
  items: PlaylistItem[]
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredItems = items.filter(
    (item) =>
      item.normalizedCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.videoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.note?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId)
    try {
      await deletePlaylistItem(itemId)
      toast.success("Item removed")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Video Codes</CardTitle>
            <CardDescription>
              {items.length} {items.length === 1 ? 'item' : 'items'} in this playlist
            </CardDescription>
          </div>
        </div>
        {items.length > 0 && (
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <ListVideo className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {items.length === 0
                ? "No items yet. Add some video codes to get started!"
                : "No items match your search."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Original Code</TableHead>
                <TableHead>Normalized Code</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-slate-500 font-mono text-sm">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono">{item.videoCode}</TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-slate-100 rounded text-sm font-semibold">
                      {item.normalizedCode}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.note || <span className="text-slate-400">—</span>}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
