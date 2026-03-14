import { draftMode, headers } from 'next/headers'
import { groq, stegaClean } from 'next-sanity'

import { getSanityServerClient, sanityWriteClient } from '@/sanity/client'
import { pages, sites } from './fixtures'
import { defaultLaunchChecklist } from './launchChecklist'
import { hasImageSource } from './imageSource'
import { withSectionKeys } from '@/lib/sanity/keys'

const sectionProjection = `
  _type,
  _key,
  type,
  eyebrow,
  title,
  body,
  people[]{
    _key,
    label,
    name,
    role,
    blurb,
    certificationLabel,
    certificationTitle,
    profileImage,
    profileImageAsset{
      altText,
      alt,
      asset->{
        url,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    },
    badgeImage,
    badgeImageAsset{
      altText,
      alt,
      asset->{
        url,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    }
  },
  profileImage,
  profileImageAsset{
    altText,
    alt,
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  personLabel,
  personName,
  personRole,
  personBlurb,
  certificationLabel,
  certificationTitle,
  badgeImage,
  badgeImageAsset{
    altText,
    alt,
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  secondaryProfileImage,
  secondaryProfileImageAsset{
    altText,
    alt,
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  secondaryPersonLabel,
  secondaryPersonName,
  secondaryPersonRole,
  secondaryPersonBlurb,
  heroGradient,
  heroTextColor,
  heroOverlayColor,
  heroOverlayStartColor,
  heroOverlayEndColor,
  heroOverlayDirection,
  heroOverlayStartOpacity,
  heroOverlayEndOpacity,
  heroOverlayOpacity,
  heroImage,
  heroAsset{
    altText,
    alt,
    asset->{
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  metrics,
  actions[]{
    label,
    href,
    variant
  },
  items[]{
    _key,
    number,
    eyebrow,
    title,
    body,
    question,
    answer,
    href,
    icon,
    image,
    imageAsset{
      altText,
      alt,
      asset->{
        url,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    }
  },
  ctaLabel,
  ctaHref
`

function cleanRuntimeString(value) {
  return typeof value === 'string' ? stegaClean(value) : value
}

function sanitizeAction(action) {
  if (!action) {
    return action
  }

  return {
    ...action,
    href: cleanRuntimeString(action.href),
    variant: cleanRuntimeString(action.variant),
  }
}

function sanitizeItem(item) {
  if (!item) {
    return item
  }

  return {
    ...item,
    _key: cleanRuntimeString(item._key),
    href: cleanRuntimeString(item.href),
    icon: cleanRuntimeString(item.icon),
  }
}

function sanitizePerson(person) {
  if (!person) {
    return person
  }

  return {
    ...person,
    _key: cleanRuntimeString(person._key),
    label: cleanRuntimeString(person.label),
    name: cleanRuntimeString(person.name),
    role: cleanRuntimeString(person.role),
    blurb: cleanRuntimeString(person.blurb),
    certificationLabel: cleanRuntimeString(person.certificationLabel),
    certificationTitle: cleanRuntimeString(person.certificationTitle),
  }
}

function sanitizeSection(section) {
  if (!section) {
    return section
  }

  return {
    ...section,
    _type: cleanRuntimeString(section._type),
    _key: cleanRuntimeString(section._key),
    type: cleanRuntimeString(section.type),
    heroGradient: cleanRuntimeString(section.heroGradient),
    heroTextColor: cleanRuntimeString(section.heroTextColor),
    heroOverlayColor: cleanRuntimeString(section.heroOverlayColor),
    heroOverlayStartColor: cleanRuntimeString(section.heroOverlayStartColor),
    heroOverlayEndColor: cleanRuntimeString(section.heroOverlayEndColor),
    heroOverlayDirection: cleanRuntimeString(section.heroOverlayDirection),
    people: Array.isArray(section.people) ? section.people.map(sanitizePerson) : section.people,
    personLabel: cleanRuntimeString(section.personLabel),
    personName: cleanRuntimeString(section.personName),
    personRole: cleanRuntimeString(section.personRole),
    personBlurb: cleanRuntimeString(section.personBlurb),
    certificationLabel: cleanRuntimeString(section.certificationLabel),
    certificationTitle: cleanRuntimeString(section.certificationTitle),
    secondaryPersonLabel: cleanRuntimeString(section.secondaryPersonLabel),
    secondaryPersonName: cleanRuntimeString(section.secondaryPersonName),
    secondaryPersonRole: cleanRuntimeString(section.secondaryPersonRole),
    secondaryPersonBlurb: cleanRuntimeString(section.secondaryPersonBlurb),
    ctaLabel: cleanRuntimeString(section.ctaLabel),
    ctaHref: cleanRuntimeString(section.ctaHref),
    actions: Array.isArray(section.actions) ? section.actions.map(sanitizeAction) : section.actions,
    items: Array.isArray(section.items) ? section.items.map(sanitizeItem) : section.items,
  }
}

