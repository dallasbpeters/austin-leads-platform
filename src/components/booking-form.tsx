'use client'

import posthog from 'posthog-js'
import { useEffect, useRef } from 'react'

import { JobberDialog } from '@/components/jobber-dialog'
import JobberWorkRequestEmbed, { JOBBER_FORM_IDS } from '@/components/jobber-work-request-embed'
import { trackAnalyticsEvent } from '@/lib/analytics/client'

const JobberCheckoutForm = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasTrackedView = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || hasTrackedView.current) {
      return
    }
    hasTrackedView.current = true

    const eventParams = {
      form_id: 'jobber_checkout_form',
      form_type: 'work_request',
      page_path: typeof window === 'undefined' ? '/unknown' : window.location.pathname,
      site_slug: 'txchristmaslights',
    }

    posthog.capture('jobber_form_view', eventParams)
    trackAnalyticsEvent('jobber_form_view', eventParams)
  }, [])

  return (
    <div ref={containerRef} className="grid h-full min-h-180 w-full grid-cols-1 place-items-center bg-white">
      <JobberWorkRequestEmbed className="rounded-none" formId={JOBBER_FORM_IDS.txchristmaslights} />
      <div className="bg-background/5 text-foreground/70 grid place-items-center space-y-3 px-8 pb-6 text-center text-sm sm:px-20 lg:px-30">
        <p className="text-foreground/70 max-w-md text-sm">
          Don&apos;t see a package you like? Contact us to discuss a custom holiday display.
        </p>
        <JobberDialog buttonLabel="Contact Us" title="Contact Us" formId={JOBBER_FORM_IDS.customLights} />
      </div>
    </div>
  )
}

/*
 * `headingLevel` exists because this form is both a page and a section. On
 * /book it is the whole page, so its headline has to be the h1; inside the
 * Christmas CTA section it sits under that page's h1 and stays an h2.
 */
export const SchedulingForm = ({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' } = {}) => {
  const Heading = headingLevel

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
            <Heading className="mb-8 font-serif text-4xl leading-[0.95] tracking-normal md:text-5xl lg:text-6xl">
              Let&apos;s get
              <br />
              <span className="italic">lit up.</span>
            </Heading>
            <div className="text-background mb-8 max-w-md text-lg">
              Fill out the form and we&apos;ll get your holiday display scheduled and installed.
            </div>
            <div className="border-background/20 mb-8 inline-flex items-baseline gap-4 border-t pt-8">
              <span className="text-background/50 text-sm tracking-[0.15em] uppercase">Deposit</span>
              <span className="font-serif text-5xl lg:text-6xl">30%</span>
            </div>
          </div>
        </div>
        <div className="flex h-full flex-col overflow-hidden bg-white">
          <JobberCheckoutForm />
        </div>
      </div>
    </section>
  )
}
