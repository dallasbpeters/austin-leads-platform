'use client'

import { useEffect } from 'react'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { trackAnalyticsEvent } from '@/lib/analytics/client'

const TRACKABLE_BUTTON_SELECTOR = [
  'button',
  '[role="button"]',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  'a[role="button"]',
  'a[data-track-button="true"]',
].join(', ')

function getElementLabel(element) {
  if (!element) {
    return 'unknown'
  }

  const explicitLabel = element.getAttribute('data-analytics-name')
  if (explicitLabel) {
    return explicitLabel.trim().slice(0, 120)
  }

  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) {
    return ariaLabel.trim().slice(0, 120)
  }

  const title = element.getAttribute('title')
  if (title) {
    return title.trim().slice(0, 120)
  }

  const name = element.getAttribute('name')
  if (name) {
    return name.trim().slice(0, 120)
  }

  const value = element.getAttribute('value')
  if (value) {
    return value.trim().slice(0, 120)
  }

  const textContent = (element.textContent || '').replace(/\s+/g, ' ').trim()
  if (textContent) {
    return textContent.slice(0, 120)
  }

  return 'unnamed_button'
}

function getSafeHrefPath(element) {
  if (!element || element.tagName !== 'A') {
    return undefined
  }

  const href = element.getAttribute('href')
  if (!href) {
    return undefined
  }

  try {
    const parsed = new URL(href, window.location.origin)
    return `${parsed.pathname}${parsed.hash || ''}`
  } catch {
    return undefined
  }
}

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleDocumentClick = (event) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const buttonElement = target.closest(TRACKABLE_BUTTON_SELECTOR)
      if (!buttonElement) {
        return
      }

      if (buttonElement.getAttribute('data-analytics-ignore') === 'true') {
        return
      }

      const buttonLabel = getElementLabel(buttonElement)
      const hrefPath = getSafeHrefPath(buttonElement)

      trackAnalyticsEvent('ui_button_click', {
        event_source: 'global-button-tracker',
        page_path: window.location.pathname,
        page_url: window.location.href,
        button_label: buttonLabel,
        button_tag: buttonElement.tagName.toLowerCase(),
        button_type: buttonElement.getAttribute('type') || undefined,
        button_id: buttonElement.getAttribute('id') || undefined,
        href_path: hrefPath,
      })
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}