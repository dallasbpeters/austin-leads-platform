'use client'
import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import LeadCaptureForm from '@/components/LeadCaptureForm'

interface JobberDialogProps {
  buttonLabel?: string
  context?: Record<string, string>
}

export function JobberDialog({ buttonLabel = 'Book a Service', context }: JobberDialogProps) {
  const [open, setOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

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
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js'
    script.async = true
    document.body.appendChild(script)
    scriptRef.current = script

    return () => {
      document.head.removeChild(link)
      if (script.parentNode) document.body.removeChild(script)
      scriptRef.current = null
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
          <DialogDescription className="text-muted-foreground text-sm">
            Use the form below to request a service. We will get back to you as soon as possible to confirm
            the details and schedule your appointment.
          </DialogDescription>
        </DialogHeader>
        {isReady && <LeadCaptureForm context={context} />}
      </DialogContent>
    </Dialog>
  )
}
