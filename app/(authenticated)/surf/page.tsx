import { searchPublicPlaylists } from "@/app/actions/surf"
import { SurfPageClient } from "@/components/surf-page-client"

export default async function SurfPage() {
  // Get initial public playlists
  const playlists = await searchPublicPlaylists()

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
            Surf Public Playlists
          </h1>
          <p className="text-zinc-500 mt-1 text-sm sm:text-base">
            Discover and copy playlists shared by the community
          </p>
        </div>
      </div>

      {/* Search and Results */}
      <SurfPageClient initialPlaylists={playlists} />
    </div>
  )
}
