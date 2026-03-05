"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createSourceTemplate } from "@/app/actions/source-templates"
import { toast } from "sonner"
import { Plus } from "lucide-react"

const PRESET_TEMPLATES = [
  { name: "MissAV", template: "https://missav.ws/{code}" },
  { name: "Jable", template: "https://jable.tv/videos/{code}/" },
  { name: "Javhub", template: "https://javhub.net/video/{code}" },
]

export function CreateTemplateDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [template, setTemplate] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.set("name", name)
      formData.set("baseTemplate", template)
      formData.set("isDefault", "false")

      await createSourceTemplate(formData)
      toast.success("Template created!")
      setName("")
      setTemplate("")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to create template")
    } finally {
      setLoading(false)
    }
  }

  const usePreset = (preset: { name: string; template: string }) => {
    setName(preset.name)
    setTemplate(preset.template)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Source Template</DialogTitle>
            <DialogDescription>
              Add a new URL pattern to generate links from video codes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TEMPLATES.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => usePreset(preset)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., MissAV, Jable"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-url">URL Template</Label>
              <Input
                id="template-url"
                placeholder="https://example.com/{code}"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500">
                Use <code className="bg-slate-100 px-1 rounded">{'{code}'}</code> as a placeholder
                for the video code
              </p>
            </div>

            {template && (
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-xs text-slate-600 mb-1">Preview:</p>
                <code className="text-sm text-slate-900">
                  {template.replace('{code}', 'SSIS-123')}
                </code>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
