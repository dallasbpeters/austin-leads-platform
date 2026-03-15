'use client'

import * as React from 'react'
import { cva } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Tabs({ className, orientation = 'horizontal', ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("flex data-[orientation=horizontal]:flex-col gap-2 group/tabs", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group-data-[orientation=vertical]/tabs:flex-col items-center justify-center w-fit group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit p-[3px] text-muted-foreground rounded-lg data-[variant=line]:rounded-none group/tabs-list inline-flex",
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({ className, variant = 'default', ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative items-center justify-center group-data-[orientation=vertical]/tabs:justify-start h-[calc(100%-1px)] group-data-[orientation=vertical]/tabs:w-full gap-1.5 px-2 py-1 font-medium text-foreground/60 text-sm dark:text-muted-foreground dark:hover:text-foreground hover:text-foreground border border-transparent rounded-md focus-visible:border-ring group-data-[variant=default]/tabs-list:data-[state=active]:shadow-theme-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none transition-all disabled:opacity-50 flex-1 inline-flex whitespace-nowrap [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 disabled:pointer-events-none focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "dark:data-[state=active]:text-foreground data-[state=active]:text-foreground dark:data-[state=active]:bg-input/30 dark:data-[state=active]:border-input data-[state=active]:bg-background",
        "after:absolute group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:w-0.5 after:bg-foreground after:opacity-0 after:transition-opacity group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:inset-y-0",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
