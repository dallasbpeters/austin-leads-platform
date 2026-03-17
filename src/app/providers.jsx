'use client'

import { useEffect } from 'react'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key || !host) {
      return
    }

    posthog.init(key, {
      api_host: host,
      defaults: '2026-01-30',
      loaded: (instance) => {
        if (typeof window !== 'undefined') {
          window.posthog = instance
        }
      },
    })

    if (typeof window !== 'undefined') {
      window.posthog = posthog
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}