function sanitizePageRuntimeFields(page) {
  if (!page) {
    return page
  }

  return {
    ...page,
    id: cleanRuntimeString(page.id),
    slug: cleanRuntimeString(page.slug),
    pageType: cleanRuntimeString(page.pageType),
    templateLevel: cleanRuntimeString(page.templateLevel),
    heroGradient: cleanRuntimeString(page.heroGradient),
    heroTextColor: cleanRuntimeString(page.heroTextColor),
    heroOverlayColor: cleanRuntimeString(page.heroOverlayColor),
    heroOverlayStartColor: cleanRuntimeString(page.heroOverlayStartColor),
    heroOverlayEndColor: cleanRuntimeString(page.heroOverlayEndColor),
    heroOverlayDirection: cleanRuntimeString(page.heroOverlayDirection),
    sections: Array.isArray(page.sections) ? page.sections.map(sanitizeSection) : page.sections,
    heroActions: Array.isArray(page.heroActions) ? page.heroActions.map(sanitizeAction) : page.heroActions,
  }
}

async function getSanityReadContext({ stega = true } = {}) {
  const { isEnabled } = await draftMode()
  const client = getSanityServerClient({ preview: isEnabled, stega: isEnabled && stega })

  return {
    client,
    isDraft: isEnabled,
    fetchOptions: isEnabled ? { cache: 'no-store' } : { next: { revalidate: 60 } },
  }
}

function buildHomepageHeroSection(page) {
  if (!page) {
    return null
  }

  const sectionHero = page.sections?.find((section) => section.type === 'hero') ?? null
  const hasFlatHeroContent =
    page.heroEyebrow ||
    page.heroTitle ||
    page.heroBody ||
    hasImageSource(page.heroAsset, page.heroImage) ||
    (page.heroMetrics?.length ?? 0) > 0 ||
    (page.heroActions?.length ?? 0) > 0

  if (!hasFlatHeroContent) {
    return sectionHero
  }

  return {
    ...(sectionHero || {}),
    _type: 'heroSection',
    type: 'hero',
    eyebrow: page.heroEyebrow ?? sectionHero?.eyebrow ?? null,
    title: page.heroTitle ?? sectionHero?.title ?? page.title ?? null,
    body: page.heroBody ?? sectionHero?.body ?? page.description ?? null,
    heroGradient: page.heroGradient ?? sectionHero?.heroGradient ?? null,
    heroTextColor: page.heroTextColor ?? sectionHero?.heroTextColor ?? null,
    heroOverlayColor: page.heroOverlayColor ?? sectionHero?.heroOverlayColor ?? null,
    heroOverlayStartColor: page.heroOverlayStartColor ?? sectionHero?.heroOverlayStartColor ?? null,
    heroOverlayEndColor: page.heroOverlayEndColor ?? sectionHero?.heroOverlayEndColor ?? null,
    heroOverlayDirection: page.heroOverlayDirection ?? sectionHero?.heroOverlayDirection ?? null,
    heroOverlayStartOpacity: page.heroOverlayStartOpacity ?? sectionHero?.heroOverlayStartOpacity ?? null,
    heroOverlayEndOpacity: page.heroOverlayEndOpacity ?? sectionHero?.heroOverlayEndOpacity ?? null,
    heroOverlayOpacity: page.heroOverlayOpacity ?? sectionHero?.heroOverlayOpacity ?? null,
    heroAsset: page.heroAsset ?? sectionHero?.heroAsset ?? null,
    heroImage: page.heroImage ?? sectionHero?.heroImage ?? null,
    metrics: page.heroMetrics ?? sectionHero?.metrics ?? [],
    actions: page.heroActions ?? sectionHero?.actions ?? [],
  }
}

