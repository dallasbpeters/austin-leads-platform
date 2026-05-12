import { draftMode, headers } from 'next/headers'
import { groq, stegaClean } from 'next-sanity'

import { getSanityServerClient, sanityWriteClient } from '@/sanity/client'
import { pages, sites } from './fixtures'
import { defaultLaunchChecklist } from './launchChecklist'
import { hasImageSource } from './imageSource'
import { withSectionKeys } from '@/lib/sanity/keys'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { isHeroSectionBlock } from '@/lib/platform/section-helpers'

const heroVideoProjection = `
  heroVideo{
    provider,
    externalId,
    url,
    urls{
      mp4,
      webm,
      hls,
      poster
    },
    posterImage{
      crop,
      hotspot,
      altText,
      alt,
      asset->{
        _id,
        url,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    },
    alt,
    description,
    duration,
    width,
    height,
    autoplay,
    loop,
    muted,
    controls,
    playsInline
  },
  heroVideoAsset{
    asset->{
      _id,
      url,
      mimeType,
      originalFilename,
      size
    }
  },`

const sectionProjection = `
  _type,
  _key,
  type,
  heroMediaMode,
  eyebrow,
  title,
  titlePrimary,
  titleAccent,
  cardCopy,
  subtitle,
  body,
  cardGradientStart,
  cardGradientEnd,
  leadingWords,
  accentWord,
  trailingText,
  chartPeriodLabel,
  chartPrimaryLabel,
  chartSecondaryLabel,
  chartUnitLabel,
  chartLineUnitLabel,
  chartYAxisMax,
  chartBarColor,
  chartLineColor,
  chartType,
  showGrid,
  showLegend,
  showAxisLines,
  chartAreaFillOpacity,
  chartAreaStacked,
  chartAreaSeries[]{
    _key,
    title,
    color
  },
  colors,
  tint,
  minHeight,
  maxHeight,
  rotate,
  scrollStart,
  scrollEnd,
  reverse,
  autoAnimate,
  speed,
  amplitude,
  text,
  texts,
  fontSize,
  textColor,
  showIcon,
  showFlag,
  icon,
  velocity,
  direction,
  startPosition,
  damping,
  stiffness,
  numCopies,
  roofingTitle,
  secondaryTitle,
  people[]{
    _key,
    label,
    name,
    role,
    blurb,
    cardGradientStart,
    cardGradientEnd,
    certificationLabel,
    certificationTitle,
    profileImage,
    profileImageAsset{
      crop,
      hotspot,
      altText,
      alt,
      asset->{
        _id,
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
      crop,
      hotspot,
      altText,
      alt,
      asset->{
        _id,
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
    crop,
    hotspot,
    altText,
    alt,
    asset->{
      _id,
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
    crop,
    hotspot,
    altText,
    alt,
    asset->{
      _id,
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
    crop,
    hotspot,
    altText,
    alt,
    asset->{
      _id,
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
    crop,
    hotspot,
    altText,
    alt,
    asset->{
      _id,
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  heroSlides[]{
    _key,
    title,
    image,
    imageAsset{
      crop,
      hotspot,
      altText,
      alt,
      asset->{
        _id,
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
  // pricingSection: array of pricingNoteItem (title, body, variant).
  notes[]{
    _key,
    title,
    body,
    variant
  },
  // gallerySection: array of galleryImage (image with altText + neighborhood/year/package metadata).
  images[]{
    _key,
    crop,
    hotspot,
    altText,
    alt,
    neighborhood,
    year,
    package,
    asset->{
      _id,
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  heroVideo{
    provider,
    externalId,
    url,
    urls{
      mp4,
      webm,
      hls,
      poster
    },
    posterImage{
      crop,
      hotspot,
      altText,
      alt,
      asset->{
        _id,
        url,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    },
    alt,
    description,
    duration,
    width,
    height,
    autoplay,
    loop,
    muted,
    controls,
    playsInline
  },
  heroVideoAsset{
    asset->{
      _id,
      url,
      mimeType,
      originalFilename,
      size
    }
  },
  image,
  imageAsset{
    crop,
    hotspot,
    altText,
    alt,
    asset->{
      _id,
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
  reviews[]->{
    _id,
    "id": _id,
    author,
    body,
    reviewerLocation,
    "stars": coalesce(stars, rating, 5),
    reviewerPhoto{
      crop,
      hotspot,
      alt,
      asset->{
        _id,
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
  items[]{
    _key,
    number,
    eyebrow,
    title,
    alt,
    body,
    question,
    answer,
    href,
    icon,
    color,
    cardColor,
    price,
    image,
    imageAsset{
      crop,
      hotspot,
      altText,
      alt,
      asset->{
        _id,
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
  chartPoints[]{
    _key,
    label,
    barValue,
    lineValue,
    areaValues
  },
  roofingItems[]{
    _key,
    number,
    eyebrow,
    title,
    body,
    question,
    answer,
    href,
    icon,
    color,
    cardColor,
    price,
    image,
    imageAsset{
      crop,
      hotspot,
      altText,
      alt,
      asset->{
        _id,
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
  secondaryItems[]{
    _key,
    number,
    eyebrow,
    title,
    body,
    question,
    answer,
    href,
    icon,
    color,
    cardColor,
    price,
    image,
    imageAsset{
      crop,
      hotspot,
      altText,
      alt,
      asset->{
        _id,
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
  color,
  theme,
  ctaHref,
  avatarEyebrow,
  avatarName,
  avatarRole,
  avatarBlurb,
  avatarColor,
  avatarImage,
  avatarImageAsset{
    crop,
    hotspot,
    altText,
    alt,
    asset->{
      _id,
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
  profileImage,
  profileImageAsset{
    crop,
    hotspot,
    altText,
    alt,
    asset->{
      _id,
      url,
      metadata{
        dimensions{
          width,
          height
        }
      }
    }
  },
  // serviceAreaMapSection fields
  description,
  accentColor,
  backgroundColor,
  areas[]{
    _key,
    _type,
    countyKey,
    displayName
  }
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
    label: person.label,
    name: person.name,
    role: person.role,
    blurb: person.blurb,
    cardGradientStart: cleanRuntimeString(person.cardGradientStart),
    cardGradientEnd: cleanRuntimeString(person.cardGradientEnd),
    certificationLabel: person.certificationLabel,
    certificationTitle: person.certificationTitle,
  }
}

function resolveSanityColorValue(value) {
  if (!value) {
    return value
  }

  if (value?.color) {
    return resolveSanityColorValue(value.color)
  }

  if (typeof value === 'string') {
    return cleanRuntimeString(value)
  }

  if (typeof value?.hex === 'string' && value.hex.trim()) {
    return cleanRuntimeString(value.hex)
  }

  const rgb = value?.rgb

  if (rgb && Number.isFinite(rgb.r) && Number.isFinite(rgb.g) && Number.isFinite(rgb.b)) {
    const alpha = Number.isFinite(rgb.a) ? rgb.a : 1
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
  }

  return value
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
    heroMediaMode: cleanRuntimeString(section.heroMediaMode),
    subtitle: section.subtitle,
    cardCopy: section.cardCopy,
    leadingWords: Array.isArray(section.leadingWords)
      ? section.leadingWords.filter(Boolean)
      : section.leadingWords,
    accentWord: section.accentWord,
    trailingText: section.trailingText,
    chartPeriodLabel: cleanRuntimeString(section.chartPeriodLabel),
    chartPrimaryLabel: cleanRuntimeString(section.chartPrimaryLabel),
    chartSecondaryLabel: cleanRuntimeString(section.chartSecondaryLabel),
    chartUnitLabel: cleanRuntimeString(section.chartUnitLabel),
    chartLineUnitLabel: cleanRuntimeString(section.chartLineUnitLabel),
    chartYAxisMax:
      typeof section.chartYAxisMax === 'number'
        ? section.chartYAxisMax
        : section.chartYAxisMax
          ? Number(section.chartYAxisMax)
          : section.chartYAxisMax,
    chartBarColor: resolveSanityColorValue(section.chartBarColor),
    chartLineColor: resolveSanityColorValue(section.chartLineColor),
    chartType: cleanRuntimeString(section.chartType),
    showGrid: section.showGrid !== false,
    showLegend: section.showLegend !== false,
    showAxisLines: section.showAxisLines !== false,
    chartAreaFillOpacity:
      typeof section.chartAreaFillOpacity === 'number'
        ? section.chartAreaFillOpacity
        : section.chartAreaFillOpacity
          ? Number(section.chartAreaFillOpacity)
          : section.chartAreaFillOpacity,
    colors: Array.isArray(section.colors)
      ? section.colors.map(resolveSanityColorValue).filter(Boolean)
      : section.colors,
    tint: resolveSanityColorValue(section.tint),
    titlePrimary: section.titlePrimary,
    titleAccent: section.titleAccent,
    roofingTitle: section.roofingTitle,
    secondaryTitle: section.secondaryTitle,
    heroGradient: cleanRuntimeString(section.heroGradient),
    heroTextColor: resolveSanityColorValue(section.heroTextColor),
    heroOverlayColor: resolveSanityColorValue(section.heroOverlayColor),
    heroOverlayStartColor: resolveSanityColorValue(section.heroOverlayStartColor),
    heroOverlayEndColor: resolveSanityColorValue(section.heroOverlayEndColor),
    heroOverlayDirection: cleanRuntimeString(section.heroOverlayDirection),
    minHeight:
      typeof section.minHeight === 'number'
        ? section.minHeight
        : section.minHeight
          ? Number(section.minHeight)
          : section.minHeight,
    maxHeight:
      typeof section.maxHeight === 'number'
        ? section.maxHeight
        : section.maxHeight
          ? Number(section.maxHeight)
          : section.maxHeight,
    rotate: Boolean(section.rotate),
    scrollStart:
      typeof section.scrollStart === 'number'
        ? section.scrollStart
        : section.scrollStart
          ? Number(section.scrollStart)
          : section.scrollStart,
    scrollEnd:
      typeof section.scrollEnd === 'number'
        ? section.scrollEnd
        : section.scrollEnd
          ? Number(section.scrollEnd)
          : section.scrollEnd,
    reverse: Boolean(section.reverse),
    autoAnimate: Boolean(section.autoAnimate),
    speed:
      typeof section.speed === 'number'
        ? section.speed
        : section.speed
          ? Number(section.speed)
          : section.speed,
    amplitude:
      typeof section.amplitude === 'number'
        ? section.amplitude
        : section.amplitude
          ? Number(section.amplitude)
          : section.amplitude,
    text: Array.isArray(section.text) ? section.text.map(cleanRuntimeString).filter(Boolean) : section.text,
    texts: Array.isArray(section.texts)
      ? section.texts.map(cleanRuntimeString).filter(Boolean)
      : section.texts,
    fontSize:
      typeof section.fontSize === 'number'
        ? section.fontSize
        : section.fontSize
          ? Number(section.fontSize)
          : section.fontSize,
    textColor: resolveSanityColorValue(section.textColor),
    showIcon: Boolean(section.showIcon),
    showFlag: Boolean(section.showFlag),
    icon: cleanRuntimeString(section.icon),
    velocity:
      typeof section.velocity === 'number'
        ? section.velocity
        : section.velocity
          ? Number(section.velocity)
          : section.velocity,
    direction: cleanRuntimeString(section.direction),
    startPosition:
      typeof section.startPosition === 'number'
        ? section.startPosition
        : section.startPosition
          ? Number(section.startPosition)
          : section.startPosition,
    damping:
      typeof section.damping === 'number'
        ? section.damping
        : section.damping
          ? Number(section.damping)
          : section.damping,
    stiffness:
      typeof section.stiffness === 'number'
        ? section.stiffness
        : section.stiffness
          ? Number(section.stiffness)
          : section.stiffness,
    numCopies:
      typeof section.numCopies === 'number'
        ? section.numCopies
        : section.numCopies
          ? Number(section.numCopies)
          : section.numCopies,
    people: Array.isArray(section.people) ? section.people.map(sanitizePerson) : section.people,
    personLabel: section.personLabel,
    personName: section.personName,
    personRole: section.personRole,
    personBlurb: section.personBlurb,
    certificationLabel: section.certificationLabel,
    certificationTitle: section.certificationTitle,
    secondaryPersonLabel: section.secondaryPersonLabel,
    secondaryPersonName: section.secondaryPersonName,
    secondaryPersonRole: section.secondaryPersonRole,
    secondaryPersonBlurb: section.secondaryPersonBlurb,
    ctaLabel: section.ctaLabel,
    color: resolveSanityColorValue(section.color),
    accentColor: resolveSanityColorValue(section.accentColor),
    backgroundColor: resolveSanityColorValue(section.backgroundColor),
    theme: cleanRuntimeString(section.theme),
    ctaHref: cleanRuntimeString(section.ctaHref),
    avatarEyebrow: section.avatarEyebrow,
    avatarName: section.avatarName,
    avatarRole: section.avatarRole,
    avatarBlurb: section.avatarBlurb,
    avatarColor: resolveSanityColorValue(section.avatarColor),
    actions: Array.isArray(section.actions) ? section.actions.map(sanitizeAction) : section.actions,
    reviews: Array.isArray(section.reviews) ? section.reviews.map(sanitizeReview) : section.reviews,
    heroSlides: Array.isArray(section.heroSlides) ? section.heroSlides.map(sanitizeItem) : section.heroSlides,
    items: Array.isArray(section.items) ? section.items.map(sanitizeItem) : section.items,
    chartPoints: Array.isArray(section.chartPoints)
      ? section.chartPoints.map((point) => ({
          ...point,
          _key: cleanRuntimeString(point?._key),
          label: cleanRuntimeString(point?.label),
          barValue: typeof point?.barValue === 'number' ? point.barValue : Number(point?.barValue || 0),
          lineValue: typeof point?.lineValue === 'number' ? point.lineValue : Number(point?.lineValue || 0),
        }))
      : section.chartPoints,
    roofingItems: Array.isArray(section.roofingItems)
      ? section.roofingItems.map(sanitizeItem)
      : section.roofingItems,
    secondaryItems: Array.isArray(section.secondaryItems)
      ? section.secondaryItems.map(sanitizeItem)
      : section.secondaryItems,
    description:
      typeof section.description === 'string' ? cleanRuntimeString(section.description) : section.description,
    areas: Array.isArray(section.areas)
      ? section.areas.map((area) => ({
          ...area,
          _key: cleanRuntimeString(area?._key),
          countyKey: cleanRuntimeString(area?.countyKey),
          displayName: cleanRuntimeString(area?.displayName),
        }))
      : section.areas,
  }
}

function sanitizePageRuntimeFields(page) {
  if (!page) {
    return page
  }

  return {
    ...page,
    _type: cleanRuntimeString(page._type),
    id: cleanRuntimeString(page.id),
    slug: cleanRuntimeString(page.slug),
    pageType: cleanRuntimeString(page.pageType),
    templateLevel: cleanRuntimeString(page.templateLevel),
    heroMediaMode: cleanRuntimeString(page.heroMediaMode),
    heroGradient: cleanRuntimeString(page.heroGradient),
    heroTextColor: resolveSanityColorValue(page.heroTextColor),
    heroOverlayColor: resolveSanityColorValue(page.heroOverlayColor),
    heroOverlayStartColor: resolveSanityColorValue(page.heroOverlayStartColor),
    heroOverlayEndColor: resolveSanityColorValue(page.heroOverlayEndColor),
    heroOverlayDirection: cleanRuntimeString(page.heroOverlayDirection),
    heroTitlePrimary: page.heroTitlePrimary,
    heroTitleAccent: page.heroTitleAccent,
    cardCopy: page.cardCopy,
    guideCardColor: resolveSanityColorValue(page.guideCardColor),
    heroSlides: Array.isArray(page.heroSlides) ? page.heroSlides.map(sanitizeItem) : page.heroSlides,
    sections: Array.isArray(page.sections) ? page.sections.map(sanitizeSection) : page.sections,
    heroActions: Array.isArray(page.heroActions) ? page.heroActions.map(sanitizeAction) : page.heroActions,
  }
}

function normalizeGuideGridHrefPath(href) {
  const rawHref = cleanRuntimeString(href)
  if (!rawHref) return ''

  try {
    const parsed = new URL(rawHref, 'https://guide-color.local')
    const normalizedPath = cleanRuntimeString(parsed.pathname).replace(/\/+$/, '')
    return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  } catch {
    const normalizedPath = rawHref.replace(/[?#].*$/, '').replace(/\/+$/, '')
    return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  }
}

function guideGridItemMatchesTargetPath(itemHref, targetPath) {
  const itemPath = normalizeGuideGridHrefPath(itemHref)
  const wants = String(targetPath || '').replace(/\/+$/, '')
  if (!itemPath || !wants) return false
  if (itemPath === wants) return true

  const wantsParts = wants.split('/').filter(Boolean)
  const itemParts = itemPath.split('/').filter(Boolean)
  const wantsLeaf = wantsParts.at(-1) || ''
  const itemLeaf = itemParts.at(-1) || ''

  if (
    wantsParts[0] === 'guides' &&
    itemParts[0] === 'guides' &&
    wantsLeaf &&
    itemLeaf &&
    wantsLeaf.toLowerCase() === itemLeaf.toLowerCase()
  ) {
    return true
  }

  return false
}

/**
 * Pick guide card color/category from any Guide Grid section on any page for this site.
 * @param {string} targetPath pathname like `/guides/solar-warranties-texas`
 */
async function getGuideCardMetaForTargetPath({ client, fetchOptions, siteSlug, targetPath }) {
  const normalizedTarget = String(targetPath || '').replace(/\/+$/, '')
  const parts = normalizedTarget.split('/').filter(Boolean)

  if (!normalizedTarget || parts[0] !== 'guides' || !parts[1]) {
    return { color: '', category: '', updatedAt: '' }
  }

  try {
    const siteSlugs = getEquivalentSiteSlugs(siteSlug)
    const guideGridSources = await client.fetch(
      groq`*[
        _type in ["page", "servicePage", "locationPage", "post"] &&
        site->slug.current in $siteSlugs &&
        count(sections[_type == "guideGridSection" || type == "guideGrid"]) > 0
      ]{
        _updatedAt,
        "guideGridSections": sections[_type == "guideGridSection" || type == "guideGrid"]{
          "cardItems": items[]{href, color, category}
        }
      }`,
      { siteSlugs },
      fetchOptions,
    )

    const allItems = Array.isArray(guideGridSources)
      ? guideGridSources.flatMap((doc) =>
          (Array.isArray(doc?.guideGridSections) ? doc.guideGridSections : []).flatMap((section) =>
            (Array.isArray(section?.cardItems) ? section.cardItems : []).map((item) => ({
              ...item,
              __sourceUpdatedAt: cleanRuntimeString(doc?._updatedAt),
            })),
          ),
        )
      : []

    const matchedItem = allItems.find((item) => guideGridItemMatchesTargetPath(item?.href, normalizedTarget))

    return {
      color: resolveSanityColorValue(matchedItem?.color),
      category: cleanRuntimeString(matchedItem?.category),
      updatedAt: cleanRuntimeString(matchedItem?.__sourceUpdatedAt),
    }
  } catch {
    return { color: '', category: '', updatedAt: '' }
  }
}

function sanitizeReview(review) {
  if (!review) {
    return review
  }

  return {
    ...review,
    id: cleanRuntimeString(review.id),
    author: review.author,
    reviewerLocation: review.reviewerLocation,
    body: review.body,
    stars: typeof review.stars === 'number' ? review.stars : review.stars ? Number(review.stars) : null,
    reviewerPhoto: review.reviewerPhoto
      ? {
          ...review.reviewerPhoto,
          alt: cleanRuntimeString(review.reviewerPhoto.alt),
        }
      : null,
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

  const sectionHero = page.sections?.find(isHeroSectionBlock) ?? null

  if (sectionHero) {
    return sectionHero
  }

  const hasFlatHeroContent =
    page.heroEyebrow ||
    page.heroTitle ||
    page.heroTitlePrimary ||
    page.heroTitleAccent ||
    page.heroBody ||
    page.cardCopy ||
    hasImageSource(page.heroAsset, page.heroImage) ||
    (page.heroSlides?.length ?? 0) > 0 ||
    (page.heroMetrics?.length ?? 0) > 0 ||
    (page.heroActions?.length ?? 0) > 0

  if (!hasFlatHeroContent) {
    return null
  }

  return {
    _type: 'heroSection',
    type: 'hero',
    heroMediaMode: cleanRuntimeString(page.heroMediaMode),
    eyebrow: page.heroEyebrow || null,
    title: page.heroTitle || page.title || null,
    titlePrimary: page.heroTitlePrimary || null,
    titleAccent: page.heroTitleAccent || null,
    cardCopy: page.cardCopy || null,
    body: page.heroBody || page.description || null,
    heroGradient: page.heroGradient ?? null,
    heroTextColor: page.heroTextColor ?? null,
    heroOverlayColor: page.heroOverlayColor ?? null,
    heroOverlayStartColor: page.heroOverlayStartColor ?? null,
    heroOverlayEndColor: page.heroOverlayEndColor ?? null,
    heroOverlayDirection: page.heroOverlayDirection ?? null,
    heroOverlayStartOpacity: page.heroOverlayStartOpacity ?? null,
    heroOverlayEndOpacity: page.heroOverlayEndOpacity ?? null,
    heroOverlayOpacity: page.heroOverlayOpacity ?? null,
    heroAsset: page.heroAsset ?? null,
    heroImage: page.heroImage ?? null,
    heroVideo: page.heroVideo ?? null,
    heroVideoAsset: page.heroVideoAsset ?? null,
    heroSlides: Array.isArray(page.heroSlides) ? page.heroSlides : [],
    metrics: Array.isArray(page.heroMetrics) ? page.heroMetrics : [],
    actions: Array.isArray(page.heroActions) ? page.heroActions : [],
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

async function syncGuideGridSectionItems({ client, fetchOptions, page, siteSlug }) {
  const buildPortableTextSimple = (value) => {
    const text = cleanRuntimeString(value)
    if (!text) return []

    const blockKey = `pt-${Math.random().toString(36).slice(2, 10)}`
    const spanKey = `sp-${Math.random().toString(36).slice(2, 10)}`

    return [
      {
        _type: 'block',
        _key: blockKey,
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: spanKey,
            text,
            marks: [],
          },
        ],
      },
    ]
  }

  if (!page?.sections?.some((section) => section.type === 'guideGrid')) {
    return page
  }

  const isGuidesPrefixedHref = (href) => {
    const cleanHref = cleanRuntimeString(href)
    if (!cleanHref?.startsWith('/guides/')) {
      return false
    }

    const slug = cleanHref.replace(/^\/+/, '')
    const parts = slug.split('/').filter(Boolean)
    if (parts.length !== 2 || parts[0] !== 'guides') {
      return false
    }

    const leaf = parts[1].trim().toLowerCase()
    if (!leaf || leaf === 'page' || leaf === 'index' || leaf === 'guides') {
      return false
    }

    return true
  }

  const isDisplayableGuideCardHref = (href) => {
    const cleanHref = cleanRuntimeString(href)
    if (!cleanHref?.startsWith('/')) {
      return false
    }

    const slug = cleanHref.replace(/^\/+/, '')
    if (
      !slug ||
      slug === 'guides' ||
      slug === 'guides/' ||
      slug === 'guides/page' ||
      slug === 'guides/index'
    ) {
      return false
    }

    return true
  }

  const equivalentSiteSlugs = getEquivalentSiteSlugs(siteSlug)
  const localGuidePages = pages.filter(
    (candidate) =>
      equivalentSiteSlugs.includes(candidate.siteSlug) &&
      (candidate.pageType === 'post' || candidate.slug?.startsWith('guides/')) &&
      candidate.slug?.startsWith('guides/'),
  )
  const localGuideMap = new Map(
    localGuidePages.map((guidePage) => {
      const heroSection = guidePage.sections?.find(isHeroSectionBlock) || null

      return [
        `/${guidePage.slug}`,
        {
          title: guidePage.title,
          heroImage: heroSection?.heroImage ?? null,
          heroAsset: heroSection?.heroAsset ?? null,
          guidePublishedAt:
            guidePage.createdAt ||
            guidePage._createdAt ||
            guidePage.updatedAt ||
            guidePage._updatedAt ||
            null,
        },
      ]
    }),
  )

  const guideSlugs = Array.from(
    new Set(
      page.sections
        .filter((section) => section.type === 'guideGrid')
        .flatMap((section) => section.items || [])
        .map((item) => cleanRuntimeString(item?.href))
        .filter((href) => isGuidesPrefixedHref(href))
        .map((href) => href.replace(/^\//, '')),
    ),
  )

  let sanityGuideMap = new Map()
  let allSanityGuides = []

  if (client && guideSlugs.length) {
    try {
      const sanityGuides = await client.fetch(
        groq`*[
          _type in ["post", "page"] &&
          site->slug.current in $siteSlugs &&
          slug.current in $slugs &&
          (coalesce(pageType, "") == "post" || slug.current match "guides/*")
        ]{
          title,
          "slug": slug.current,
          _createdAt,
          sections[]{
            type,
            heroImage,
            heroAsset{
              crop,
              hotspot,
              altText,
              alt,
              asset->{
                _id,
                url,
                metadata{
                  dimensions{
                    width,
                    height
                  }
                }
              }
            }
          }
        }`,
        { siteSlugs: equivalentSiteSlugs, slugs: guideSlugs },
        fetchOptions,
      )

      sanityGuideMap = new Map(
        (sanityGuides || []).map((guidePage) => {
          const heroSection = guidePage.sections?.find(isHeroSectionBlock) || null

          return [
            `/${guidePage.slug}`,
            {
              title: guidePage.title,
              heroImage: heroSection?.heroImage ?? null,
              heroAsset: heroSection?.heroAsset ?? null,
              guidePublishedAt: guidePage._createdAt || null,
            },
          ]
        }),
      )
    } catch {} // eslint-disable-line no-empty
  }

  if (client) {
    try {
      allSanityGuides = await client.fetch(
        groq`*[
          _type in ["post", "page"] &&
          site->slug.current in $siteSlugs &&
          defined(slug.current) &&
          (coalesce(pageType, "") == "post" || _type == "post")
        ] | order(_createdAt desc){
          title,
          description,
          "slug": slug.current,
          _createdAt,
          sections[]{
            type,
            heroImage,
            heroAsset{
              crop,
              hotspot,
              altText,
              alt,
              asset->{
                _id,
                url,
                metadata{
                  dimensions{
                    width,
                    height
                  }
                }
              }
            }
          }
        }`,
        { siteSlugs: equivalentSiteSlugs },
        fetchOptions,
      )
    } catch {} // eslint-disable-line no-empty
  }

  const allGuideCandidates = [
    ...Array.from(sanityGuideMap.entries()).map(([href, value]) => ({ href, ...value })),
    ...Array.from(localGuideMap.entries()).map(([href, value]) => ({ href, ...value })),
    ...(allSanityGuides || []).map((guidePage) => {
      const heroSection = guidePage.sections?.find(isHeroSectionBlock) || null
      const normalizedSlug = cleanRuntimeString(guidePage.slug)?.replace(/^\/+/, '')
      return {
        href: normalizedSlug ? `/${normalizedSlug}` : '',
        title: guidePage.title,
        copy: guidePage.description || '',
        heroImage: heroSection?.heroImage ?? null,
        heroAsset: heroSection?.heroAsset ?? null,
        guidePublishedAt: guidePage._createdAt || null,
      }
    }),
  ].filter((candidate) => isDisplayableGuideCardHref(candidate?.href))

  return {
    ...page,
    sections: page.sections.map((section) => {
      if (section.type !== 'guideGrid') {
        return section
      }

      return {
        ...section,
        items: (() => {
          const existingItems = (section.items || []).map((item) => ({
            ...item,
            href: cleanRuntimeString(item?.href),
          }))
          const validExistingItems = existingItems.filter((item) => isDisplayableGuideCardHref(item?.href))
          const existingHrefSet = new Set(validExistingItems.map((item) => item.href).filter(Boolean))
          const autoAttachedItems = allGuideCandidates
            .filter((candidate) => candidate?.href && !existingHrefSet.has(candidate.href))
            .map((candidate) => ({
              title: candidate.title || '',
              body: buildPortableTextSimple(candidate.copy),
              href: candidate.href,
              image: candidate.heroImage ?? null,
              imageAsset: candidate.heroAsset ?? null,
              guidePublishedAt: candidate.guidePublishedAt || null,
            }))

          return [...validExistingItems, ...autoAttachedItems]
            .map((item, index) => {
              const href = cleanRuntimeString(item?.href)
              const guidePage =
                allGuideCandidates.find((candidate) => candidate.href === href) ||
                sanityGuideMap.get(href) ||
                localGuideMap.get(href)

              if (!guidePage) {
                return { ...item, _originalIndex: index }
              }

              return {
                ...item,
                _originalIndex: index,
                title: guidePage.title || item.title,
                image: guidePage.heroImage ?? null,
                imageAsset: guidePage.heroAsset ?? null,
                guidePublishedAt:
                  guidePage.guidePublishedAt || item.guidePublishedAt || item.guideUpdatedAt || null,
              }
            })
            .sort((left, right) => {
              const leftRaw = left?.guidePublishedAt || left?.guideUpdatedAt || ''
              const rightRaw = right?.guidePublishedAt || right?.guideUpdatedAt || ''
              const leftTime = Date.parse(leftRaw)
              const rightTime = Date.parse(rightRaw)
              const hasLeftTime = Number.isFinite(leftTime)
              const hasRightTime = Number.isFinite(rightTime)

              if (hasLeftTime && hasRightTime && leftTime !== rightTime) {
                return rightTime - leftTime
              }

              if (hasRightTime && !hasLeftTime) {
                return 1
              }

              if (hasLeftTime && !hasRightTime) {
                return -1
              }

              return (left?._originalIndex ?? 0) - (right?._originalIndex ?? 0)
            })
            .map(({ _originalIndex, guidePublishedAt: _sortPub, guideUpdatedAt: _sortUpd, ...item }) => item)
        })(),
      }
    }),
  }
}

function slugFromHref(href) {
  const value = cleanRuntimeString(href)

  if (!value) {
    return ''
  }

  return value.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '')
}

async function syncServiceGridSectionItems({ client, fetchOptions, page, siteSlug }) {
  if (!page?.sections?.some((section) => section.type === 'serviceGrid')) {
    return page
  }

  const equivalentSiteSlugs = getEquivalentSiteSlugs(siteSlug)
  const localServicePages = pages.filter(
    (candidate) =>
      equivalentSiteSlugs.includes(candidate.siteSlug) &&
      ['page', 'servicePage', 'locationPage'].includes(candidate.pageType) &&
      candidate.slug &&
      candidate.slug !== '/',
  )

  const localServiceMap = new Map(
    localServicePages.map((servicePage) => {
      const heroSection = servicePage.sections?.find(isHeroSectionBlock) || null

      return [
        servicePage.slug,
        {
          heroImage: heroSection?.heroImage ?? null,
          heroAsset: heroSection?.heroAsset ?? null,
        },
      ]
    }),
  )

  const serviceSlugs = Array.from(
    new Set(
      page.sections
        .filter((section) => section.type === 'serviceGrid')
        .flatMap((section) => [
          ...(section.items || []),
          ...(section.roofingItems || []),
          ...(section.secondaryItems || []),
        ])
        .map((item) => slugFromHref(item?.href))
        .filter(Boolean),
    ),
  )

  let sanityServiceMap = new Map()

  if (client && serviceSlugs.length) {
    try {
      const sanityServicePages = await client.fetch(
        groq`*[
          _type in ["page", "servicePage", "locationPage"] &&
          site->slug.current in $siteSlugs &&
          slug.current in $slugs
        ]{
          "slug": slug.current,
          sections[]{
            type,
            heroImage,
            heroAsset{
              crop,
              hotspot,
              altText,
              alt,
              asset->{
                _id,
                url,
                metadata{
                  dimensions{
                    width,
                    height
                  }
                }
              }
            }
          }
        }`,
        { siteSlugs: equivalentSiteSlugs, slugs: serviceSlugs },
        fetchOptions,
      )

      sanityServiceMap = new Map(
        (sanityServicePages || []).map((servicePage) => {
          const heroSection = servicePage.sections?.find(isHeroSectionBlock) || null

          return [
            servicePage.slug,
            {
              heroImage: heroSection?.heroImage ?? null,
              heroAsset: heroSection?.heroAsset ?? null,
            },
          ]
        }),
      )
    } catch {} // eslint-disable-line no-empty
  }

  const syncItemWithHeroMedia = (item) => {
    const slug = slugFromHref(item?.href)
    const servicePage = sanityServiceMap.get(slug) || localServiceMap.get(slug)

    if (!servicePage) {
      return item
    }

    const nextImage = servicePage.heroImage ?? item.image ?? null
    const nextAsset = servicePage.heroAsset ?? item.imageAsset ?? null

    if (!nextImage && !nextAsset) {
      return item
    }

    return {
      ...item,
      image: nextImage,
      imageAsset: nextAsset,
    }
  }

  return {
    ...page,
    sections: page.sections.map((section) => {
      if (section.type !== 'serviceGrid') {
        return section
      }

      return {
        ...section,
        items: (section.items || []).map(syncItemWithHeroMedia),
        roofingItems: (section.roofingItems || []).map(syncItemWithHeroMedia),
        secondaryItems: (section.secondaryItems || []).map(syncItemWithHeroMedia),
      }
    }),
  }
}

function normalizeHost(host) {
  return (host || '')
    .replace(/^https?:\/\//, '')
    .replace(/:\d+$/, '')
    .toLowerCase()
}

const PRIMARY_SITE_SLUGS = ['texas-solar-and-roofing-pros']

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

  // Site documents are always published (never drafted), so always use the
  // published perspective regardless of draft mode. Using the draft client here
  // requires an auth token and would 404 if the token is absent.
  const client = getSanityServerClient({ preview: false, stega: false })

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
        navigation,
        organization
      }`,
      { siteSlug },
      { next: { revalidate: 60 } },
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

