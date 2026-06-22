'use client'

import { useEffect, useRef } from 'react'
import posthog from 'posthog-js'

import { trackAnalyticsEvent } from '@/lib/analytics/client'

let _jobberCheckoutScriptAdded = false

function JobberCheckoutForm() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasTrackedView = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (!hasTrackedView.current) {
      hasTrackedView.current = true

      const eventParams = {
        form_id: 'jobber_checkout_form',
        form_type: 'work_request',
        site_slug: 'txchristmaslights',
        page_path: typeof window !== 'undefined' ? window.location.pathname : '/unknown',
      }

      posthog.capture('jobber_form_view', eventParams)
      trackAnalyticsEvent('jobber_form_view', eventParams)
    }

    if (_jobberCheckoutScriptAdded) return
    _jobberCheckoutScriptAdded = true

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css'
    link.media = 'screen'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js'
    script.setAttribute('clienthub_id', 'e25e6086-5e48-4c5d-8588-8aa08968b7d6-4905459')
    script.setAttribute(
      'form_url',
      'https://clienthub.getjobber.com/client_hubs/e25e6086-5e48-4c5d-8588-8aa08968b7d6/public/work_request/embedded_work_request_form?form_id=4905459',
    )
    document.body.appendChild(script)
  }, [])

  return (
    <div className="grid h-full w-full place-items-center bg-white p-8 lg:p-16">
      <div ref={containerRef} id="e25e6086-5e48-4c5d-8588-8aa08968b7d6-4905459" />
    </div>
  )
}

export function SchedulingForm() {
  return (
    <section className="bg-primary text-background min-h-[70vh]">
      <div className="grid h-full min-h-[70vh] items-stretch overflow-hidden md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-[.9fr_1.1fr]">
        <div className="relative flex flex-col justify-center overflow-hidden px-8 py-16 md:px-20 lg:px-30 lg:py-24">
          <span
            className="text-background/10 pointer-events-none absolute top-1/2 -left-8 -translate-y-1/2 font-serif text-[20rem] leading-none select-none lg:text-[28rem]"
            aria-hidden="true"
          >
            01
          </span>
          <div className="relative z-10">
            <p className="text-background mb-8 text-sm tracking-[0.2em] uppercase">
              Book your holiday display
            </p>
            <h2 className="mb-8 font-serif text-4xl leading-[0.95] tracking-normal md:text-5xl lg:text-6xl">
              Let&apos;s get
              <br />
              <span className="italic">lit up.</span>
            </h2>
            <div className="text-background mb-8 max-w-md text-lg">
              Fill out the form and we&apos;ll get your holiday display scheduled and installed.
            </div>
            <div className="border-background/20 mb-8 inline-flex items-baseline gap-4 border-t pt-8">
              <span className="text-background/50 text-sm tracking-[0.15em] uppercase">Deposit</span>
              <span className="font-serif text-5xl lg:text-6xl">$150</span>
            </div>
          </div>
        </div>
        <div className="bg-background flex h-full flex-col overflow-hidden">
          <JobberCheckoutForm />
        </div>
      </div>
    </section>
  )
}
