"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { addPlaylistToFavorites, removePlaylistFromFavorites } from "@/app/actions/favorites"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
  playlistId: string
  initialIsFavorited: boolean
}

export function FavoriteButton({ playlistId, initialIsFavorited }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggleFavorite = async () => {
    setLoading(true)
    try {
      if (isFavorited) {
        await removePlaylistFromFavorites(playlistId)
        setIsFavorited(false)
        toast.success("Removed from favorites")
      } else {
        await addPlaylistToFavorites(playlistId)
        setIsFavorited(true)
        toast.success("Added to favorites!")
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update favorites")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={isFavorited ? "bg-red-600 hover:bg-red-700 text-white" : ""}
      size="sm"
    >
      <Heart
        className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
      />
    </Button>
  )
}
