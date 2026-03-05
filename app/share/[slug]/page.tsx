import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ListVideo } from "lucide-react"
import Link from "next/link"
import { CopyCodesButton } from "@/components/copy-codes-button"
import { FavoriteButton } from "@/components/favorite-button"
import { checkIsFavorited } from "@/app/actions/favorites"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function SharedPlaylistPage({ params }: PageProps) {
  const { slug } = await params

  const playlist = await prisma.playlist.findUnique({
    where: { shareSlug: slug, isPublic: true },
    include: {
      items: {
        orderBy: { position: 'asc' },
      },
      user: {
        select: {
          displayName: true,
          email: true
        },
      },
    },
  })

  if (!playlist) {
    notFound()
  }

  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if playlist is already favorited
  let isFavorited = false
  const isOwner = user?.id === playlist.userId
  if (user && !isOwner) {
    isFavorited = await checkIsFavorited(playlist.id)
  }

  const creatorName = playlist.user.displayName || playlist.user.email.split('@')[0]

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black mb-2">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-lg text-gray-600">{playlist.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-4">
            By {creatorName} • {playlist.items.length} {playlist.items.length === 1 ? 'item' : 'items'}
          </p>

          {/* Favorite Button */}
          {user && !isOwner && (
            <div className="mt-6">
              <FavoriteButton
                playlistId={playlist.id}
                initialIsFavorited={isFavorited}
              />
            </div>
          )}

          {!user && (
            <div className="mt-6">
              <Link href="/login">
                <Button variant="outline">
                  Sign in to save this playlist
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Video Codes</CardTitle>
                <CardDescription>
                  {playlist.items.length} codes in this playlist
                </CardDescription>
              </div>
              <CopyCodesButton
                codes={playlist.items.map((item: typeof playlist.items[0]) => item.normalizedCode)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {playlist.items.length === 0 ? (
              <div className="text-center py-12">
                <ListVideo className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">This playlist is empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {playlist.items.map((item: typeof playlist.items[0], index: number) => (
                  <div
                    key={item.id}
                    className="px-3 py-2 bg-slate-100 rounded text-center font-mono text-sm font-semibold"
                  >
                    {item.normalizedCode}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/login">
            <Button size="lg">
              Create Your Own Playlist
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
