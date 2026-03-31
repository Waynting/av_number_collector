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
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">My Playlists</h1>
          <p className="text-zinc-500 mt-1 text-sm sm:text-base">Manage your video code collections</p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4 mr-2" />
            New Playlist
          </Link>
        </Button>
      </div>

      {/* Content Section */}
      {playlists.length === 0 ? (
        <div className="bg-white border border-zinc-200/80 rounded-xl">
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <ListVideo className="h-10 w-10 sm:h-12 sm:w-12 text-zinc-300 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 mb-2">
              No playlists yet
            </h3>
            <p className="text-zinc-500 text-center mb-6 max-w-md text-sm sm:text-base">
              Create your first playlist to start organizing your video codes.
            </p>
            <Button asChild size="lg">
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
              <div className="bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all duration-150 h-full overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-zinc-900 transition-colors line-clamp-1">
                      {playlist.name}
                    </h3>
                    {playlist.isPublic && (
                      <span className="inline-flex items-center text-xs bg-zinc-900 text-white px-2.5 py-1 rounded-md font-medium ml-2 flex-shrink-0">
                        Public
                      </span>
                    )}
                  </div>
                  {playlist.description && (
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                      {playlist.description}
                    </p>
                  )}
                  <div className="pt-4 mt-4 border-t border-zinc-100 space-y-2">
                    <div className="flex items-center text-sm text-zinc-900">
                      <span className="font-semibold">{playlist._count.items}</span>
                      <span className="text-zinc-400 ml-1">{playlist._count.items === 1 ? 'code' : 'codes'}</span>
                    </div>
                    <div className="text-xs text-zinc-400">
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
        <div className="space-y-4 sm:space-y-6 pt-6">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-zinc-900 fill-current" />
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">Favorite Playlists</h2>
              <p className="text-zinc-400 mt-1 text-sm">Public playlists you've saved</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map((favorite) => {
              const playlist = favorite.playlist
              const creatorName = playlist.user.displayName || playlist.user.email.split('@')[0]
              return (
                <Link key={favorite.id} href={`/share/${playlist.shareSlug}`} className="group">
                  <div className="bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 hover:shadow-sm transition-all duration-150 h-full overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-zinc-900 transition-colors line-clamp-1">
                          {playlist.name}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-zinc-300 flex-shrink-0 ml-2" />
                      </div>
                      {playlist.description && (
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                          {playlist.description}
                        </p>
                      )}
                      <div className="pt-4 mt-4 border-t border-zinc-100 space-y-2">
                        <div className="flex items-center text-sm text-zinc-500">
                          <span>By {creatorName}</span>
                        </div>
                        <div className="flex items-center text-sm text-zinc-900">
                          <span className="font-semibold">{playlist._count.items}</span>
                          <span className="text-zinc-400 ml-1">{playlist._count.items === 1 ? 'code' : 'codes'}</span>
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
