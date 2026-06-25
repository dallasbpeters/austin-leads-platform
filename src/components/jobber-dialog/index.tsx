'use client'
import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import LeadCaptureForm from '@/components/LeadCaptureForm'

interface JobberDialogProps {
  buttonLabel?: string
  context?: Record<string, string>
}

export function JobberDialog({ buttonLabel = 'Book a Service', context }: JobberDialogProps) {
  const [open, setOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const analyticsParams = {
    form_id: 'jobber_dialog',
    button_label: buttonLabel,
    lead_type: context?.sourceType || 'consultation',
    source_section: context?.sourceSection || 'unknown',
    site_slug: context?.siteSlug || 'unknown',
    page_path: context?.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/unknown'),
  }

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
        <Button variant="default">{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent className="grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-4 sm:max-w-4xl sm:p-6">
        <DialogHeader className="mb-2 pr-8">
          <DialogTitle className="text-lg font-semibold">Book a Service</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto">{isReady && <LeadCaptureForm context={context} />}</div>
      </DialogContent>
    </Dialog>
  )
}
