// oxlint-disable no-negated-condition func-style react-hooks/exhaustive-deps
'use client'
import JobberWorkRequestEmbed from '@/components/jobber-work-request-embed'
import LeadCaptureForm from '@/components/lead-capture-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Floating-action-button positioning for the bottom-right corner.
const FAB_CLASSES = 'fixed right-5 bottom-5 z-50 size-14 rounded-full sm:right-6 sm:bottom-6'

interface JobberDialogProps {
  buttonLabel?: string
  title?: string
  // When provided, the dialog opens this specific Jobber work request form
  // directly instead of the default lead-capture form.
  formId?: string
  context?: Record<string, string>
  // Optional leading icon rendered inside the trigger button.
  icon?: ReactNode
  // Render an icon-only trigger; buttonLabel is used as the accessible label.
  iconOnly?: boolean
  // Pin the trigger as a floating action button in the bottom-right corner.
  fixed?: boolean
  triggerClassName?: string
  variant?: 'default' | 'inverse' | 'secondary' | 'tertiary'
}

export function JobberDialog({
  buttonLabel = 'Book a Service',
  title = 'Book a Service',
  formId,
  context,
  icon,
  iconOnly = false,
  fixed = false,
  triggerClassName,
  variant = 'tertiary',
}: JobberDialogProps) {
  const [open, setOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const analyticsParams = useMemo(
    () => ({
      form_id: 'jobber_dialog',
      button_label: buttonLabel,
      lead_type: context?.sourceType || 'consultation',
      source_section: context?.sourceSection || 'unknown',
      site_slug: context?.siteSlug || 'unknown',
      page_path: context?.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/unknown'),
    }),
    [buttonLabel, context?.sourceType, context?.sourceSection, context?.siteSlug, context?.pagePath],
  )

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (next) {
        trackAnalyticsEvent('lead_form_dialog_opened', analyticsParams)
      } else {
        trackAnalyticsEvent('lead_form_dialog_closed', analyticsParams)
      }
    },
    [analyticsParams],
  )

  useEffect(() => {
    if (open && !isReady) {
      const timer = setTimeout(() => setIsReady(true), 50)
      return () => clearTimeout(timer)
    }
  }, [open, isReady])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={iconOnly ? 'icon' : 'default'}
          aria-label={iconOnly ? buttonLabel : undefined}
          className={cn(fixed && FAB_CLASSES, triggerClassName)}
        >
          {icon}
          {iconOnly ? null : buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="grid max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-4 sm:max-w-3xl sm:p-6">
        <DialogHeader className="mb-2 pr-8">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto">
          {isReady &&
            (formId ? <JobberWorkRequestEmbed formId={formId} /> : <LeadCaptureForm context={context} />)}
        </div>
      </DialogContent>
    </Dialog>
  )
}
