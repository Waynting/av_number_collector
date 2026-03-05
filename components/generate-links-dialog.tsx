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
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function GenerateLinksDialog({ items, templates, open: controlledOpen, onOpenChange }: GenerateLinksDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
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
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2 opacity-50">
          <div className="p-2 bg-slate-300 rounded-lg">
            <LinkIcon className="h-5 w-5 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">Generate Links</h3>
        </div>
        <p className="text-sm text-slate-600">
          Set up source templates in Settings first
        </p>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-300 rounded-2xl p-6 cursor-pointer transition-smooth hover:shadow-elevated hover:border-green-400 group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-smooth">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Generate Links</h3>
            </div>
            <p className="text-sm text-slate-600">
              Convert codes to URLs using your templates
            </p>
          </div>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Generate Links from Template</DialogTitle>
          <DialogDescription className="text-slate-600">
            Select a source template to generate full URLs from your video codes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Source Template</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between shadow-sm">
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
                      <span className="ml-2 text-xs text-green-600 font-medium">(Default)</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedTemplate && (
              <p className="text-xs text-slate-600 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                {selectedTemplate.baseTemplate}
              </p>
            )}
          </div>

          <Button onClick={handleGenerate} className="w-full shadow-sm">
            <LinkIcon className="h-4 w-4 mr-2" />
            Generate {items.length} Links
          </Button>

          {generatedLinks.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold text-slate-700">Generated Links</Label>
                <Button variant="outline" size="sm" onClick={handleCopy} className="shadow-sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <Textarea
                value={generatedLinks.join('\n')}
                readOnly
                rows={15}
                className="font-mono text-xs shadow-sm border-slate-300"
              />
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="px-2.5 py-1 bg-green-100 border border-green-300 rounded-md font-medium text-green-700">
                  {generatedLinks.length} links
                </div>
                <span className="text-slate-500">generated successfully</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
