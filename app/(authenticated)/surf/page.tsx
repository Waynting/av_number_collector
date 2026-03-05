import { searchPublicPlaylists } from "@/app/actions/surf"
import { SurfPageClient } from "@/components/surf-page-client"
import { Compass } from "lucide-react"

export default async function SurfPage() {
  // Get initial public playlists
  const playlists = await searchPublicPlaylists()

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
              Surf Public Playlists
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg">
              Discover and copy playlists shared by the community
            </p>
          </div>
        </div>
      </div>

      {/* Search and Results */}
      <SurfPageClient initialPlaylists={playlists} />
    </div>
  )
}
