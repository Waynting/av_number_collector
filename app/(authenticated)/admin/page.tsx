import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin"
import { getAllUsers, getAdminStats } from "@/app/actions/admin"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { Shield } from "lucide-react"

export default async function AdminPage() {
  // Check admin access
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect("/dashboard")
  }

  // Fetch data
  const [users, stats] = await Promise.all([
    getAllUsers(),
    getAdminStats(),
  ])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-base sm:text-lg">
            Manage users and monitor system activity
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards stats={stats} />

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-black mb-4">All Users</h2>
        <AdminUsersTable users={users} />
      </div>
    </div>
  )
}
