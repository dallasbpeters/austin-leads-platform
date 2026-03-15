'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 font-medium leading-none text-foreground text-sm peer-disabled:opacity-70 peer-disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
