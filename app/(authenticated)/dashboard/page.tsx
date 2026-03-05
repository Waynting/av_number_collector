import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Plus, ListVideo, Heart, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getUserFavorites } from "@/app/actions/favorites"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user's playlists and favorites in parallel
  const [playlists, favorites] = await Promise.all([
    prisma.playlist.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    getUserFavorites()
  ])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">My Playlists</h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg">Manage your video code collections</p>
        </div>
        <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white">
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4 mr-2" />
            New Playlist
          </Link>
        </Button>
      </div>

      {/* Content Section */}
      {playlists.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-soft">
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 px-6">
            <ListVideo className="h-16 w-16 sm:h-20 sm:w-20 text-black mb-6" strokeWidth={1} />
            <h3 className="text-xl sm:text-2xl font-bold text-black mb-3">
              No playlists yet
            </h3>
            <p className="text-gray-600 text-center mb-8 max-w-md text-base sm:text-lg">
              Create your first playlist to start organizing your video codes.
            </p>
            <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white">
              <Link href="/dashboard/new">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Playlist
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {playlists.map((playlist: typeof playlists[0]) => (
            <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="group">
              <div className="bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-elevated transition-all h-full overflow-hidden group-hover:border-black">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-black transition-colors line-clamp-1">
                      {playlist.name}
                    </h3>
                    {playlist.isPublic && (
                      <span className="inline-flex items-center text-xs bg-black text-white px-2.5 py-1 rounded font-medium ml-2 flex-shrink-0">
                        Public
                      </span>
                    )}
                  </div>
                  {playlist.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {playlist.description}
                    </p>
                  )}
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex items-center text-sm text-black">
                      <span className="font-bold">{playlist._count.items}</span>
                      <span className="text-gray-500 ml-1">{playlist._count.items === 1 ? 'code' : 'codes'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="space-y-4 sm:space-y-6 border-t border-gray-200 pt-8">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-black fill-current" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Favorite Playlists</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Public playlists you've saved</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map((favorite) => {
              const playlist = favorite.playlist
              const creatorName = playlist.user.displayName || playlist.user.email.split('@')[0]
              return (
                <Link key={favorite.id} href={`/share/${playlist.shareSlug}`} className="group">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-soft hover:shadow-elevated transition-all h-full overflow-hidden group-hover:border-black">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-black transition-colors line-clamp-1">
                          {playlist.name}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      {playlist.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {playlist.description}
                        </p>
                      )}
                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <span>By {creatorName}</span>
                        </div>
                        <div className="flex items-center text-sm text-black">
                          <span className="font-bold">{playlist._count.items}</span>
                          <span className="text-gray-500 ml-1">{playlist._count.items === 1 ? 'code' : 'codes'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
