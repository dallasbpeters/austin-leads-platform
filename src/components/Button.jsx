import { cn } from '@/lib/utils'

export default function Button({
  children,
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  pill = false,
  className,
  ...props
}) {
  const classes = cn(
    'btn',
    variant === 'primary' && 'btn--primary',
    variant === 'secondary' && 'btn--secondary',
    size === 'md' && 'btn--md',
    size === 'lg' && 'btn--lg',
    pill ? 'btn--pill' : 'btn--rounded',
    fullWidth && 'btn--full',
    className,
  )

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
