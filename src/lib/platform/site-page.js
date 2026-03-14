import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import App from '@/App'
import PublicSite from '@/components/platform/PublicSite'
import { getHeroImageUrl } from '@/lib/platform/imageSource'
import {
  createJsonLd,
  getHomepageForSite,
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

  const protocol = forwardedProto || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
  return `${protocol}://${host}`
}

function getOriginFromAbsoluteUrl(url) {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
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

  url.searchParams.set('site', site.name)
  url.searchParams.set('title', page.seo?.title || page.title || site.name)

  if (page.seo?.description || page.description) {
    url.searchParams.set('description', page.seo?.description || page.description)
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
  const fallbackCanonical = getPrimaryUrl(site, pathname)
  const canonical = page.seo?.canonicalUrl || site.seo?.canonicalUrl || fallbackCanonical
  const currentOrigin = getCurrentOrigin(host, forwardedProto) || getOriginFromAbsoluteUrl(canonical) || canonical
  const title = page.seo?.title || page.title || site.seo?.title || site.name
  const description = page.seo?.description || page.description || site.seo?.description
  const ogImage = page.seo?.ogImage || site.seo?.ogImage || buildOgImageUrl(currentOrigin, site, page, pathname)
  const shouldIndex = isIndexableHost && page.seo?.noIndex !== true && site.seo?.noIndex !== true

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
    const jsonLd = createJsonLd(site, homepage || heroHomepage, '/')

    return (
      <App
        heroSection={heroSection}
        resourcesSection={resourcesSection}
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

  return (
    <PublicSite
      site={site}
      page={page}
      pathname={pathname}
      navigation={getNavigationForSite(site.slug)}
      jsonLd={createJsonLd(site, page, pathname)}
    />
  )
}
