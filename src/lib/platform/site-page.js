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
  getNavigationForSite,
  getPageForRequest,
  getPrimaryUrl,
  isPrimarySiteSlug,
  resolveSiteByHost,
} from '@/lib/platform/content'

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
  const sectionHero = page?.sections?.find((section) => section.type === 'hero') ?? null

  return (
    getHeroImageUrl(page?.heroAsset, page?.heroImage) ||
    getHeroImageUrl(sectionHero?.heroAsset, sectionHero?.heroImage) ||
    ''
  )
}

function buildOgImageUrl(origin, site, page, pathname) {
  const url = new URL('/api/og', origin)
  const ogTemplateVersion = 'guide-v6'
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
    const guideImageUrl = new URL(`/api/og/guides/${encodeURIComponent(guideSlug || '')}`, origin)
    if (page?._updatedAt) {
      guideImageUrl.searchParams.set('v', String(new Date(page._updatedAt).getTime() || page._updatedAt))
    }
    guideImageUrl.searchParams.set('ogv', ogTemplateVersion)
    return guideImageUrl.toString()
  }

  url.searchParams.set('site', site.name)
  url.searchParams.set('title', title)

  if (description) {
    url.searchParams.set('description', description)
  }

  if (site.brand?.primary) {
    url.searchParams.set('primary', site.brand.primary)
  }

  if (site.brand?.secondary) {
    url.searchParams.set('secondary', site.brand.secondary)
  }

  if (pathname && pathname !== '/') {
    url.searchParams.set('path', pathname)
  }

  if (page?._updatedAt) {
    url.searchParams.set('v', String(new Date(page._updatedAt).getTime() || page._updatedAt))
  }
  url.searchParams.set('ogv', ogTemplateVersion)

  const heroImage = getPageHeroImage(page)
  if (heroImage) {
    url.searchParams.set('image', heroImage)
  }

  return url.toString()
}

export async function buildMetadataForCurrentSite(slugParts = []) {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const forwardedProto = requestHeaders.get('x-forwarded-proto')
  const site = await resolveSiteByHost(host)
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
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || ''

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
    other: facebookAppId
      ? {
          'fb:app_id': facebookAppId,
        }
      : undefined,
  }
}

export async function renderCurrentSitePage(slugParts = []) {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const site = await resolveSiteByHost(host)

  if (isPrimarySiteSlug(site.slug) && slugParts.length === 0) {
    const homepage = await getHomepageForSite(site.slug)
    const heroHomepage = await getHeroHomepageForSite(site.slug)
    const heroSection =
      homepage?.heroSection ??
      heroHomepage?.heroSection ??
      homepage?.sections?.find((section) => section.type === 'hero') ??
      null
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
      navigation={getNavigationForSite(site.slug)}
      jsonLd={createJsonLd(site, page, pathname)}
      reviews={reviews}
    />
  )
}
