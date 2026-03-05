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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Playlists</h1>
          <p className="text-slate-600 mt-1">Manage your video code collections</p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4 mr-2" />
            New Playlist
          </Link>
        </Button>
      </div>

      {playlists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListVideo className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No playlists yet
            </h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              Create your first playlist to start organizing your video codes.
            </p>
            <Button asChild>
              <Link href="/dashboard/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist: typeof playlists[0]) => (
            <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    {playlist.isPublic && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Public
                      </span>
                    )}
                  </div>
                  {playlist.description && (
                    <CardDescription className="line-clamp-2">
                      {playlist.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-slate-600">
                    <ListVideo className="h-4 w-4 mr-2" />
                    {playlist._count.items} {playlist._count.items === 1 ? 'item' : 'items'}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
