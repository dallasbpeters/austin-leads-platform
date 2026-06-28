'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const BLOCKED_PATH_PREFIXES = ['/api', '/_next', '/studio']
const SITE_PREFIX_PATTERN = /^\/_site\/[^/]+/

function getPreviewSitePrefix(pathname) {
  const match = pathname.match(SITE_PREFIX_PATTERN)
  return match ? match[0] : ''
}

function isBlockedPath(pathname) {
  return BLOCKED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function buildPresentationHref(href, previewSitePrefix, origin) {
  if (!href || !previewSitePrefix) return null
  if (href.startsWith('#')) return null

  let url
  try {
    url = new URL(href, origin)
  } catch {
    return null
  }

  if (url.origin !== origin) return null
  if (!url.pathname.startsWith('/')) return null
  if (url.pathname.startsWith('/_site/')) return null
  if (isBlockedPath(url.pathname)) return null

  const nextPath = url.pathname === '/' ? `${previewSitePrefix}/` : `${previewSitePrefix}${url.pathname}`
  return `${nextPath}${url.search}${url.hash}`
}

function rewriteAnchorHrefs(previewSitePrefix) {
  const origin = window.location.origin
  const anchors = document.querySelectorAll('a[href]')

  for (const anchor of anchors) {
    const href = anchor.getAttribute('href')
    const presentationHref = buildPresentationHref(href, previewSitePrefix, origin)
    if (!presentationHref) continue
    if (anchor.getAttribute('href') === presentationHref) continue
    anchor.setAttribute('href', presentationHref)
  }
}

export default function PresentationLinkBridge() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const previewSitePrefix = getPreviewSitePrefix(pathname)
    if (!previewSitePrefix) return

    rewriteAnchorHrefs(previewSitePrefix)

    const observer = new MutationObserver(() => {
      rewriteAnchorHrefs(previewSitePrefix)
    })

    observer.observe(document.body, { childList: true, subtree: true })

    const handleClick = (event) => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      const presentationHref = buildPresentationHref(href, previewSitePrefix, window.location.origin)
      if (!presentationHref) return

      event.preventDefault()
      router.push(presentationHref)
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', handleClick, true)
    }
  }, [pathname, router])

  return null
}