/**
 * Resolve the navigation list for a site, preferring an editor-curated list
 * on the Sanity `site` document and falling back to the auto-derived list of
 * top-level pages when nothing is set.
 */
export function resolveNavigationForSite(site) {
  const sanityNav = Array.isArray(site?.navigation) ? site.navigation : []
  const curated = sanityNav
    .map((item) => ({
      label: typeof item?.label === 'string' ? item.label : '',
      href: typeof item?.href === 'string' ? item.href : '',
      isExternal: Boolean(item?.isExternal),
    }))
    .filter((item) => item.label && item.href)

  if (curated.length > 0) {
    return curated
  }

  return getNavigationForSite(site?.slug || '')
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
        navigation,
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
    const requestedSlug = getPageKey(slugParts)
    const isHomepageRequest = requestedSlug === ''
    const homepageFetchOptions = isHomepageRequest ? { cache: 'no-store' } : fetchOptions
    const rawPage = await client.fetch(
      isHomepageRequest
        ? groq`*[
          _type in ["page", "servicePage", "locationPage", "post"] &&
          site->slug.current in $siteSlugs &&
          (
            coalesce(slug.current, "") in ["", "/"] ||
            pageType == "home"
          )
        ] | order((pageType == "home") desc, _updatedAt desc)[0]{
        _id,
        _type,
        _createdAt,
        _updatedAt,
        "id": _id,
        title,
        seo,
        description,
        pageType,
        templateLevel,
        "slug": slug.current,
        heroEyebrow,
        heroTitle,
        heroTitlePrimary,
        heroTitleAccent,
        heroBody,
        cardCopy,
        heroGradient,
        heroTextColor,
        heroOverlayColor,
        heroOverlayStartColor,
        heroOverlayEndColor,
        heroOverlayDirection,
        heroOverlayStartOpacity,
        heroOverlayEndOpacity,
        heroOverlayOpacity,
        heroMediaMode,
        heroImage,
        heroSlides[]{
          _key,
          title,
          image,
          imageAsset{
            crop,
            hotspot,
            altText,
            alt,
            asset->{
              _id,
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
        heroAsset{
          crop,
          hotspot,
          altText,
          alt,
          asset->{
            _id,
            url,
            metadata{
              dimensions{
                width,
                height
              }
            }
          }
        },
        ${heroVideoProjection}
        heroMetrics,
        heroActions[]{
          label,
          href,
          variant
        },
        sections[]{
          ${sectionProjection}
        }
      }`
        : groq`*[_type in ["page", "servicePage", "locationPage", "post"] && site->slug.current in $siteSlugs && slug.current == $slug][0]{
        _id,
        _type,
        _createdAt,
        _updatedAt,
        "id": _id,
        title,
        seo,
        description,
        pageType,
        templateLevel,
        "slug": slug.current,
        heroEyebrow,
        heroTitle,
        heroTitlePrimary,
        heroTitleAccent,
        heroBody,
        cardCopy,
        heroGradient,
        heroTextColor,
        heroOverlayColor,
        heroOverlayStartColor,
        heroOverlayEndColor,
        heroOverlayDirection,
        heroOverlayStartOpacity,
        heroOverlayEndOpacity,
        heroOverlayOpacity,
        heroMediaMode,
        heroImage,
        heroSlides[]{
          _key,
          title,
          image,
          imageAsset{
            crop,
            hotspot,
            altText,
            alt,
            asset->{
              _id,
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
        heroAsset{
          crop,
          hotspot,
          altText,
          alt,
          asset->{
            _id,
            url,
            metadata{
              dimensions{
                width,
                height
              }
            }
          }
        },
        ${heroVideoProjection}
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
      { siteSlugs, slug: requestedSlug || '/' },
      homepageFetchOptions,
    )

    if (rawPage) {
      const page = sanitizePageRuntimeFields(rawPage)

      const guideSyncedPage = await syncGuideGridSectionItems({
        client,
        fetchOptions,
        page: {
          ...page,
          slug: page.slug === '/' ? '' : page.slug,
          heroSection: buildHomepageHeroSection(page),
        },
        siteSlug: site.slug,
      })

      const serviceSyncedPage = await syncServiceGridSectionItems({
        client,
        fetchOptions,
        page: guideSyncedPage,
        siteSlug: site.slug,
      })
      let guideTargetPath = ''
      if (
        Array.isArray(slugParts) &&
        slugParts.length >= 2 &&
        cleanRuntimeString(slugParts[0]) === 'guides'
      ) {
        guideTargetPath = `/${slugParts
          .map((s) => cleanRuntimeString(s))
          .filter(Boolean)
          .join('/')}`.replace(/\/+$/, '')
      } else if (typeof serviceSyncedPage?.slug === 'string') {
        const slugOnly = cleanRuntimeString(serviceSyncedPage.slug).replace(/^\/+/, '')
        if (slugOnly.startsWith('guides/')) {
          guideTargetPath = `/${slugOnly}`.replace(/\/+$/, '')
        }
      }

      const guideCardMeta = guideTargetPath
        ? await getGuideCardMetaForTargetPath({
            client,
            fetchOptions,
            siteSlug: site.slug,
            targetPath: guideTargetPath,
          })
        : { color: '', category: '', updatedAt: '' }
      const pageWithGuideMeta =
        guideCardMeta?.color || guideCardMeta?.category
          ? {
              ...serviceSyncedPage,
              guideCardColor: guideCardMeta.color,
              guideCategory: guideCardMeta.category,
              guideCardMetaUpdatedAt: guideCardMeta.updatedAt,
            }
          : serviceSyncedPage

      return withPageSource(pageWithGuideMeta, 'sanity')
    }
  } catch {} // eslint-disable-line no-empty

  return localPage
}

export async function getSitemapEntriesForSite(site) {
  const localSiteIds = new Set(getEquivalentSiteIds(site))
  const localEntries = pages
    .filter((page) => localSiteIds.has(page.siteId) && page.slug !== '404' && page?.seo?.noIndex !== true)
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
        slug.current != "404" &&
        coalesce(seo.noIndex, false) != true
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
  } catch {} // eslint-disable-line no-empty

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
        heroTitlePrimary,
        heroTitleAccent,
        heroBody,
        cardCopy,
        heroGradient,
        heroTextColor,
        heroOverlayColor,
        heroOverlayStartColor,
        heroOverlayEndColor,
        heroOverlayDirection,
        heroOverlayStartOpacity,
        heroOverlayEndOpacity,
        heroOverlayOpacity,
        heroMediaMode,
        heroImage,
        heroAsset{
          crop,
          hotspot,
          altText,
          alt,
          asset->{
            _id,
            url,
            metadata{
              dimensions{
                width,
                height
              }
            }
          }
        },
        ${heroVideoProjection}
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

export async function getHomepageReviewsForSite(siteSlug) {
  const site = getSiteBySlug(siteSlug)

  if (!site) {
    return []
  }

  const { client, fetchOptions } = await getSanityReadContext({ stega: true })

  if (!client) {
    return []
  }

  try {
    const siteSlugs = getEquivalentSiteSlugs(siteSlug)
    const reviews = await client.fetch(
      groq`*[_type == "review" && site->slug.current in $siteSlugs] | order(_createdAt desc){
        _id,
        "id": _id,
        author,
        body,
        reviewerLocation,
        "stars": coalesce(stars, rating, 5),
        reviewerPhoto{
          crop,
          hotspot,
          alt,
          asset->{
            _id,
            url,
            metadata{
              dimensions{
                width,
                height
              }
            }
          }
        }
      }`,
      { siteSlugs },
      fetchOptions,
    )

    return Array.isArray(reviews) ? reviews.map(sanitizeReview) : []
  } catch {
    return []
  }
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
  } catch {} // eslint-disable-line no-empty

  return localHeroSites
}

export function getPrimaryUrl(site, pathname = '/') {
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `https://${site.primaryDomain}${safePath}`
}

export function createJsonLd(site, page, pathname = '/') {
  const canonicalUrl = getPrimaryUrl(site, pathname)
  const organizationId = `${getPrimaryUrl(site, '/')}#organization`
  const websiteId = `${getPrimaryUrl(site, '/')}#website`
  const webpageId = `${canonicalUrl}#webpage`
  const organization = {
    '@type': site.organization?.type || 'LocalBusiness',
    '@id': organizationId,
    name: site.organization?.name || site.name,
    url: getPrimaryUrl(site, '/'),
    telephone: site.organization?.phone,
    email: site.organization?.email,
    areaServed: site.organization?.serviceArea,
  }
  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    url: getPrimaryUrl(site, '/'),
    name: site.name,
    publisher: {
      '@id': organizationId,
    },
  }
  const webPage = {
    '@type': 'WebPage',
    '@id': webpageId,
    name: page?.title || site.name,
    description: page?.seo?.description || page?.description || site.seo?.description,
    url: canonicalUrl,
    isPartOf: {
      '@id': websiteId,
    },
  }
  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
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
  const graph = [organization, website, webPage, breadcrumbs]

  if (page?.pageType === 'post') {
    graph.push({
      '@type': 'Article',
      '@id': `${canonicalUrl}#article`,
      headline: page.title,
      description: page?.seo?.description || page?.description || site.seo?.description,
      mainEntityOfPage: {
        '@id': webpageId,
      },
      about: site.categoryLabel,
      publisher: {
        '@id': organizationId,
      },
      datePublished: page?.createdAt || page?._createdAt || page?.updatedAt || page?._updatedAt,
      dateModified: page?.updatedAt || page?._updatedAt || page?.createdAt || page?._createdAt,
      url: canonicalUrl,
    })

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    }
  }

  const faqSection = page?.sections?.find((section) => section.type === 'faq')

  if (faqSection) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: (faqSection.items || []).map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: portableTextToPlainText(item.answer),
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
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
