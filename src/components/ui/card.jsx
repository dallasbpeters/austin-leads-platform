import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-2 py-4 text-card-foreground bg-card border border-border rounded-xl shadow-theme-sm contain-paint",
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid items-start px-6 [.border-b]:pb-6 @container/card-header auto-rows-min grid-rows-[auto_auto] has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn("font-bold leading-none", className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return (
    <div data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn("justify-self-end self-start col-start-2 row-span-2 row-start-1", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
