import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'items-center justify-center w-fit gap-1 px-3 py-0.5 font-medium text-xs border border-transparent rounded-full aria-invalid:border-destructive focus-visible:border-ring transition-[color,box-shadow] inline-flex overflow-hidden shrink-0 whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 focus-visible:ring-[3px] focus-visible:ring-ring/50',
  {
    variants: {
      variant: {
        default: 'ring-muted-foreground ring-1 text-primary [a&]:hover:bg-primary/90',
        secondary: 'bg-secondary/10 text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        outline: 'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant = 'default', asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
