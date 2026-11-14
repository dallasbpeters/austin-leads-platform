'use client'

import posthog from 'posthog-js'

/*
 * gtag.js handles each event on the main thread. On a mid-range phone, one event
 * takes 100+ ms. Most events come from tap and key handlers, so this work delays
 * the next paint (INP). We queue Google events until after that paint. When the
 * page is hidden, we send the queue at once, so a navigation does not drop it.
 */
const pendingGoogleEvents = []

function sendToGoogle(eventName, params) {
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params)
    } catch {
      // Keep UX resilient even if GA is unavailable.
    }
  }

  try {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      })
    }
  } catch {
    // Keep UX resilient even if GTM dataLayer is unavailable.
  }
}

function flushGoogleEvents() {
  while (pendingGoogleEvents.length > 0) {
    sendToGoogle(...pendingGoogleEvents.shift())
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushGoogleEvents)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushGoogleEvents()
    }
  })
}

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

  pendingGoogleEvents.push([eventName, params])
  if (pendingGoogleEvents.length === 1) {
    window.requestAnimationFrame(() => setTimeout(flushGoogleEvents, 0))
  }
}
