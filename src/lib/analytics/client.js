'use client'

import posthog from 'posthog-js'

export function trackAnalyticsEvent(eventName, params = {}) {
  if (!eventName) {
    return
  }

  try {
    posthog.capture(eventName, params)
  } catch {
    // Keep UX resilient even if PostHog is unavailable.
  }

  if (typeof window === 'undefined') {
    return
  }

  const hasGtag = typeof window.gtag === 'function'
  const hasDataLayer = Array.isArray(window.dataLayer)

  if (hasGtag) {
    try {
      window.gtag('event', eventName, params)
    } catch {
      // Keep UX resilient even if GA is unavailable.
    }
  }

  try {
    if (hasDataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      })
    }
  } catch {
    // Keep UX resilient even if GTM dataLayer is unavailable.
  }
}
