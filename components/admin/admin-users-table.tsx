"use client"

import { useState, useMemo } from "react"
import { deleteUser } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2, Shield, Search } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  isAdmin: boolean
  createdAt: Date
  _count: {
    playlists: number
    sourceTemplates: number
    favoritePlaylists: number
  }
}

interface AdminUsersTableProps {
  users: User[]
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    // First filter
    let filtered = users
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = users.filter((user) => {
        const emailMatch = user.email.toLowerCase().includes(query)
        const displayNameMatch = user.displayName?.toLowerCase().includes(query)
        return emailMatch || displayNameMatch
      })
    }

    // Then sort: admins first, then by creation date
    return [...filtered].sort((a, b) => {
      // Admins always first
      if (a.isAdmin && !b.isAdmin) return -1
      if (!a.isAdmin && b.isAdmin) return 1
      // Among admins or non-admins, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [users, searchQuery])

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setDeletingId(userToDelete.id)
    try {
      const result = await deleteUser(userToDelete.id)
      toast.success(result.message)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }


  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜尋用戶郵箱或名稱... / Search user email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            找到 {filteredAndSortedUsers.length} 個結果 / Found {filteredAndSortedUsers.length} results
          </p>
        )}
      </div>

      {filteredAndSortedUsers.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">沒有找到結果</h3>
          <p className="text-gray-600">嘗試使用不同的搜尋關鍵字</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Display Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Playlists</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user, index) => (
              <tr
                key={user.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  user.isAdmin ? 'bg-purple-50' : ''
                }`}
              >
                <td className="py-3 px-4 text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  {user.displayName || <span className="text-gray-400 italic">Not set</span>}
                </td>
                <td className="py-3 px-4 text-sm">
                  {user.isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      User
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  {user._count.playlists}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-sm text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(user)}
                    disabled={deletingId === user.id || user.isAdmin}
                    className="text-xs gap-1"
                  >
                    {deletingId === user.id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </>
                    )}
                  </Button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>This will permanently delete the user <strong>{userToDelete?.email}</strong> and all their data:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{userToDelete?._count.playlists} playlists</li>
                  <li>{userToDelete?._count.sourceTemplates} source templates</li>
                  <li>{userToDelete?._count.favoritePlaylists} favorites</li>
                </ul>
                <p className="mt-2 font-semibold text-red-600">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
