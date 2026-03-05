"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Link as LinkIcon, Copy, Check, Plus } from "lucide-react"
import { toast } from "sonner"
import { DEFAULT_TEMPLATES } from "@/lib/default-templates"

interface PlaylistItem {
  id: string
  normalizedCode: string
  videoCode: string
  note: string | null
}

interface SourceTemplate {
  id: string
  name: string
  baseTemplate: string
  isDefault: boolean
  isBuiltIn?: boolean
}

interface LinkGeneratorPopoverProps {
  items: PlaylistItem[]
  userTemplates?: SourceTemplate[]
  trigger?: React.ReactNode
}

export function LinkGeneratorPopover({ items, userTemplates = [], trigger }: LinkGeneratorPopoverProps) {
  const [open, setOpen] = useState(false)
  const [copiedSource, setCopiedSource] = useState<string | null>(null)

  if (items.length === 0) {
    return null
  }

  // Merge built-in templates with user templates
  const allTemplates = [...DEFAULT_TEMPLATES, ...userTemplates]

  // Preview code (use first code for preview)
  const previewCode = items[0]?.normalizedCode || "SSIS-123"

  const handleCopyLinks = (template: SourceTemplate | typeof DEFAULT_TEMPLATES[0]) => {
    const codes = items.map(item => item.normalizedCode)
    const links = codes.map(code => template.baseTemplate.replace('{code}', code))
    const linksText = links.join('\n')

    navigator.clipboard.writeText(linksText)

    // Show visual feedback
    setCopiedSource(template.id)
    toast.success(`Copied ${items.length} ${template.name} ${items.length === 1 ? 'link' : 'links'}!`)

    // Reset after animation
    setTimeout(() => setCopiedSource(null), 2000)
  }

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="shadow-sm hover:bg-gray-50 transition-all"
    >
      <LinkIcon className="h-4 w-4 mr-2" />
      Generate Links
      <span className="ml-2 text-xs text-gray-500">({items.length})</span>
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-[480px] p-0 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b-2 border-black bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black">Generate Links</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Copy {items.length} {items.length === 1 ? 'code' : 'codes'} as URLs
              </p>
            </div>
          </div>
        </div>

        {/* Source List */}
        <div className="p-3 space-y-1.5 max-h-[400px] overflow-y-auto">
          {allTemplates.map((template) => {
            const previewUrl = template.baseTemplate.replace('{code}', previewCode)
            const isCopied = copiedSource === template.id
            const isBuiltIn = 'isBuiltIn' in template && template.isBuiltIn

            return (
              <button
                key={template.id}
                onClick={() => handleCopyLinks(template)}
                className="w-full group relative"
              >
                <div className="flex items-start gap-3 p-3 bg-white border-2 border-gray-200 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg text-left">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                    {template.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-black">{template.name}</span>
                      {isBuiltIn && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                          Built-in
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-gray-600 truncate">
                      {previewUrl}
                    </p>
                  </div>

                  {/* Copy Icon */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {isCopied ? (
                      <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer Tip */}
        <div className="px-4 py-2.5 border-t-2 border-black bg-gray-50">
          <p className="text-xs text-gray-600">
            💡 Click any source to copy all {items.length} links to clipboard
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
