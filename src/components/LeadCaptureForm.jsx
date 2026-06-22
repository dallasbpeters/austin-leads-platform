'use client'

import { useEffect, useRef } from 'react'
import { trackAnalyticsEvent } from '@/lib/analytics/client'

// Module-level guard: Jobber's async script can't be safely removed and re-added
// (the in-flight request still completes and injects even after DOM removal).
// Load once per page session and let Jobber manage the iframe lifecycle.
let _jobberScriptAdded = false

export default function LeadCaptureForm({ context }) {
  const formRef = useRef(null)
  const hasTrackedViewRef = useRef(false)

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
      {
        threshold: 0.35,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [context])

  useEffect(() => {
    if (_jobberScriptAdded) return
    _jobberScriptAdded = true

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css'
    link.media = 'screen'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js'
    script.setAttribute('clienthub_id', 'e25e6086-5e48-4c5d-8588-8aa08968b7d6-4904121')
    script.setAttribute(
      'form_url',
      'https://clienthub.getjobber.com/client_hubs/e25e6086-5e48-4c5d-8588-8aa08968b7d6/public/work_request/embedded_work_request_form?form_id=4904121',
    )
    document.body.appendChild(script)
  }, [])

  return (
    <div ref={formRef}>
      <div id="e25e6086-5e48-4c5d-8588-8aa08968b7d6-4904121"></div>
    </div>
  )
}
