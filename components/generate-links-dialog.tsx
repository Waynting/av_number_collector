"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Link as LinkIcon, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SourceTemplate {
  id: string
  name: string
  baseTemplate: string
  isDefault: boolean
}

interface GenerateLinksDialogProps {
  items: Array<{ normalizedCode: string }>
  templates: SourceTemplate[]
}

export function GenerateLinksDialog({ items, templates }: GenerateLinksDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SourceTemplate | null>(
    templates.find(t => t.isDefault) || templates[0] || null
  )
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([])

  const handleGenerate = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template")
      return
    }

    const codes = items.map(item => item.normalizedCode)
    const links = codes.map(code => selectedTemplate.baseTemplate.replace('{code}', code))
    setGeneratedLinks(links)
    toast.success(`Generated ${links.length} links!`)
  }

  const handleCopy = () => {
    const text = generatedLinks.join('\n')
    navigator.clipboard.writeText(text)
    toast.success("Links copied to clipboard!")
  }

  if (templates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Generate Links</CardTitle>
          <CardDescription>
            Set up source templates in Settings first
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Generate Links
            </CardTitle>
            <CardDescription>
              Convert codes to URLs using your templates
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Generate Links from Template</DialogTitle>
          <DialogDescription>
            Select a source template to generate full URLs from your video codes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Source Template</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedTemplate ? selectedTemplate.name : "Select template..."}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuLabel>Your Templates</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {template.name}
                    {template.isDefault && (
                      <span className="ml-2 text-xs text-slate-500">(Default)</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedTemplate && (
              <p className="text-xs text-slate-500 font-mono">
                {selectedTemplate.baseTemplate}
              </p>
            )}
          </div>

          <Button onClick={handleGenerate} className="w-full">
            Generate {items.length} Links
          </Button>

          {generatedLinks.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Generated Links</Label>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <Textarea
                value={generatedLinks.join('\n')}
                readOnly
                rows={15}
                className="font-mono text-xs"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
