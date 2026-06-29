// oxlint-disable func-style unicorn/prefer-array-find
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import App from '@/App'
import PublicSite from '@/components/platform/public-site'
import {
  isTxChristmasLightsSite,
  TX_CHRISTMAS_PUBLIC_OG_IMAGE_SRC,
} from '@/components/platform/public-site-utils'
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
import { getHeroImageUrl } from '@/lib/platform/imageSource'
import { isHeroSectionBlock } from '@/lib/platform/section-helpers'
import { SHARE_DESCRIPTION_MAX, SHARE_TITLE_MAX, truncateForShare } from '@/lib/platform/social-share-text'

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
    if (overrideSite) {
      return overrideSite
    }
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

function isGuidePath(pathname) {
  return String(pathname || '').startsWith('/guides')
}

function isGuidePageData(page) {
  return page?.pageType === 'post' && String(page?.slug || '').startsWith('guides/')
}

function buildGuideOgImageUrl(origin, pathname) {
  const guideSlug = String(pathname || '')
    .split('/')
    .filter(Boolean)
    .at(-1)
  return new URL(`/api/og-image/guides/${encodeURIComponent(guideSlug || '')}`, origin).toString()
}

function applyChristmasBrandParams(url, origin) {
  url.searchParams.set('theme', 'txchristmaslights')
  url.searchParams.set('image', new URL(TX_CHRISTMAS_PUBLIC_OG_IMAGE_SRC, origin).toString())
  url.searchParams.set('primary', '#ea580c')
  url.searchParams.set('secondary', '#14532d')
}

function applyStandardBrandParams(url, site) {
  if (site.brand?.primary) {
    url.searchParams.set('primary', site.brand.primary)
  }
  if (site.brand?.secondary) {
    url.searchParams.set('secondary', site.brand.secondary)
  }
}

function applyHeroImageIfSlug(url, site, page) {
  if (isTxChristmasLightsSite(site)) {
    return
  }
  const heroImage = getPageHeroImage(page)
  if (heroImage) {
    url.searchParams.set('image', heroImage)
  }
}

function buildOgImageUrl(origin, site, page, pathname) {
  const url = new URL('/api/og', origin)
  const isGuidePage = isGuidePath(pathname) || isGuidePageData(page)

  if (isGuidePage) {
    return buildGuideOgImageUrl(origin, pathname)
  }

  const rawTitle = page.seo?.title || page.title || site.name
  const rawDescription = page.seo?.description || page.description || ''
  const title = isTxChristmasLightsSite(site) ? truncateForShare(rawTitle, SHARE_TITLE_MAX) : rawTitle
  const description =
    isTxChristmasLightsSite(site) && rawDescription
      ? truncateForShare(rawDescription, SHARE_DESCRIPTION_MAX)
      : rawDescription

  url.searchParams.set('site', site.name)
  url.searchParams.set('title', title)

  if (description) {
    url.searchParams.set('description', description)
  }

  if (isTxChristmasLightsSite(site)) {
    applyChristmasBrandParams(url, origin)
  } else {
    applyStandardBrandParams(url, site)
  }

  if (pathname && pathname !== '/') {
    url.searchParams.set('path', pathname)
  }

  if (page?._updatedAt) {
    url.searchParams.set('v', String(new Date(page._updatedAt).getTime() || page._updatedAt))
  }

  if (!isTxChristmasLightsSite(site)) {
    applyHeroImageIfSlug(url, site, page)
  }

  return url.toString()
}

function resolveIndexableHost(normalizedHost, site) {
  return (
    normalizedHost === site.primaryDomain ||
    site.aliases?.includes(normalizedHost) ||
    normalizedHost === `www.${site.primaryDomain}`
  )
}

function buildNotFoundMetadata(site) {
  return { title: `${site.name} | Page not found`, robots: { index: false, follow: false } }
}

function computeIsGuidePage(page, pathname) {
  const byPath = pathname.startsWith('/guides')
  const byData = page?.pageType === 'post' && String(page?.slug || '').startsWith('guides/')
  return byPath || byData
}

function resolveShareStrings(site, title, description) {
  if (!isTxChristmasLightsSite(site)) {
    return { shareTitle: title, shareDescription: description || '' }
  }
  return {
    shareTitle: truncateForShare(title, SHARE_TITLE_MAX),
    shareDescription: description ? truncateForShare(description, SHARE_DESCRIPTION_MAX) : '',
  }
}

function resolveOgImageUrl(site, page, isGuidePage, computedOgImage) {
  if (isGuidePage) {
    return computedOgImage
  }
  return page.seo?.ogImage || site.seo?.ogImage || computedOgImage
}

function resolveFacebookAppId() {
  return (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || '').trim()
}

function resolveCurrentOriginValue(host, forwardedProto, canonical) {
  return getCurrentOrigin(host, forwardedProto) || getOriginFromAbsoluteUrl(canonical) || canonical
}

