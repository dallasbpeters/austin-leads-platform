import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "gap-2 text-sm aria-invalid:border-destructive focus-visible:border-ring disabled:opacity-50 btn cursor-pointer grid-auto-flow-column grid outline-none place-items-center shrink-0 whitespace-nowrap [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:pointer-events-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          'btn--primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_10px_0_hsl(0_0%_0%_/_0.10)]',
        dark:
          'bg-mist-900 text-white hover:bg-mist-900/90 shadow-[0_4px_10px_0_hsl(0_0%_0%_/_0.10)]',
        secondary: 'btn--secondary',
        tertiary: 'btn--tertiary',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'border border-border bg-background text-foreground hover:bg-muted hover:text-foreground dark:border-input dark:hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted/80 hover:text-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      shape: {
        default: 'btn--rounded',
        pill: 'rounded-full btn--pill',
        circle: 'rounded-full p-0',
      },
      size: {
        default: 'btn--md has-[svg]:px-3',
        xs: "h-6 gap-1 px-2 text-sm has-[svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1.5 px-3 has-[svg]:px-2.5',
        md: 'h-9 gap-2 px-4 has-[svg]:px-3',
        lg: 'btn--lg has-[svg]:px-4',
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

type ButtonVariant = 'default' | 'dark' | 'secondary' | 'tertiary' | 'destructive' | 'outline' | 'ghost' | 'link'
type ButtonShape = 'default' | 'pill' | 'circle'
type ButtonSize = 'default' | 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

/** Native `className` is omitted then re-added optional — avoids TS intersection marking it required with index signatures. */
export type ButtonProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'size' | 'className'> & {
  className?: string
  variant?: ButtonVariant
  shape?: ButtonShape
  size?: ButtonSize
  asChild?: boolean
  /** Prefer `shape="pill"` — absorbed here so it is not forwarded to the DOM */
  pill?: boolean
  /** Adds `w-full`; not a valid HTML attribute */
  fullWidth?: boolean
  /**
   * When set (non-empty string), renders `<a>` so hash links and navigations work.
   * A plain `<button href>` does not scroll to anchors.
   */
  href?: React.AnchorHTMLAttributes<HTMLAnchorElement>['href']
  /**
   * Classes on the inner `<span>` that wraps `children` (`<button>` / `<a>` only).
   * Default is a real flex box (not `contents`) so `z-index` layers above `::after`
   * hover fills / clip-path work; pass `contents` if you need hoisted grid children.
   */
  innerClassName?: string
}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  {
    className,
    variant = 'default',
    shape = 'default',
    size = 'default',
    asChild = false,
    pill,
    fullWidth,
    href,
    type,
    innerClassName,
    children,
    ...props
  },
  ref,
) {
  const resolvedShape = pill === true ? 'pill' : shape
  const classes = cn(
    buttonVariants({ variant, shape: resolvedShape, size, className }),
    fullWidth ? 'w-full' : null,
  )

  const dataAttrs = {
    'data-slot': 'button',
    'data-variant': variant,
    'data-size': size,
    'data-shape': resolvedShape,
  } as const

  if (asChild) {
    return (
      <Slot.Root ref={ref} className={classes} {...dataAttrs} {...props}>
        {children}
      </Slot.Root>
    )
  }

  const inner = (
    <span
      data-slot="button-inner"
      className={cn(
        'inline-flex max-w-full min-w-fit items-center justify-center gap-[inherit]',
        innerClassName,
      )}
    >
      {children}
    </span>
  )

  const hrefString = href != null ? String(href).trim() : ''
  if (hrefString !== '') {
    const anchorRest = props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...dataAttrs}
        {...anchorRest}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type ?? 'button'}
      className={classes}
      {...dataAttrs}
      {...props}
    >
      {inner}
    </button>
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
