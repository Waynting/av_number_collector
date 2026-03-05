import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function PlaylistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-12 max-w-[1400px]">
        {children}
      </main>
    </div>
  )
}
