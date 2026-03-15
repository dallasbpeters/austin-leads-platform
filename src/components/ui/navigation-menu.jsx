import * as React from 'react'
import { cva } from 'class-variance-authority'
import { NavArrowDown } from 'iconoir-react'
import { NavigationMenu as NavigationMenuPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function NavigationMenu({ className, children, viewport = true, ...props }) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "flex relative items-center justify-center max-w-max font-semi-bold flex-1 group/navigation-menu",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("flex items-center justify-center gap-1 flex-1 group list-none", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('relative', className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "items-center justify-center h-9 w-max px-4 py-2 font-semi-bold text-foreground text-sm data-[state=open]:text-primary focus:text-primary-foreground hover:text-primary bg-background rounded-md data-[state=open]:bg-white focus:bg-primary transition-[color,box-shadow] disabled:opacity-50 btn group inline-flex outline-none disabled:pointer-events-none focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50",
)

function NavigationMenuTrigger({ className, children, ...props }) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), 'group', className)}
      {...props}
    >
      {children}{' '}
      <NavArrowDown
        className="relative ml-1 duration-300 transition size-5 top-px group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "md:absolute w-full md:w-auto p-2 pr-2.5 left-0 top-0 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
        "group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 group-data-[viewport=false] **:data-[slot=navigation-menu-link]:focus:outline-none **:data-[slot=navigation-menu-link]:focus:ring-0 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({ className, ...props }) {
  return (
    <div className={cn("absolute flex justify-center -left-[50%] isolate top-full z-50")}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "relative h-(--radix-navigation-menu-viewport-height) w-full md:w-(--radix-navigation-menu-viewport-width) mt-1.5 text-popover-foreground bg-popover rounded-md shadow origin-top-center overflow-hidden data-[state=closed]:animate-out data-[state=open]:animate-in",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 p-2 font-semi-bold text-sm [&_svg:not([class*='text-'])]:text-muted-foreground data-[active=true]:text-primary-foreground focus:text-primary-foreground hover:text-primary rounded-sm data-[active=true]:bg-primary/50 data-[active=true]:focus:bg-primary focus:bg-primary transition-all data-[active=true] outline-none [&_svg:not([class*='size-'])]:size-4 focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({ className, ...props }) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "flex items-end justify-center h-1.5 overflow-hidden top-full z-1 data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className,
      )}
      {...props}
    >
      <div className="relative h-2 w-2 bg-border rounded-tl-sm shadow-md rotate-45 top-[60%]" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
