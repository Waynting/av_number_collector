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
    <>
      {/* Top Navigation Bar */}
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
                className="text-gray-400 hover:text-white hover:bg-gray-900 text-xs sm:text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t-2 border-gray-800 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 flex-1 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-gray-400"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
