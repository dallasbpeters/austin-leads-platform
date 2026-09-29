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
  posthog.init(projectToken, {
    api_host: apiHost,
    capture_pageview: false,
    capture_exceptions: true,
    defaults: '2026-01-30',
    debug: process.env.NODE_ENV === 'development',
    tracing_headers: [window.location.hostname],
  })
}
