// oxlint-disable unicorn/no-negated-condition
'use client'

import JobberWorkRequestEmbed, { JOBBER_FORM_IDS } from '@/components/jobber-work-request-embed'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import { useEffect, useRef } from 'react'

export default function LeadCaptureForm({ context }) {
  const formRef = useRef(null)
  const hasTrackedViewRef = useRef(false)
  const formId =
    context?.siteSlug === 'txchristmaslights' ? JOBBER_FORM_IDS.txchristmaslights : JOBBER_FORM_IDS.default

  useEffect(() => {
    const element = formRef.current
    if (!element || hasTrackedViewRef.current) {
      return
    }

    const trackView = () => {
      if (hasTrackedViewRef.current) {
        return
      }
      hasTrackedViewRef.current = true

      trackAnalyticsEvent('lead_form_view', {
        form_id: 'lead_capture_form',
        lead_type: context?.sourceType || 'consultation',
        source_section: context?.sourceSection || 'unknown',
        site_slug: context?.siteSlug || 'unknown',
        page_path:
          context?.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/unknown'),
      })
    }

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      trackView()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackView()
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [context])

  return (
    <div ref={formRef}>
      <JobberWorkRequestEmbed formId={formId} requestFormUrl={context?.jobberRequestFormUrl} />
    </div>
  )
}
