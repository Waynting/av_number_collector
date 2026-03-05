import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Plus, ListVideo } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user's playlists
  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { items: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">My Playlists</h1>
          <p className="text-slate-600 mt-2 text-base sm:text-lg">Manage your video code collections</p>
        </div>
        <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-all self-start sm:self-auto">
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4 mr-2" />
            New Playlist
          </Link>
        </Button>
      </div>

      {/* Content Section */}
      {playlists.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl shadow-soft overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-40"></div>
              <ListVideo className="relative h-16 w-16 sm:h-20 sm:w-20 text-blue-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3">
              No playlists yet
            </h3>
            <p className="text-slate-600 text-center mb-8 max-w-md text-base sm:text-lg leading-relaxed">
              Create your first playlist to start organizing your video codes.
            </p>
            <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-all">
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
              <div className="bg-white border border-slate-200 rounded-2xl shadow-soft hover:shadow-elevated transition-all h-full overflow-hidden group-hover:border-blue-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {playlist.name}
                    </h3>
                    {playlist.isPublic && (
                      <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium ml-2 flex-shrink-0">
                        Public
                      </span>
                    )}
                  </div>
                  {playlist.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {playlist.description}
                    </p>
                  )}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center text-sm text-slate-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-medium">{playlist._count.items}</span>
                      <span className="text-slate-500 ml-1">{playlist._count.items === 1 ? 'code' : 'codes'}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
