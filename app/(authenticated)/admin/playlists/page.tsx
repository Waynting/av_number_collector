import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin"
import { getAllPublicPlaylists } from "@/app/actions/admin"
import { AdminPlaylistsTable } from "@/components/admin/admin-playlists-table"
import { List, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function AdminPlaylistsPage() {
  // Check admin access
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/dashboard")
  }

  // Fetch all public playlists
  const playlists = await getAllPublicPlaylists()

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
              Manage Public Playlists
            </h1>
            <p className="text-gray-600 mt-1 text-base sm:text-lg">
              Review and moderate public playlists ({playlists.length} total)
            </p>
          </div>
        </div>
      </div>

      {/* Playlists Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No public playlists</h3>
            <p className="text-gray-600">There are no public playlists to moderate yet.</p>
          </div>
        ) : (
          <AdminPlaylistsTable playlists={playlists} />
        )}
      </div>
    </div>
  )
}