function withPageSource(page, source) {
  if (!page) {
    return null
  }

  return {
    ...page,
    source,
  }
}

function normalizeHost(host) {
  return (host || '')
    .replace(/^https?:\/\//, '')
    .replace(/:\d+$/, '')
    .toLowerCase()
}

const PRIMARY_SITE_SLUGS = ['texas-solar-and-roofing-pros', 'austin-solar-pros']

export function isPrimarySiteSlug(siteSlug) {
  return PRIMARY_SITE_SLUGS.includes(siteSlug)
}

function getEquivalentSiteSlugs(siteSlug) {
  return isPrimarySiteSlug(siteSlug) ? PRIMARY_SITE_SLUGS : [siteSlug]
}

export function getAllSites() {
  return sites
}

export function getAllRenderableSites() {
  return sites.filter((site) => site.tier !== 'redirect')
}

export function getHeroSites() {
  return sites.filter((site) => site.tier === 'hero')
}

export function getSiteById(siteId) {
  return sites.find((site) => site.id === siteId) ?? null
}

export function getSiteBySlug(siteSlug) {
  return sites.find((site) => getEquivalentSiteSlugs(siteSlug).includes(site.slug)) ?? null
}

export async function resolveSiteBySlug(siteSlug) {
  const localSite = getSiteBySlug(siteSlug)

  const { client, fetchOptions } = await getSanityReadContext({ stega: false })

  if (!client) {
    return localSite
  }

  try {
    const site = await client.fetch(
      groq`*[_type == "site" && slug.current == $siteSlug][0]{
        _id,
        "id": _id,
        "slug": slug.current,
        name,
        shortName,
        category,
        categoryLabel,
        tier,
        primaryDomain,
        aliases,
        redirectTarget,
        leadForm,
        seo,
        brand,
        organization
      }`,
      { siteSlug },
      fetchOptions,
    )

    return site ?? localSite ?? null
  } catch {
    return localSite ?? null
  }
}

export function getPageKey(slugParts = []) {
  if (!slugParts.length) {
    return ''
  }

  return slugParts.join('/')
}

export function getPagesForSite(siteSlug) {
  return pages.filter((page) => getEquivalentSiteSlugs(siteSlug).includes(page.siteSlug))
}

export function getPageForSite(siteSlug, slugParts = []) {
  return withPageSource(
    pages.find(
      (page) =>
        getEquivalentSiteSlugs(siteSlug).includes(page.siteSlug) && page.slug === getPageKey(slugParts),
    ) ?? null,
    'fixture',
  )
}

function toHeroPageRecord(page, site) {
  if (!page || !site || site.tier !== 'hero' || page.templateLevel !== 'hero') {
    return null
  }

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    pageType: page.pageType,
    templateLevel: page.templateLevel,
    site: {
      id: site.id,
      slug: site.slug,
      name: site.name,
      primaryDomain: site.primaryDomain,
      tier: site.tier,
    },
    heroSection: buildHomepageHeroSection(page),
  }
}

export function getNavigationForSite(siteSlug) {
  return getPagesForSite(siteSlug)
    .filter((page) => page.slug !== '' && page.pageType !== 'post' && !page.slug.includes('/'))
    .map((page) => ({
      label: page.title
        .replace(/^Texas Solar and Roofing /, '')
        .replace(/^Austin Solar /, '')
        .replace(/^Austin /, ''),
      href: page.slug.startsWith('blog/') ? `/${page.slug}` : `/${page.slug}`,
    }))
}

function getEquivalentSiteIds(site) {
  const equivalentSlugs = getEquivalentSiteSlugs(site.slug)

  return sites
    .filter((candidate) => equivalentSlugs.includes(candidate.slug))
    .map((candidate) => candidate.id)
}

