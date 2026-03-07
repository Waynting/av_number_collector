"use client"

import { Users, List, Eye, FileText } from "lucide-react"
import Link from "next/link"

interface AdminStatsCardsProps {
  stats: {
    totalUsers: number
    totalPlaylists: number
    publicPlaylists: number
    privatePlaylists: number
    totalItems: number
    recentUsers: Array<{
      email: string
      displayName: string | null
      createdAt: Date
    }>
  }
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      href: null,
    },
    {
      title: "Total Playlists",
      value: stats.totalPlaylists,
      icon: List,
      color: "bg-green-500",
      href: "/admin/all-playlists",
      subtitle: `${stats.publicPlaylists} public, ${stats.privatePlaylists} private`,
    },
    {
      title: "Public Playlists",
      value: stats.publicPlaylists,
      icon: Eye,
      color: "bg-purple-500",
      href: "/admin/playlists",
    },
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: FileText,
      color: "bg-orange-500",
      href: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const content = (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">{card.title}</p>
              <p className="text-3xl font-bold text-black mt-2">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className={`${card.color} p-3 rounded-lg flex-shrink-0`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        )

        if (card.href) {
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
            >
              {content}
            </Link>
          )
        }

        return (
          <div
            key={card.title}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
