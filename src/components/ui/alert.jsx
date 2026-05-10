import { AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

function Alert({ className, variant = 'default', ...props }) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border px-4 py-3 text-sm',
        variant === 'destructive'
          ? 'text-destructive bg-destructive/5 border-destructive/40'
          : 'text-card-foreground bg-card border-border',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }) {
  return <div className={cn('pl-6', className)} {...props} />
}

function AlertTitle({ className, ...props }) {
  return <h5 className={cn('mb-1 tracking-tight', className)} {...props} />
}

Alert.Icon = AlertCircle

export { Alert, AlertDescription, AlertTitle }
