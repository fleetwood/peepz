'use client'

import { cn, Logger } from '@peeps/utils'
import { WithClassName } from '@peeps/types'
import { Clipboard } from 'lucide-react'
import { toast } from 'sonner'
import DevOnly from '../auth/DevOnly'

type DebugProps = WithClassName & {
  label    ?: string
  data      : any
  open     ?: boolean
  maxHeight?: string
  logger   ?: Logger
}

/**
 * Debug component for displaying JSON data during development
 * @param label - Label to display in the summary
 * @param data - Data object to stringify and display
 * @param open - Whether the details should be open by default
 * @param maxHeight - Maximum height of the pre element
 * @param className - Additional class names for the details element
 */
export function Debug({ label, data, open = false, maxHeight = '200px', logger, className }: DebugProps) {
  if (logger && !logger.isActive) return null
  
  const handleClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Data copied to clipboard');
  };
  
  return (
    <DevOnly>
      <details className={cn("mt-4", className)} open={open}>
        <summary className="text-xs text-muted-foreground cursor-pointer flex gap-2 items-center justify-between">
          <div>
            Debug{label && `: ${label}`}
          </div>
          <Clipboard className="h-4 w-4 cursor-copy hover:text-accent" onClick={handleClipboard} />
        </summary>
        <pre 
          className="text-xs overflow-auto p-2 bg-muted/50 rounded mt-2 whitespace-pre-wrap break-words"
          style={{ maxHeight: maxHeight }}
          onClick={handleClipboard}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </DevOnly>
  )
}
