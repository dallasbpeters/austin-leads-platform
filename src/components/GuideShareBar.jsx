'use client'

import { useMemo, useState } from 'react'
import { Facebook, X, Linkedin, Mail, Copy, Check } from 'iconoir-react'
import { trackAnalyticsEvent } from '@/lib/analytics/client'

const shareLinks = [
  { id: 'x', label: 'Share on X', Icon: X },
  { id: 'facebook', label: 'Share on Facebook', Icon: Facebook },
  { id: 'linkedin', label: 'Share on LinkedIn', Icon: Linkedin },
  { id: 'email', label: 'Share by email', Icon: Mail },
]

function buildShareHref(type, url, title) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title || '')

  if (type === 'x') {
    return `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
  }

  if (type === 'facebook') {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  }

  if (type === 'linkedin') {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  }

  if (type === 'email') {
    return `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
  }

  return '#'
}

export default function GuideShareBar({ url = '', title = '' }) {
  const [copied, setCopied] = useState(false)
  const items = useMemo(
    () =>
      shareLinks.map((item) => ({
        ...item,
        href: buildShareHref(item.id, url, title),
      })),
    [title, url],
  )

  const getPagePath = () => {
    if (typeof window !== 'undefined' && window.location?.pathname) {
      return window.location.pathname
    }

    try {
      return new URL(url).pathname || '/unknown'
    } catch {
      return '/unknown'
    }
  }

  const buildShareEventProps = (platform) => ({
    event_source: 'guide_share_bar',
    share_platform: platform,
    page_path: getPagePath(),
    page_url: url,
    guide_title: title || 'unknown',
  })

  const handleShareClick = (platform) => {
    trackAnalyticsEvent('guide_share_click', buildShareEventProps(platform))
  }

  const handleCopy = async () => {
    if (!url || typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      trackAnalyticsEvent('guide_share_copy_link', {
        ...buildShareEventProps('copy_link'),
        copy_status: 'success',
      })
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      trackAnalyticsEvent('guide_share_copy_link', {
        ...buildShareEventProps('copy_link'),
        copy_status: 'error',
      })
    }
  }

  if (!url) {
    return null
  }

  return (
    <section className="relative z-30 w-full">
      <div className="bg-gradient grid grid-flow-col place-content-end place-items-center gap-2 border-y border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <p className="mr-2 font-semibold text-sm text-foreground">Share this guide:</p>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target={item.id === 'email' ? undefined : '_blank'}
            rel={item.id === 'email' ? undefined : 'noopener noreferrer'}
            onClick={() => handleShareClick(item.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-none bg-background text-foreground transition-colors hover:bg-muted"
            aria-label={item.label}
            title={item.label}
          >
            <item.Icon width={16} height={16} />
          </a>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-9 w-9 items-center justify-center rounded-none bg-background text-foreground transition-colors hover:bg-muted"
          aria-label="Copy guide link"
          title={copied ? 'Copied' : 'Copy link'}
        >
          {copied ? <Check width={16} height={16} /> : <Copy width={16} height={16} />}
        </button>
      </div>
    </section>
  )
}
