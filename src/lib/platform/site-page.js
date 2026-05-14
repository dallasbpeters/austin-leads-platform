import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import App from '@/App'
import PublicSite from '@/components/platform/PublicSite'
import { getHeroImageUrl } from '@/lib/platform/imageSource'
import {
  createJsonLd,
  getHomepageForSite,
  getHomepageReviewsForSite,
  getHeroHomepageForSite,
  getPageForRequest,
  getPrimaryUrl,
  isPrimarySiteSlug,
  resolveNavigationForSite,
  resolveSiteByHost,
  resolveSiteBySlug,
} from '@/lib/platform/content'
import { isTxChristmasLightsSite, TX_CHRISTMAS_PUBLIC_COLLAGE_SRC, TX_CHRISTMAS_PUBLIC_LOGO_SRC } from '@/components/platform/PublicSiteUtils'
import { isHeroSectionBlock } from '@/lib/platform/section-helpers'

/**
 * Sanity Presentation passes ?__site=<slug> so the multi-tenant renderer can
 * serve any tenant through the configured preview origin (localhost in dev,
 * primary domain in prod).
 *
 * Security: the override is only honoured when:
 *   a) Next.js draft mode is active, OR
 *   b) The request host is localhost/127.0.0.1 (local dev only)
 *
 * This prevents public production traffic from spoofing the site parameter
 * while still allowing local Presentation previews before draft mode is
 * explicitly enabled.
 */
async function resolveCurrentSite(searchParams) {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? ''
  const isLocalHost = host.includes('localhost') || host.startsWith('127.0.0.1')

  const { isEnabled: isDraftMode } = await import('next/headers').then((m) => m.draftMode())
  const allowOverride = isDraftMode || isLocalHost

  const siteOverride = allowOverride ? (searchParams?.__site ?? null) : null
  if (siteOverride) {
    const overrideSite = await resolveSiteBySlug(siteOverride)
    if (overrideSite) return overrideSite
  }

  return resolveSiteByHost(host)
}

function getCurrentOrigin(host, forwardedProto) {
  if (!host) {
    return null
  }

  const protocol =
    forwardedProto || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
  return `${protocol}://${host}`
}

