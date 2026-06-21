'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

import { trackAnalyticsEvent } from '@/lib/analytics/client'

const DEFAULT_POSTHOG_KEY = 'phc_adMRNqeoByZifxH3nDyCgZfjnMFIUIDnjKbytwTRNIk'
// Route through the app's own domain so content blockers can't identify the scripts.
// next.config.mjs rewrites /ingest/* → us.i.posthog.com/* and
// /ingest/static/* → us-assets.i.posthog.com/static/*
const DEFAULT_POSTHOG_HOST = '/ingest'

/**
 * Parse NEXT_PUBLIC_POSTHOG_KEYS once. Expected format:
 * {"txchristmaslights":"phc_xxx","texas-solar-and-roofing-pros":"phc_yyy"}
 */
function parsePostHogKeyMap() {
  const raw = process.env.NEXT_PUBLIC_POSTHOG_KEYS
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const POSTHOG_KEY_MAP = parsePostHogKeyMap()

function resolvePostHogKey(siteSlug) {
  if (siteSlug && POSTHOG_KEY_MAP[siteSlug]) return POSTHOG_KEY_MAP[siteSlug]
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || DEFAULT_POSTHOG_KEY
}

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

export function PostHogProvider({ children, siteSlug }) {
  useEffect(() => {
    const key = resolvePostHogKey(siteSlug)
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_POSTHOG_HOST

    if (!key || !host) {
      return
    }

    posthog.init(key, {
      api_host: host,
      ui_host: 'https://us.posthog.com',
      defaults: '2026-01-30',
      loaded: (instance) => {
        // Stamp every event with the active site so per-site dashboards can
        // group/filter without each call-site repeating `site_slug:` props.
        // Call sites are free to still pass `site_slug` explicitly — explicit
        // props override super properties when both are set.
        instance.register({ site_slug: siteSlug || 'unknown' })
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    // `<a href="tel:…">`, `mailto:…`, and `sms:…` clicks skip the global
    // button tracker (it only matches buttons / role="button" / opt-in anchors),
    // so capture them separately. Useful on the Christmas site where the
    // hero and footer CTAs phone/text the operator directly.
    const handleContactClick = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href') || ''
      const lower = href.toLowerCase()
      const linkType = lower.startsWith('tel:')
        ? 'tel'
        : lower.startsWith('mailto:')
          ? 'mailto'
          : lower.startsWith('sms:')
            ? 'sms'
            : null
      if (!linkType) return

      trackAnalyticsEvent('contact_link_clicked', {
        link_type: linkType,
        href,
        link_text: (anchor.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        page_path: window.location.pathname,
      })
    }

    document.addEventListener('click', handleContactClick, true)
    return () => {
      document.removeEventListener('click', handleContactClick, true)
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
