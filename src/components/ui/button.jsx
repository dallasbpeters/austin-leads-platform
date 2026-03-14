import * as React from 'react'
import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "btn cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 text-sm whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'btn--primary',
        secondary: 'btn--secondary',
        tertiary: 'btn--tertiary',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'shadow-theme-xs border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        ghost: 'text-foreground hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      shape: {
        default: 'btn--rounded',
        pill: 'btn--pill',
        circle: 'rounded-full p-0',
      },
      size: {
        default: 'btn--md has-[>svg]:px-3',
        xs: "h-6 gap-1 px-2 text-sm has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'btn--lg has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      shape: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  shape = 'default',
  size = 'default',
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      className={cn(buttonVariants({ variant, shape, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