function getOriginFromAbsoluteUrl(url) {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

function resolveCanonicalUrl({ page, site, pathname, fallbackCanonical }) {
  const pageCanonical = page?.seo?.canonicalUrl
  if (pageCanonical) {
    try {
      const parsed = new URL(pageCanonical)
      const canonicalPath = parsed.pathname || '/'
      const isHomepageCanonical = canonicalPath === '/' || canonicalPath === ''

      // Guard against CMS values accidentally set to homepage on non-home routes.
      if (pathname !== '/' && isHomepageCanonical) {
        return fallbackCanonical
      }
    } catch {
      // If the canonical is malformed, fall back safely.
      return fallbackCanonical
    }

    return pageCanonical
  }

  const siteCanonical = site?.seo?.canonicalUrl
  if (!siteCanonical) {
    return fallbackCanonical
  }

  // Site-level canonical should only act as homepage canonical.
  if (pathname === '/') {
    return siteCanonical
  }

  return fallbackCanonical
}

function getPageHeroImage(page) {
  const sectionHero = page?.sections?.find(isHeroSectionBlock) ?? null

  return (
    getHeroImageUrl(page?.heroAsset, page?.heroImage) ||
    getHeroImageUrl(sectionHero?.heroAsset, sectionHero?.heroImage) ||
    ''
  )
}

function buildOgImageUrl(origin, site, page, pathname) {
  const url = new URL('/api/og', origin)
  const isGuidePageByPath = String(pathname || '').startsWith('/guides')
  const isGuidePageByData = page?.pageType === 'post' && String(page?.slug || '').startsWith('guides/')
  const isGuidePage = isGuidePageByPath || isGuidePageByData
  const title = page.seo?.title || page.title || site.name
  const description = page.seo?.description || page.description || ''

  if (isGuidePage) {
    const guideSlug = String(pathname || '')
      .split('/')
      .filter(Boolean)
      .at(-1)
    return new URL(`/api/og-image/guides/${encodeURIComponent(guideSlug || '')}`, origin).toString()
  }

  url.searchParams.set('site', site.name)
  url.searchParams.set('title', title)

  if (description) {
    url.searchParams.set('description', description)
  }

  if (isTxChristmasLightsSite(site)) {
    url.searchParams.set('theme', 'txchristmaslights')
    url.searchParams.set('image', new URL(TX_CHRISTMAS_PUBLIC_COLLAGE_SRC, origin).toString())
    url.searchParams.set('primary', '#ea580c')
    url.searchParams.set('secondary', '#14532d')
  } else {
    if (site.brand?.primary) {
      url.searchParams.set('primary', site.brand.primary)
    }

    if (site.brand?.secondary) {
      url.searchParams.set('secondary', site.brand.secondary)
    }
  }

  if (pathname && pathname !== '/') {
    url.searchParams.set('path', pathname)
  }

  if (page?._updatedAt) {
    url.searchParams.set('v', String(new Date(page._updatedAt).getTime() || page._updatedAt))
  }

  if (!isTxChristmasLightsSite(site)) {
    const heroImage = getPageHeroImage(page)
    if (heroImage) {
      url.searchParams.set('image', heroImage)
    }
  }

  return url.toString()
}

export async function buildMetadataForCurrentSite(slugParts = [], searchParams = {}) {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const forwardedProto = requestHeaders.get('x-forwarded-proto')
  const site = await resolveCurrentSite(searchParams)
  if (!site) return { title: 'Not found', robots: { index: false, follow: false } }
  const page = await getPageForRequest(site, slugParts)
  const normalizedHost = (host || '').toLowerCase()
  const isIndexableHost =
    normalizedHost === site.primaryDomain ||
    site.aliases?.includes(normalizedHost) ||
    normalizedHost === `www.${site.primaryDomain}`

  if (!page) {
    return {
      title: `${site.name} | Page not found`,
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const pathname = slugParts.length ? `/${slugParts.join('/')}` : '/'
  const isGuidePageByPath = pathname.startsWith('/guides')
  const isGuidePageByData = page.pageType === 'post' && String(page?.slug || '').startsWith('guides/')
  const isGuidePage = isGuidePageByPath || isGuidePageByData
  const fallbackCanonical = getPrimaryUrl(site, pathname)
  const canonical = resolveCanonicalUrl({ page, site, pathname, fallbackCanonical })
  const currentOrigin =
    getCurrentOrigin(host, forwardedProto) || getOriginFromAbsoluteUrl(canonical) || canonical
  const title = page.seo?.title || page.title || site.seo?.title || site.name
  const description = page.seo?.description || page.description || site.seo?.description
  const computedOgImage = buildOgImageUrl(currentOrigin, site, page, pathname)
  const ogImage = isGuidePage ? computedOgImage : page.seo?.ogImage || site.seo?.ogImage || computedOgImage
  const shouldIndex = isIndexableHost && page.seo?.noIndex !== true && site.seo?.noIndex !== true
  const facebookAppId = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || '').trim()

  const ogLogoBase =
    (typeof currentOrigin === 'string' && currentOrigin.startsWith('http') ? currentOrigin : null) ||
    (typeof canonical === 'string' && canonical.startsWith('http') ? new URL(canonical).origin : null) ||
    `https://${host || 'localhost'}`
  const ogLogoUrl = isTxChristmasLightsSite(site)
    ? new URL(TX_CHRISTMAS_PUBLIC_LOGO_SRC, ogLogoBase).toString()
    : null

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      appId: facebookAppId || undefined,
      locale: 'en_US',
      type: page.pageType === 'post' ? 'article' : 'website',
      images: [
        {
          url: ogImage,
          type: 'image/png',
          width: 1200,
          height: 630,
          alt: `${title} | ${site.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
    },
    ...(ogLogoUrl ? { other: { 'og:logo': ogLogoUrl } } : {}),
  }
}

export async function renderCurrentSitePage(slugParts = [], searchParams = {}) {
  const site = await resolveCurrentSite(searchParams)

  if (!site) notFound()

  if (isPrimarySiteSlug(site.slug) && slugParts.length === 0) {
    const homepage = await getHomepageForSite(site.slug)
    const heroHomepage = await getHeroHomepageForSite(site.slug)
    const heroSection = homepage
      ? (homepage.heroSection ?? homepage.sections?.find(isHeroSectionBlock) ?? null)
      : (heroHomepage?.heroSection ?? null)
    const resourcesSection =
      homepage?.sections?.find((section) => section._type === 'resourceGridSection') ??
      homepage?.sections?.find((section) => section.type === 'resourceGrid') ??
      homepage?.sections?.find((section) => section.type === 'resources') ??
      null
    const reviews = await getHomepageReviewsForSite(site.slug)
    const jsonLd = createJsonLd(site, homepage || heroHomepage, '/')

    return (
      <App
        homepage={homepage}
        heroSection={heroSection}
        resourcesSection={resourcesSection}
        reviews={reviews}
        site={site}
        jsonLd={jsonLd}
        homepageSource={homepage?.source || heroHomepage?.source || 'fixture'}
      />
    )
  }

  const page = await getPageForRequest(site, slugParts)

  if (!page) {
    notFound()
  }

  const pathname = slugParts.length ? `/${slugParts.join('/')}` : '/'
  const hasTestimonialsSection = Array.isArray(page.sections)
    ? page.sections.some((section) => section.type === 'testimonials')
    : false
  const reviews = hasTestimonialsSection ? await getHomepageReviewsForSite(site.slug) : []

  return (
    <PublicSite
      site={site}
      page={page}
      pathname={pathname}
      navigation={resolveNavigationForSite(site)}
      jsonLd={createJsonLd(site, page, pathname)}
      reviews={reviews}
    />
  )
}
