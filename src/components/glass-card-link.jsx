'use client'

import { ArrowUpRight } from 'iconoir-react'
import Link, { useLinkStatus } from 'next/link'

import { resolveSectionAnchor } from '@/components/platform/public-site-utils'

/** The section id a link points to on the current page, or null for a link to another page. */
function samePageHashId(href) {
  const url = new URL(href, window.location.href)
  if (!url.hash || url.origin !== window.location.origin || url.pathname !== window.location.pathname) {
    return null
  }
  return decodeURIComponent(url.hash.slice(1))
}

const elementWithId = (id) => document.querySelector(`#${CSS.escape(id)}`)

/*
 * A Sanity link to a section that was renamed ("#calculator-see-what-solar-could-save")
 * matches no id, and the tap does nothing. Send it to the section of the same type.
 */
function scrollToRenamedSection(event, href) {
  const id = samePageHashId(href)
  if (!id || elementWithId(id)) {
    return
  }
  const pageIds = Array.from(document.querySelectorAll('[id]'), (element) => element.id)
  const targetId = resolveSectionAnchor(id, pageIds)
  if (!targetId) {
    return
  }
  event.preventDefault()
  elementWithId(targetId).scrollIntoView()
  window.history.pushState(null, '', `#${targetId}`)
}

/* A page can take a few seconds on its first visit: show a spinner at once so the tap is not repeated. */
function LinkIcon() {
  const { pending } = useLinkStatus()
  return (
    <span className="solar-hero__glass-link-icon" data-pending={pending || undefined} aria-hidden="true">
      <ArrowUpRight strokeWidth={2} />
    </span>
  )
}

export default function GlassCardLink({ href, label }) {
  return (
    <Link
      href={href}
      className="solar-hero__glass-link"
      onClick={(event) => scrollToRenamedSection(event, href)}
    >
      <span className="solar-hero__glass-link-label">{label}</span>
      <LinkIcon />
    </Link>
  )
}
