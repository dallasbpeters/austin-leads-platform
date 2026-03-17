'use client'

import { sendGAEvent } from '@next/third-parties/google'
import posthog from 'posthog-js'

export function trackAnalyticsEvent(eventName, params = {}) {
  if (!eventName) return

  try {
    posthog.capture(eventName, params)
  } catch {
    // Keep UX resilient even if PostHog is unavailable.
  }

  try {
    sendGAEvent('event', eventName, params)
  } catch {
    // Keep UX resilient even if GA is unavailable.
  }

  if (typeof window === 'undefined') return

  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: eventName,
      ...params,
    })
  } catch {
    // Keep UX resilient even if GTM dataLayer is unavailable.
  }
}
