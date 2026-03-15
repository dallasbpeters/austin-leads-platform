import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full px-3 py-2 text-base md:text-sm placeholder:text-muted-foreground bg-transparent border border-input rounded-md shadow-theme-xs aria-invalid:border-destructive dark:bg-input/30 focus-visible:border-ring transition-[color,box-shadow] disabled:opacity-50 field-sizing-content outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