export async function resolveSiteByHost(host) {
  const normalizedHost = normalizeHost(host)

  const localSite =
    sites.find(
      (site) =>
        site.primaryDomain === normalizedHost ||
        site.aliases?.includes(normalizedHost) ||
        (normalizedHost.endsWith('.vercel.app') && site.slug === 'texas-solar-and-roofing-pros'),
    ) ?? null

  const { client, fetchOptions } = await getSanityReadContext({ stega: false })

  if (!client) {
    return localSite ?? getSiteBySlug('texas-solar-and-roofing-pros')
  }

  try {
    const site = await client.fetch(
      groq`*[_type == "site" && ($host == primaryDomain || $host in aliases)][0]{
        _id,
        "id": _id,
        "slug": slug.current,
        name,
        shortName,
        category,
        categoryLabel,
        tier,
        primaryDomain,
        aliases,
        redirectTarget,
        leadForm,
        seo,
        brand,
        organization
      }`,
      { host: normalizedHost },
      fetchOptions,
    )

    return site ?? localSite ?? getSiteBySlug('texas-solar-and-roofing-pros')
  } catch {
    return localSite ?? getSiteBySlug('texas-solar-and-roofing-pros')
  }
}

export async function resolveCurrentSite() {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')

  return resolveSiteByHost(host)
}

export async function getPageForRequest(site, slugParts = []) {
  const localPage = getPageForSite(site.slug, slugParts)

  const { client, fetchOptions } = await getSanityReadContext()

  if (!client) {
    return localPage
  }

  try {
    const siteSlugs = getEquivalentSiteSlugs(site.slug)
    const rawPage = await client.fetch(
      groq`*[_type in ["page", "servicePage", "locationPage", "post"] && site->slug.current in $siteSlugs && slug.current == $slug][0]{
        _id,
        "id": _id,
        title,
        seo,
        description,
        pageType,
        templateLevel,
        "slug": slug.current,
        heroEyebrow,
        heroTitle,
        heroBody,
        heroGradient,
        heroTextColor,
        heroOverlayColor,
        heroOverlayStartColor,
        heroOverlayEndColor,
        heroOverlayDirection,
        heroOverlayStartOpacity,
        heroOverlayEndOpacity,
        heroOverlayOpacity,
        heroImage,
        heroAsset{
          altText,
          alt,
          asset->{
            url,
            metadata{
              dimensions{
                width,
                height
              }
            }
          }
        },
        heroMetrics,
        heroActions[]{
          label,
          href,
          variant
        },
        sections[]{
          ${sectionProjection}
        }
      }`,
      { siteSlugs, slug: getPageKey(slugParts) || '/' },
      fetchOptions,
    )

    if (rawPage) {
      const page = sanitizePageRuntimeFields(rawPage)

      return withPageSource(
        {
          ...page,
          slug: page.slug === '/' ? '' : page.slug,
          heroSection: buildHomepageHeroSection(page),
        },
        'sanity',
      )
    }
  } catch {}

  return localPage
}

export async function getSitemapEntriesForSite(site) {
  const localSiteIds = new Set(getEquivalentSiteIds(site))
  const localEntries = pages
    .filter((page) => localSiteIds.has(page.siteId) && page.slug !== '404')
    .map((page) => ({
      slug: page.slug,
      pageType: page.pageType,
      updatedAt: null,
    }))

  const { client } = await getSanityReadContext({ stega: false })

  if (!client) {
    return localEntries
  }

  try {
    const siteSlugs = getEquivalentSiteSlugs(site.slug)
    const entries = await client.fetch(
      groq`*[
        _type in ["page", "servicePage", "locationPage", "post"] &&
        site->slug.current in $siteSlugs &&
        slug.current != "404"
      ]{
        "slug": select(slug.current == "/" => "", slug.current),
        pageType,
        _updatedAt
      }`,
      { siteSlugs },
      { cache: 'no-store' },
    )

    if (Array.isArray(entries) && entries.length) {
      const deduped = new Map()

      for (const entry of entries) {
        if (!entry?.slug && entry?.slug !== '') {
          continue
        }

        deduped.set(entry.slug, {
          slug: entry.slug,
          pageType: entry.pageType,
          updatedAt: entry._updatedAt ?? null,
        })
      }

      for (const entry of localEntries) {
        if (!deduped.has(entry.slug)) {
          deduped.set(entry.slug, entry)
        }
      }

      return Array.from(deduped.values())
    }
  } catch {}

  return localEntries
}

