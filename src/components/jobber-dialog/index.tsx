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

  useEffect(() => {
    if (!isReady) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css'
    link.media = 'screen'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [isReady])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-h-[80vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold">Book a Service</DialogTitle>
        </DialogHeader>
        {isReady && <LeadCaptureForm context={context} />}
      </DialogContent>
    </Dialog>
  )
}
