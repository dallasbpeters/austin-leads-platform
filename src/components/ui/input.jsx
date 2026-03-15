import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 min-w-0 w-full file:h-7 px-3 py-0 text-base file:font-medium file:text-foreground file:text-sm md:text-sm placeholder:text-muted-foreground selection:text-primary-foreground bg-transparent border border-input rounded-sm shadow-theme-xs dark:bg-input/30 file:bg-transparent file:border-0 selection:bg-primary transition-[color,box-shadow] disabled:opacity-50 outline-none disabled:cursor-not-allowed disabled:pointer-events-none file:inline-flex",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
