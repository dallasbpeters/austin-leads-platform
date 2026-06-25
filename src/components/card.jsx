import { cn } from '@/lib/utils'

export default function Card({
  as: Tag = 'div',
  children,
  variant = 'surface',
  radius = 'md',
  className,
  ...props
}) {
  return (
    <Tag
      className={cn(
        'card',
        radius === 'md' && 'card--radius-md',
        radius === 'lg' && 'card--radius-lg',
        variant === 'surface' && 'card--surface',
        variant === 'surfaceStrong' && 'card--surface-strong',
        variant === 'media' && 'card--media',
        variant === 'color' && 'card--color',
        variant === 'darkGlass' && 'card--dark-glass',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