export async function getHeroPages({ stega = false } = {}) {
  const localHeroPages = pages
    .map((page) => toHeroPageRecord(page, getSiteBySlug(page.siteSlug)))
    .filter(Boolean)

  const { client } = await getSanityReadContext({ stega })

  if (!client) {
    return localHeroPages
  }

  try {
    const heroPages = await client.fetch(
      groq`*[
        _type in ["page", "servicePage", "locationPage"] &&
        templateLevel == "hero" &&
        defined(site) &&
        site->tier == "hero"
      ] | order(site->name asc, title asc) {
        _id,
        "id": _id,
        title,
        pageType,
        templateLevel,
        "slug": select(slug.current == "/" => "", slug.current),
        heroEyebrow,
        heroTitle,
        heroBody,
        heroGradient,
        heroTextColor,
        heroOverlayColor,
        heroOverlayStartColor,
        heroOverlayEndColor,
        heroOverlayDirection,
        heroOverlayStartOpacity,
        heroOverlayEndOpacity,
        heroOverlayOpacity,
        heroImage,
        heroAsset{
          altText,
          alt,
          asset->{
            url,
            metadata{
              dimensions{
                width,
                height
              }
            }
          }
        },
        heroMetrics,
        heroActions[]{
          label,
          href,
          variant
        },
        site->{
          _id,
          "id": _id,
          "slug": slug.current,
          name,
          primaryDomain,
          tier
        },
        sections[]{
          ${sectionProjection}
        }
      }`,
      {},
      { cache: 'no-store' },
    )

    return Array.isArray(heroPages)
      ? heroPages.map((page) => ({
          ...sanitizePageRuntimeFields(page),
          source: 'sanity',
          heroSection: buildHomepageHeroSection(sanitizePageRuntimeFields(page)),
        }))
      : localHeroPages
  } catch {
    return localHeroPages
  }
}

export async function getPageBySlug(siteSlug, slug) {
  const site = getSiteBySlug(siteSlug)

  if (!site) {
    return null
  }

  return getPageForRequest(site, slug === '/' ? [] : slug.split('/').filter(Boolean))
}

export async function getLaunchChecklist() {
  const { client } = await getSanityReadContext({ stega: false })

  if (!client) {
    return defaultLaunchChecklist
  }

  try {
    const checklist = await client.fetch(
      groq`*[_type == "launchChecklist"] | order(_updatedAt desc)[0]{
        _id,
        title,
        summary,
        sections[]{
          _key,
          title,
          description,
          tasks[]{
            _key,
            title,
            notes,
            status,
            owner,
            priority
          }
        }
      }`,
      {},
      { cache: 'no-store' },
    )

    return checklist ?? defaultLaunchChecklist
  } catch {
    return defaultLaunchChecklist
  }
}

export async function getHeroHomepageForSite(siteSlug) {
  const heroPages = await getHeroPages({ stega: true })
  const equivalentSlugs = getEquivalentSiteSlugs(siteSlug)
  const sitePages = heroPages.filter((page) => equivalentSlugs.includes(page.site?.slug))

  const isHomepage = (page) => page.pageType === 'home' || page.slug === '' || page.slug === '/'
  const hasHeroImage = (page) => hasImageSource(page?.heroSection?.heroAsset, page?.heroSection?.heroImage)

  return (
    withPageSource(
      sitePages.find((page) => isHomepage(page) && hasHeroImage(page)),
      sitePages.find((page) => isHomepage(page) && hasHeroImage(page))?.source,
    ) ||
    withPageSource(
      sitePages.find((page) => hasHeroImage(page)),
      sitePages.find((page) => hasHeroImage(page))?.source,
    ) ||
    withPageSource(
      sitePages.find((page) => isHomepage(page)),
      sitePages.find((page) => isHomepage(page))?.source,
    ) ||
    withPageSource(sitePages[0], sitePages[0]?.source) ||
    null
  )
}

