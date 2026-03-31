"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  List,
  User,
  ListVideo,
  Compass,
  Info,
  Shield
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin using server action
    const checkAdmin = async () => {
      try {
        // Import the server action dynamically to avoid bundling issues
        const { checkAdminStatus } = await import("@/app/actions/check-admin")
        const adminStatus = await checkAdminStatus()
        setIsAdmin(adminStatus)
      } catch (error) {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [])

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
    { href: "/about", label: "About", icon: Info },
  ]

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="border-b border-zinc-200/80 bg-zinc-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1400px]">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6 sm:gap-8">
              <Link
                href="/dashboard"
                className="text-base sm:text-lg font-semibold text-white hover:text-zinc-300 transition-colors flex items-center gap-2"
              >
                <div className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center">
                  <ListVideo className="h-4 w-4 text-zinc-900" />
                </div>
                <span className="hidden sm:inline">AV Number Collector</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-white/95 text-zinc-900"
                          : "text-zinc-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-400 hover:text-purple-300 hover:bg-white/10 text-xs sm:text-sm gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-zinc-400 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800/50 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 transition-all duration-150 ${
                  isActive
                    ? "text-white"
                    : "text-zinc-500"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-zinc-500"}`} />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
