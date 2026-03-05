"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Star, Edit, Link as LinkIcon } from "lucide-react"
import { deleteSourceTemplate, setDefaultTemplate } from "@/app/actions/source-templates"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SourceTemplate {
  id: string
  name: string
  baseTemplate: string
  isDefault: boolean
  createdAt: Date
}

export function SourceTemplatesList({ templates }: { templates: SourceTemplate[] }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SourceTemplate | null>(null)

  const handleDelete = async () => {
    if (!selectedTemplate) return

    try {
      await deleteSourceTemplate(selectedTemplate.id)
      toast.success("Template deleted")
      setDeleteOpen(false)
      setSelectedTemplate(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete")
    }
  }

  const handleSetDefault = async (templateId: string) => {
    try {
      await setDefaultTemplate(templateId)
      toast.success("Default template updated")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to set default")
    }
  }

  const openDeleteDialog = (template: SourceTemplate) => {
    setSelectedTemplate(template)
    setDeleteOpen(true)
  }

  if (templates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <LinkIcon className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No source templates yet
          </h3>
          <p className="text-slate-600 text-center mb-6 max-w-md">
            Create your first source template to start generating URLs from video codes.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.isDefault && (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="font-mono text-xs break-all">
                    {template.baseTemplate}
                  </CardDescription>
                </div>
                <div className="flex gap-2 ml-4">
                  {!template.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(template.id)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(template)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-3 rounded text-sm">
                <p className="text-slate-600 mb-1">Example output:</p>
                <code className="text-slate-900">
                  {template.baseTemplate.replace('{code}', 'SSIS-123')}
                </code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