export async function getHomepageForSite(siteSlug) {
  const site = getSiteBySlug(siteSlug)

  if (!site) {
    return null
  }

  const homepage = await getPageForRequest(site, [])

  if (homepage) {
    return homepage
  }

  const equivalentSlugs = getEquivalentSiteSlugs(siteSlug)
  const fallbackPages = pages.filter((page) => equivalentSlugs.includes(page.siteSlug))

  return (
    withPageSource(
      fallbackPages.find((page) => page.pageType === 'home' || page.slug === '') || fallbackPages[0] || null,
      'fixture',
    ) || null
  )
}

export async function getHeroSitesForAdmin() {
  const localHeroSites = getHeroSites().map((site) => ({
    id: site.id,
    slug: site.slug,
    name: site.name,
    primaryDomain: site.primaryDomain,
    tier: site.tier,
    source: 'fixture',
  }))

  const { client } = await getSanityReadContext({ stega: false })

  if (!client) {
    return localHeroSites
  }

  try {
    const heroSites = await client.fetch(
      groq`*[_type == "site" && tier == "hero"] | order(name asc) {
        _id,
        "id": _id,
        "slug": slug.current,
        name,
        primaryDomain,
        tier
      }`,
      {},
      { cache: 'no-store' },
    )

    if (Array.isArray(heroSites) && heroSites.length) {
      return heroSites.map((site) => ({
        ...site,
        source: 'sanity',
      }))
    }
  } catch {}

  return localHeroSites
}

export function getPrimaryUrl(site, pathname = '/') {
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `https://${site.primaryDomain}${safePath}`
}

export function createJsonLd(site, page, pathname = '/') {
  const canonicalUrl = getPrimaryUrl(site, pathname)
  const organization = {
    '@context': 'https://schema.org',
    '@type': site.organization?.type || 'LocalBusiness',
    name: site.organization?.name || site.name,
    url: getPrimaryUrl(site, '/'),
    telephone: site.organization?.phone,
    email: site.organization?.email,
    areaServed: site.organization?.serviceArea,
  }
  const webPage = {
    '@context': 'https://schema.org',
    '@type': page?.pageType === 'post' ? 'Article' : 'WebPage',
    name: page?.title || site.name,
    description: page?.description || site.seo?.description,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: site.name,
      url: getPrimaryUrl(site, '/'),
    },
  }
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: pathname
      .split('/')
      .filter(Boolean)
      .reduce(
        (items, segment, index, all) => {
          const href = `/${all.slice(0, index + 1).join('/')}`
          items.push({
            '@type': 'ListItem',
            position: items.length + 1,
            name: segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
            item: getPrimaryUrl(site, href),
          })
          return items
        },
        [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: getPrimaryUrl(site, '/'),
          },
        ],
      ),
  }

  if (page?.pageType === 'post') {
    return [
      organization,
      {
        ...webPage,
        headline: page.title,
        about: site.categoryLabel,
        publisher: {
          '@type': 'Organization',
          name: site.name,
        },
        mainEntityOfPage: canonicalUrl,
      },
      breadcrumbs,
    ]
  }

  const faqSection = page?.sections?.find((section) => section.type === 'faq')

  if (faqSection) {
    return [
      organization,
      webPage,
      breadcrumbs,
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqSection.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ]
  }

  return [organization, webPage, breadcrumbs]
}

export async function publishPageToSanity(job) {
  if (!sanityWriteClient) {
    return {
      ok: false,
      mode: 'placeholder',
      message:
        'Sanity write credentials are not configured yet. The job was marked as published locally only.',
    }
  }

  const slug = job.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const document = {
    _type: job.contentType === 'post' ? 'post' : 'page',
    title: job.title,
    description: job.prompt,
    pageType: job.contentType,
    templateLevel: job.siteSlug === 'texas-solar-and-roofing-pros' ? 'hero' : 'landing',
    slug: {
      _type: 'slug',
      current: job.contentType === 'post' ? `blog/${slug}` : slug,
    },
    sections: withSectionKeys([
      {
        _type: 'heroSection',
        type: 'hero',
        eyebrow: 'Published from queue',
        title: job.title,
        body: job.output || job.prompt,
      },
    ]),
  }

  const result = await sanityWriteClient.create(document)

  return {
    ok: true,
    mode: 'sanity',
    message: 'Draft published to Sanity.',
    documentId: result._id,
  }
}
