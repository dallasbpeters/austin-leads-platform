import posthog from 'posthog-js'

import { resolveBrowserPostHogConfig } from '@/lib/analytics/posthog-browser-config'

const { token, apiHost, missing } = resolveBrowserPostHogConfig({
  siteSlug: document.documentElement.dataset.analyticsSite,
  keyMap: process.env.NEXT_PUBLIC_POSTHOG_KEYS,
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
})

const missingMessage = `${missing.join(' and ')} required by PostHog is missing or un-configured. Set it in the deploy environment.`

// Name only the fallbacks that apply. A missing host alone still uses this site's own key.
const fallbacks = [
  missing.includes('NEXT_PUBLIC_POSTHOG_KEY')
    ? 'events go to the default Texas Solar and Roofing project'
    : null,
  missing.includes('NEXT_PUBLIC_POSTHOG_HOST') ? 'events go through /ingest' : null,
].filter(Boolean)

if (missing.length > 0 && process.env.NODE_ENV === 'development') {
  throw new Error(`${missingMessage} This error stops appearing once it is configured.`)
} else {
  if (missing.length > 0) {
    console.error(`[posthog] ${missingMessage} Until then, ${fallbacks.join(' and ')}.`)
  }

  /*
   * Off in local development unless NEXT_PUBLIC_POSTHOG_IN_DEV=true: local clicks would
   * land in the real project, and debug logging floods the console. It still
   * initialises (opted out, loading nothing), so posthog.* calls elsewhere stay safe.
   */
  const offInDev = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_POSTHOG_IN_DEV !== 'true'

  posthog.init(token, {
    api_host: apiHost,
    defaults: '2026-05-30',
    ...(offInDev
      ? {
          // Explicit, so a browser that remembers debug mode from before stops logging too.
          debug: false,
          opt_out_capturing_by_default: true,
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
          capture_exceptions: false,
          disable_session_recording: true,
          disable_surveys: true,
          disable_external_dependency_loading: true,
          advanced_disable_flags: true,
        }
      : {
          capture_pageview: true,
          capture_exceptions: true,
          debug: process.env.NODE_ENV === 'development',
          tracing_headers: [window.location.hostname],
        }),
  })
}
