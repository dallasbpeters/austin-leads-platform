'use client'


import { cn } from '@/lib/utils'

function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        'text-foreground flex items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
