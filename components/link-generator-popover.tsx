"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Link as LinkIcon, Copy, Check, Plus } from "lucide-react"
import { toast } from "sonner"
import { DEFAULT_TEMPLATES } from "@/lib/default-templates"
import { trackGenerateLinks } from "@/lib/analytics"

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

    // Track event
    trackGenerateLinks({
      source_name: template.name,
      item_count: items.length,
      is_single_item: items.length === 1,
    })

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
      className="hover:bg-zinc-50 transition-all duration-150"
    >
      <LinkIcon className="h-4 w-4 mr-2" />
      Generate Links
      <span className="ml-2 text-xs text-zinc-400">({items.length})</span>
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-[360px] p-0 bg-white border border-zinc-200/80 shadow-lg rounded-xl"
        sideOffset={8}
        align="end"
      >
        {/* Header */}
        <div className="px-3 sm:px-3 py-2.5 sm:py-2 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-800">Generate Links</h3>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                Copy {items.length} {items.length === 1 ? 'code' : 'codes'} as URLs
              </p>
            </div>
          </div>
        </div>

        {/* Source List */}
        <div className="p-2 sm:p-2 space-y-1.5 max-h-[60vh] sm:max-h-[350px] overflow-y-auto">
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
                <div className="flex items-center gap-2 sm:gap-2 p-2.5 sm:p-2 bg-white hover:bg-zinc-50 transition-all duration-150 rounded-lg text-left">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-7 h-7 sm:w-7 sm:h-7 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center font-semibold text-[10px] sm:text-[10px] group-hover:scale-105 transition-transform">
                    {template.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-1.5 mb-0.5 sm:mb-0">
                      <span className="font-medium text-xs sm:text-sm text-zinc-800">{template.name}</span>
                      {isBuiltIn && (
                        <span className="text-[9px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded-md font-medium whitespace-nowrap">
                          Built-in
                        </span>
                      )}
                    </div>
                    {/* Show URL preview only on mobile */}
                    <p className="text-[10px] sm:hidden font-mono text-zinc-400 truncate break-all">
                      {previewUrl}
                    </p>
                  </div>

                  {/* Copy Icon */}
                  <div className="flex-shrink-0 w-7 h-7 sm:w-7 sm:h-7 flex items-center justify-center">
                    {isCopied ? (
                      <div className="w-4 h-4 sm:w-4 sm:h-4 bg-zinc-900 text-white rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                        <Check className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5" strokeWidth={3} />
                      </div>
                    ) : (
                      <Copy className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer Tip */}
        <div className="px-3 sm:px-3 py-2 sm:py-1.5 border-t border-zinc-100">
          <p className="text-[10px] sm:text-[10px] text-zinc-400">
            💡 Click any source to copy {items.length === 1 ? 'link' : `all ${items.length} links`}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
