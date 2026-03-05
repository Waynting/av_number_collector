"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  List,
  User,
  ListVideo,
  Compass
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success("Signed out successfully")
    router.push("/login")
    router.refresh()
  }

  const navItems = [
    { href: "/dashboard", label: "My Playlists", icon: List },
    { href: "/surf", label: "Surf", icon: Compass },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="border-b border-gray-200 bg-black sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1400px]">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/dashboard"
              className="text-base sm:text-lg font-bold text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                <ListVideo className="h-4 w-4 text-black" />
              </div>
              <span className="hidden sm:inline">AV Playlist Manager</span>
            </Link>

            <div className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-black"
                        : "text-gray-400 hover:text-white hover:bg-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white hover:bg-gray-900"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
