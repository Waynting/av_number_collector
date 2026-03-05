"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

export function CopyCodesButton({ codes }: { codes: string[] }) {
  const handleCopy = () => {
    const text = codes.join('\n')
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${codes.length} codes to clipboard!`)
  }

  return (
    <Button onClick={handleCopy} variant="outline" size="sm">
      <Copy className="h-4 w-4 mr-2" />
      Copy All
    </Button>
  )
}
