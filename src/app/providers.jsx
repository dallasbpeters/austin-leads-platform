'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

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

const getElementLabel = (element) => {
  if (!element) {
    return 'unknown'
  }

  const explicitLabel = element.dataset.analyticsName
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

  const textContent = (element.textContent || '').replaceAll(/\s+/g, ' ').trim()
  if (textContent) {
    return textContent.slice(0, 120)
  }

  return 'unnamed_button'
}

const getSafeHrefPath = (element) => {
  if (!element || element.tagName !== 'A') {
    return
  }

  const href = element.getAttribute('href')
  if (!href) {
    return
  }

  try {
    const parsed = new URL(href, window.location.origin)
    return `${parsed.pathname}${parsed.hash || ''}`
  } catch {
    return
  }
}

export const PostHogIdentifyUser = ({ user }) => {
  useEffect(() => {
    if (!user?.id) {
      return
    }

    posthog.identify(String(user.id), {
      email: user.email || undefined,
      name: user.name || undefined,
      role: user.role || undefined,
    })
  }, [user?.email, user?.id, user?.name, user?.role])

  return null
}

export const AnalyticsProvider = ({ children, siteSlug }) => {
  useEffect(() => {
    posthog.register({ site_slug: siteSlug || 'unknown' })
  }, [siteSlug])

  // Manual page view tracking — fires on initial mount and on every
  // `popstate` (back/forward) so SPA navigation is captured in both
  // PostHog and GA4.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const trackPageView = () => {
      trackAnalyticsEvent('page_view', {
        page_path: window.location.pathname,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer || undefined,
      })
    }

    trackPageView()

    window.addEventListener('popstate', trackPageView)
    return () => window.removeEventListener('popstate', trackPageView)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleDocumentClick = (event) => {
      const { target } = event
      if (!(target instanceof Element)) {
        return
      }

      const buttonElement = target.closest(TRACKABLE_BUTTON_SELECTOR)
      if (!buttonElement) {
        return
      }

      if (buttonElement.dataset.analyticsIgnore === 'true') {
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
      return
    }

    // `<a href="tel:…">`, `mailto:…`, and `sms:…` clicks skip the global
    // button tracker (it only matches buttons / role="button" / opt-in anchors),
    // so capture them separately. Useful on the Christmas site where the
    // hero and footer CTAs phone/text the operator directly.
    const handleContactClick = (event) => {
      const { target } = event
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest('a[href]')
      if (!anchor) {
        return
      }

      const href = anchor.getAttribute('href') || ''
      const lower = href.toLowerCase()
      const linkType = lower.startsWith('tel:')
        ? 'tel'
        : lower.startsWith('mailto:')
          ? 'mailto'
          : lower.startsWith('sms:')
            ? 'sms'
            : null
      if (!linkType) {
        return
      }

      trackAnalyticsEvent('contact_link_clicked', {
        link_type: linkType,
        href,
        link_text: (anchor.textContent || '').replaceAll(/\s+/g, ' ').trim().slice(0, 120),
        page_path: window.location.pathname,
      })
    }

    document.addEventListener('click', handleContactClick, true)
    return () => {
      document.removeEventListener('click', handleContactClick, true)
    }
  }, [])

  // Scroll depth tracking — fires once per milestone (25%, 50%, 75%, 100%)
  // so we can measure content engagement without spamming events.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const milestones = [25, 50, 75, 100]
    const fired = new Set()

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const scrollable = docHeight - windowHeight
      if (scrollable <= 0) {
        return
      }

      const scrollPercent = Math.round((scrollTop / scrollable) * 100)

      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !fired.has(milestone)) {
          fired.add(milestone)
          trackAnalyticsEvent('scroll_depth', {
            scroll_depth_percent: milestone,
            page_path: window.location.pathname,
          })
        }
      }
    }

    // Throttle scroll handler to ~16ms (60fps)
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [])

  return children
}
