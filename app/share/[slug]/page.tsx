import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FavoriteButton } from "@/components/favorite-button"
import { checkIsFavorited } from "@/app/actions/favorites"
import { SharePageContent } from "@/components/share-page-content"

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-black bg-black sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white font-bold text-lg hover:text-gray-300 transition-colors">
              AV Playlist Manager
            </Link>
            {!user && (
              <Link href="/login">
                <Button size="sm" variant="outline" className="bg-white text-black hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Header */}
      <div className="border-b-2 border-black bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-lg text-gray-600 mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>By <span className="font-semibold text-black">{creatorName}</span></span>
            <span>•</span>
            <span>{playlist.items.length} {playlist.items.length === 1 ? 'video' : 'videos'}</span>
          </div>

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
                <Button variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
                  Sign in to save this playlist
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SharePageContent
          items={playlist.items}
          playlistId={playlist.id}
          isAuthenticated={!!user}
          isOwner={isOwner}
        />
      </div>

      {/* Footer CTA */}
      <div className="border-t-2 border-black bg-gray-50 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            Create Your Own Playlist
          </h2>
          <p className="text-gray-600 mb-6">
            Organize and share your video collections with custom playlists
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
