import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin"
import { getAllPlaylists } from "@/app/actions/admin"
import { AdminAllPlaylistsTable } from "@/components/admin/admin-all-playlists-table"
import { List } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function AdminAllPlaylistsPage() {
  // Check admin access
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/dashboard")
  }

  // Fetch all playlists (both public and private)
  const playlists = await getAllPlaylists()

  const publicCount = playlists.filter(p => p.isPublic).length
  const privateCount = playlists.filter(p => !p.isPublic).length

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
            <List className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
              Manage All Playlists
            </h1>
            <p className="text-gray-600 mt-1 text-base sm:text-lg">
              {playlists.length} total playlists ({publicCount} public, {privateCount} private)
            </p>
          </div>
        </div>
      </div>

      {/* Playlists Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No playlists</h3>
            <p className="text-gray-600">There are no playlists in the system yet.</p>
          </div>
        ) : (
          <AdminAllPlaylistsTable playlists={playlists} />
        )}
      </div>
    </div>
  )
}
