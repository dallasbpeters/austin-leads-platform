import posthog from 'posthog-js'

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim()

const missingVariable = !projectToken
  ? 'NEXT_PUBLIC_POSTHOG_KEY'
  : !apiHost
    ? 'NEXT_PUBLIC_POSTHOG_HOST'
    : null

if (!projectToken || !apiHost) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    )
  }
} else {
  /*
   * Off in local development unless NEXT_PUBLIC_POSTHOG_IN_DEV=true: local clicks would
   * land in the real project, and debug logging floods the console. It still
   * initialises (opted out, loading nothing), so posthog.* calls elsewhere stay safe.
   */
  const offInDev = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_POSTHOG_IN_DEV !== 'true'

  posthog.init(projectToken, {
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
