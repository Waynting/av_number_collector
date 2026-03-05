import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SourceTemplatesList } from "@/components/source-templates-list"
import { CreateTemplateDialog } from "@/components/create-template-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function SourcesSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const templates = await prisma.sourceTemplate.findMany({
    where: { userId: user.id },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'asc' },
    ],
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Source Templates</h1>
          <p className="text-gray-600 mt-1">
            Configure URL patterns to auto-generate links from video codes
          </p>
        </div>
        <CreateTemplateDialog />
      </div>

      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-black mb-2">How it works</h3>
        <p className="text-sm text-gray-600 mb-2">
          Create templates with <code className="bg-gray-100 px-1 rounded">{'{code}'}</code> as a placeholder.
          For example:
        </p>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li><code className="bg-gray-100 px-1 rounded">https://missav.ws/{'{code}'}</code></li>
          <li><code className="bg-gray-100 px-1 rounded">https://jable.tv/videos/{'{code}'}/</code></li>
          <li><code className="bg-gray-100 px-1 rounded">https://example.com/search?q={'{code}'}</code></li>
        </ul>
      </div>

      <SourceTemplatesList templates={templates} />
    </div>
  )
}