function resolveTitleSeo(page, site) {
  return page.seo?.title || page.title || site.seo?.title || site.name
}

function resolveDescriptionSeo(page, site) {
  return page.seo?.description || page.description || site.seo?.description
}

function resolveShouldIndex(isIndexableHost, page, site) {
  return isIndexableHost && page.seo?.noIndex !== true && site.seo?.noIndex !== true
}

function buildPageMetadataObject({
  title,
  description,
  site,
  shareTitle,
  shareDescription,
  ogImage,
  canonical,
  facebookAppId,
  page,
  shouldIndex,
}) {
  return {
    title,
    description: isTxChristmasLightsSite(site) ? shareDescription || description : description,
    alternates: { canonical },
    openGraph: {
      title: shareTitle,
      description: shareDescription || undefined,
      url: canonical,
      siteName: site.name,
      appId: facebookAppId || undefined,
      locale: 'en_US',
      type: page?.pageType === 'post' ? 'article' : 'website',
      images: [
        { url: ogImage, type: 'image/png', width: 1200, height: 630, alt: `${shareTitle} | ${site.name}` },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDescription || undefined,
      images: [ogImage],
    },
    robots: { index: shouldIndex, follow: shouldIndex },
  }
}

export async function buildMetadataForCurrentSite(slugParts = [], searchParams = {}) {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const site = await resolveCurrentSite(searchParams)

  if (!site) {
    return { title: 'Not found', robots: { index: false, follow: false } }
  }

  const page = await getPageForRequest(site, slugParts)
  const normalizedHost = (host || '').toLowerCase()

  if (!page) {
    return buildNotFoundMetadata(site)
  }

  const pathname = slugParts.length ? `/${slugParts.join('/')}` : '/'
  const isGuidePage = computeIsGuidePage(page, pathname)
  const fallbackCanonical = getPrimaryUrl(site, pathname)
  const canonical = resolveCanonicalUrl({ page, site, pathname, fallbackCanonical })
  const currentOrigin = resolveCurrentOriginValue(host, requestHeaders.get('x-forwarded-proto'), canonical)
  const title = resolveTitleSeo(page, site)
  const description = resolveDescriptionSeo(page, site)

  return buildPageMetadataObject({
    title,
    description,
    site,
    ...resolveShareStrings(site, title, description),
    ogImage: resolveOgImageUrl(site, page, isGuidePage, buildOgImageUrl(currentOrigin, site, page, pathname)),
    canonical,
    facebookAppId: resolveFacebookAppId(),
    page,
    shouldIndex: resolveShouldIndex(resolveIndexableHost(normalizedHost, site), page, site),
  })
}

function findResourcesSection(homepage) {
  return (
    homepage?.sections?.find((section) => section._type === 'resourceGridSection') ??
    homepage?.sections?.find((section) => section.type === 'resourceGrid') ??
    homepage?.sections?.find((section) => section.type === 'resources') ??
    null
  )
}

function resolveHeroSection(homepage, heroHomepage) {
  if (homepage) {
    return homepage.heroSection ?? homepage.sections?.find(isHeroSectionBlock) ?? null
  }
  return heroHomepage?.heroSection ?? null
}

async function renderSolarHomepage(site) {
  const homepage = await getHomepageForSite(site.slug)
  const heroHomepage = await getHeroHomepageForSite(site.slug)
  const heroSection = resolveHeroSection(homepage, heroHomepage)
  const resourcesSection = findResourcesSection(homepage)
  const reviews = await getHomepageReviewsForSite(site.slug)
  const jsonLd = createJsonLd(site, homepage || heroHomepage, '/')

  return (
    <App
      homepage={homepage}
      heroSection={heroSection}
      resourcesSection={resourcesSection}
      reviews={reviews}
      site={site}
      navigation={resolveNavigationForSite(site)}
      jsonLd={jsonLd}
      homepageSource={homepage?.source || heroHomepage?.source || 'fixture'}
    />
  )
}

function resolvePageReviews(site, page, slugParts) {
  const pathname = slugParts.length ? `/${slugParts.join('/')}` : '/'
  const hasTestimonialsSection = Array.isArray(page.sections)
    ? page.sections.some((section) => section.type === 'testimonials')
    : false
  const reviews = hasTestimonialsSection ? getHomepageReviewsForSite(site.slug) : []

  return { pathname, reviews }
}

async function renderGenericSitePage(site, slugParts) {
  const page = await getPageForRequest(site, slugParts)

  if (!page) {
    notFound()
  }

  const { pathname, reviews } = resolvePageReviews(site, page, slugParts)

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

export async function renderCurrentSitePage(slugParts = [], searchParams = {}) {
  const site = await resolveCurrentSite(searchParams)

  if (!site) {
    notFound()
  }

  if (isPrimarySiteSlug(site.slug) && slugParts.length === 0) {
    return renderSolarHomepage(site)
  }

  return renderGenericSitePage(site, slugParts)
}
