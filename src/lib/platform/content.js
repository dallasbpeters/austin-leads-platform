import { groq, stegaClean } from 'next-sanity'
import { draftMode, headers } from 'next/headers'

import { isHeroSectionBlock } from '@/lib/platform/section-helpers'
import { withSectionKeys } from '@/lib/sanity/keys'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { getSanityServerClient, sanityWriteClient } from '@/sanity/client'

import { pages, sites } from './fixtures'
import { hasImageSource } from './imageSource'
import { defaultLaunchChecklist } from './launchChecklist'

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

/**
 * Field set every page section can carry. Exported so documents outside the page
 * family (`caseStudy`) can project their own `sections` array identically.
 */
export const sectionProjection = `
  _type,
  _key,
  type,
  layout,
  maxItems,
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
  // pricingSection: array of pricingNoteItem (title, body, variant, paymentDue, amount).
  notes[]{
    _key,
    title,
    body,
    variant,
    paymentDue,
    amount
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
  backgroundImage,
  backgroundImageAsset{
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
  roofImage,
  roofImageAsset{
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
  panelImage,
  panelImageAsset{
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
    imageSide,
    question,
    answer,
    href,
    icon,
    color,
    cardColor,
    price,
    isRecommended,
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
  reasons[]{
    _key,
    title,
    icon,
    body
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
    isRecommended,
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
    isRecommended,
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
  sectionBackgroundColor,
  sectionBackgroundImage{
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
  // videoSection fields
  videoUrl,
  caption,
  autoplay,
  loop,
  muted,
  aspectRatio,
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

const cleanRuntimeString = (value) => {
  return typeof value === 'string' ? stegaClean(value) : value
}

const sanitizeAction = (action) => {
  if (!action) {
    return action
  }

  return {
    ...action,
    href: cleanRuntimeString(action.href),
    variant: cleanRuntimeString(action.variant),
  }
}

const sanitizeItem = (item) => {
  if (!item) {
    return item
  }

  return {
    ...item,
    _key: cleanRuntimeString(item._key),
    href: cleanRuntimeString(item.href),
    icon: cleanRuntimeString(item.icon),
    color: resolveSanityColorValue(item.color),
    cardColor: resolveSanityColorValue(item.cardColor),
  }
}

const sanitizePerson = (person) => {
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

const resolveSanityColorValue = (value) => {
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

const coerceNumberField = (value) => {
  if (typeof value === 'number') {
    return value
  }
  if (value) {
    return Number(value)
  }
  return value
}

const sanitizeSection = (section) => {
  if (!section) {
    return section
  }

  const s = section
  return {
    ...s,
    _type: cleanRuntimeString(s._type),
    _key: cleanRuntimeString(s._key),
    type: cleanRuntimeString(s.type),
    heroMediaMode: cleanRuntimeString(s.heroMediaMode),
    subtitle: s.subtitle,
    cardCopy: s.cardCopy,
    leadingWords: Array.isArray(s.leadingWords) ? s.leadingWords.filter(Boolean) : s.leadingWords,
    accentWord: s.accentWord,
    trailingText: s.trailingText,
    chartPeriodLabel: cleanRuntimeString(s.chartPeriodLabel),
    chartPrimaryLabel: cleanRuntimeString(s.chartPrimaryLabel),
    chartSecondaryLabel: cleanRuntimeString(s.chartSecondaryLabel),
    chartUnitLabel: cleanRuntimeString(s.chartUnitLabel),
    chartLineUnitLabel: cleanRuntimeString(s.chartLineUnitLabel),
    chartYAxisMax: coerceNumberField(s.chartYAxisMax),
    chartBarColor: resolveSanityColorValue(s.chartBarColor),
    chartLineColor: resolveSanityColorValue(s.chartLineColor),
    chartType: cleanRuntimeString(s.chartType),
    showGrid: s.showGrid !== false,
    showLegend: s.showLegend !== false,
    showAxisLines: s.showAxisLines !== false,
    chartAreaFillOpacity: coerceNumberField(s.chartAreaFillOpacity),
    colors: Array.isArray(s.colors) ? s.colors.map(resolveSanityColorValue).filter(Boolean) : s.colors,
    tint: resolveSanityColorValue(s.tint),
    titlePrimary: s.titlePrimary,
    titleAccent: s.titleAccent,
    roofingTitle: s.roofingTitle,
    secondaryTitle: s.secondaryTitle,
    heroGradient: cleanRuntimeString(s.heroGradient),
    heroTextColor: resolveSanityColorValue(s.heroTextColor),
    heroOverlayColor: resolveSanityColorValue(s.heroOverlayColor),
    heroOverlayStartColor: resolveSanityColorValue(s.heroOverlayStartColor),
    heroOverlayEndColor: resolveSanityColorValue(s.heroOverlayEndColor),
    heroOverlayDirection: cleanRuntimeString(s.heroOverlayDirection),
    minHeight: coerceNumberField(s.minHeight),
    maxHeight: coerceNumberField(s.maxHeight),
    rotate: Boolean(s.rotate),
    scrollStart: coerceNumberField(s.scrollStart),
    scrollEnd: coerceNumberField(s.scrollEnd),
    reverse: Boolean(s.reverse),
    autoAnimate: Boolean(s.autoAnimate),
    speed: coerceNumberField(s.speed),
    amplitude: coerceNumberField(s.amplitude),
    text: Array.isArray(s.text) ? s.text.map(cleanRuntimeString).filter(Boolean) : s.text,
    texts: Array.isArray(s.texts) ? s.texts.map(cleanRuntimeString).filter(Boolean) : s.texts,
    fontSize: coerceNumberField(s.fontSize),
    textColor: resolveSanityColorValue(s.textColor),
    showIcon: Boolean(s.showIcon),
    showFlag: Boolean(s.showFlag),
    icon: cleanRuntimeString(s.icon),
    velocity: coerceNumberField(s.velocity),
    direction: cleanRuntimeString(s.direction),
    startPosition: coerceNumberField(s.startPosition),
    damping: coerceNumberField(s.damping),
    stiffness: coerceNumberField(s.stiffness),
    numCopies: coerceNumberField(s.numCopies),
    people: Array.isArray(s.people) ? s.people.map(sanitizePerson) : s.people,
    personLabel: s.personLabel,
    personName: s.personName,
    personRole: s.personRole,
    personBlurb: s.personBlurb,
    certificationLabel: s.certificationLabel,
    certificationTitle: s.certificationTitle,
    image: s.image,
    imageAsset: s.imageAsset,
    secondaryPersonLabel: s.secondaryPersonLabel,
    secondaryPersonName: s.secondaryPersonName,
    secondaryPersonRole: s.secondaryPersonRole,
    secondaryPersonBlurb: s.secondaryPersonBlurb,
    ctaLabel: s.ctaLabel,
    color: resolveSanityColorValue(s.color),
    accentColor: resolveSanityColorValue(s.accentColor),
    backgroundColor: resolveSanityColorValue(s.backgroundColor),
    sectionBackgroundColor: resolveSanityColorValue(s.sectionBackgroundColor),
    sectionBackgroundImage: s.sectionBackgroundImage,
    theme: cleanRuntimeString(s.theme),
    ctaHref: cleanRuntimeString(s.ctaHref),
    avatarEyebrow: s.avatarEyebrow,
    avatarName: s.avatarName,
    avatarRole: s.avatarRole,
    avatarBlurb: s.avatarBlurb,
    avatarColor: resolveSanityColorValue(s.avatarColor),
    actions: Array.isArray(s.actions) ? s.actions.map(sanitizeAction) : s.actions,
    reviews: Array.isArray(s.reviews) ? s.reviews.map(sanitizeReview) : s.reviews,
    heroSlides: Array.isArray(s.heroSlides) ? s.heroSlides.map(sanitizeItem) : s.heroSlides,
    items: Array.isArray(s.items) ? s.items.map(sanitizeItem) : s.items,
    chartPoints: Array.isArray(s.chartPoints)
      ? s.chartPoints.map((point) => ({
          ...point,
          _key: cleanRuntimeString(point?._key),
          label: cleanRuntimeString(point?.label),
          barValue: typeof point?.barValue === 'number' ? point.barValue : Number(point?.barValue || 0),
          lineValue: typeof point?.lineValue === 'number' ? point.lineValue : Number(point?.lineValue || 0),
        }))
      : s.chartPoints,
    roofingItems: Array.isArray(s.roofingItems) ? s.roofingItems.map(sanitizeItem) : s.roofingItems,
    secondaryItems: Array.isArray(s.secondaryItems) ? s.secondaryItems.map(sanitizeItem) : s.secondaryItems,
    description: typeof s.description === 'string' ? cleanRuntimeString(s.description) : s.description,
    areas: Array.isArray(s.areas)
      ? s.areas.map((area) => ({
          ...area,
          _key: cleanRuntimeString(area?._key),
          countyKey: cleanRuntimeString(area?.countyKey),
          displayName: cleanRuntimeString(area?.displayName),
        }))
      : s.areas,
  }
}

const sanitizePageRuntimeFields = (page) => {
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

const normalizeGuideGridHrefPath = (href) => {
  const rawHref = cleanRuntimeString(href)
  if (!rawHref) {
    return ''
  }

  try {
    const parsed = new URL(rawHref, 'https://guide-color.local')
    const normalizedPath = cleanRuntimeString(parsed.pathname).replace(/\/+$/, '')
    return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  } catch {
    const normalizedPath = rawHref.replace(/[?#].*$/, '').replace(/\/+$/, '')
    return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  }
}

const guideGridItemMatchesTargetPath = (itemHref, targetPath) => {
  const itemPath = normalizeGuideGridHrefPath(itemHref)
  const wants = String(targetPath || '').replace(/\/+$/, '')
  if (!itemPath || !wants) {
    return false
  }
  if (itemPath === wants) {
    return true
  }

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
const getGuideCardMetaForTargetPath = async ({ client, fetchOptions, siteSlug, targetPath }) => {
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

const sanitizeReview = (review) => {
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

/**
 * Draft-aware read context. Exported so queries living outside this module
 * (`sanity/lib/caseStudies`) resolve drafts in Presentation the same way pages do,
 * instead of quietly reading published content only.
 */
export const getSanityReadContext = async ({ stega = true } = {}) => {
  const { isEnabled } = await draftMode()
  const client = getSanityServerClient({ preview: isEnabled, stega: isEnabled && stega })

  return {
    client,
    isDraft: isEnabled,
    fetchOptions: isEnabled ? { cache: 'no-store' } : { next: { revalidate: 60 } },
  }
}

const pageHasFlatHeroContent = (page) => {
  return !!(
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
  )
}

const resolveNullableField = (value) => {
  return value ?? null
}

const buildHeroSectionFromPage = (page) => {
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
    heroGradient: resolveNullableField(page.heroGradient),
    heroTextColor: resolveNullableField(page.heroTextColor),
    heroOverlayColor: resolveNullableField(page.heroOverlayColor),
    heroOverlayStartColor: resolveNullableField(page.heroOverlayStartColor),
    heroOverlayEndColor: resolveNullableField(page.heroOverlayEndColor),
    heroOverlayDirection: resolveNullableField(page.heroOverlayDirection),
    heroOverlayStartOpacity: resolveNullableField(page.heroOverlayStartOpacity),
    heroOverlayEndOpacity: resolveNullableField(page.heroOverlayEndOpacity),
    heroOverlayOpacity: resolveNullableField(page.heroOverlayOpacity),
    heroAsset: resolveNullableField(page.heroAsset),
    heroImage: resolveNullableField(page.heroImage),
    heroVideo: resolveNullableField(page.heroVideo),
    heroVideoAsset: resolveNullableField(page.heroVideoAsset),
    heroSlides: Array.isArray(page.heroSlides) ? page.heroSlides : [],
    metrics: Array.isArray(page.heroMetrics) ? page.heroMetrics : [],
    actions: Array.isArray(page.heroActions) ? page.heroActions : [],
  }
}

const buildHomepageHeroSection = (page) => {
  if (!page) {
    return null
  }

  const sectionHero = page.sections?.find(isHeroSectionBlock) ?? null

  if (sectionHero) {
    return sectionHero
  }

  if (!pageHasFlatHeroContent(page)) {
    return null
  }

  return buildHeroSectionFromPage(page)
}

const withPageSource = (page, source) => {
  if (!page) {
    return null
  }

  return {
    ...page,
    source,
  }
}

const syncGuideGridSectionItems = async ({ client, fetchOptions, page, siteSlug }) => {
  const buildPortableTextSimple = (value) => {
    const text = cleanRuntimeString(value)
    if (!text) {
      return []
    }

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

  const guideSlugs = [
    ...new Set(
      page.sections
        .filter((section) => section.type === 'guideGrid')
        .flatMap((section) => section.items || [])
        .map((item) => cleanRuntimeString(item?.href))
        .filter((href) => isGuidesPrefixedHref(href))
        .map((href) => href.replace(/^\//, '')),
    ),
  ]

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
    ...[...sanityGuideMap.entries()].map(([href, value]) => ({ href, ...value })),
    ...[...localGuideMap.entries()].map(([href, value]) => ({ href, ...value })),
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
            .toSorted((left, right) => {
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

const slugFromHref = (href) => {
  const value = cleanRuntimeString(href)

  if (!value) {
    return ''
  }

  return value.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '')
}

const syncServiceGridSectionItems = async ({ client, fetchOptions, page, siteSlug }) => {
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

  const serviceSlugs = [
    ...new Set(
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
  ]

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

const normalizeHost = (host) => {
  return (host || '')
    .replace(/^https?:\/\//, '')
    .replace(/:\d+$/, '')
    .toLowerCase()
}

const PRIMARY_SITE_SLUGS = ['texas-solar-and-roofing-pros']

export const isPrimarySiteSlug = (siteSlug) => {
  return PRIMARY_SITE_SLUGS.includes(siteSlug)
}

const getEquivalentSiteSlugs = (siteSlug) => {
  return isPrimarySiteSlug(siteSlug) ? PRIMARY_SITE_SLUGS : [siteSlug]
}

export const getAllSites = () => {
  return sites
}

export const getAllRenderableSites = () => {
  return sites.filter((site) => site.tier !== 'redirect')
}

export const getHeroSites = () => {
  return sites.filter((site) => site.tier === 'hero')
}

export const getSiteById = (siteId) => {
  return sites.find((site) => site.id === siteId) ?? null
}

export const getSiteBySlug = (siteSlug) => {
  return sites.find((site) => getEquivalentSiteSlugs(siteSlug).includes(site.slug)) ?? null
}

export const resolveSiteBySlug = async (siteSlug) => {
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
        projectsIndex,
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

export const getPageKey = (slugParts = []) => {
  if (!slugParts.length) {
    return ''
  }

  return slugParts.join('/')
}

export const getPagesForSite = (siteSlug) => {
  return pages.filter((page) => getEquivalentSiteSlugs(siteSlug).includes(page.siteSlug))
}

export const getPageForSite = (siteSlug, slugParts = []) => {
  return withPageSource(
    pages.find(
      (page) =>
        getEquivalentSiteSlugs(siteSlug).includes(page.siteSlug) && page.slug === getPageKey(slugParts),
    ) ?? null,
    'fixture',
  )
}

const toHeroPageRecord = (page, site) => {
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

export const getNavigationForSite = (siteSlug) => {
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
export const resolveNavigationForSite = (site) => {
  const sanityNav = Array.isArray(site?.navigation) ? site.navigation : []
  const curated = sanityNav
    .map((item) => ({
      label: typeof item?.label === 'string' ? item.label : '',
      href: typeof item?.href === 'string' ? item.href : '',
      isExternal: Boolean(item?.isExternal),
      variant: typeof item?.variant === 'string' ? item.variant : 'link',
    }))
    .filter((item) => item.label && item.href)

  if (curated.length > 0) {
    return curated
  }

  return getNavigationForSite(site?.slug || '')
}

const getEquivalentSiteIds = (site) => {
  const equivalentSlugs = getEquivalentSiteSlugs(site.slug)

  return sites
    .filter((candidate) => equivalentSlugs.includes(candidate.slug))
    .map((candidate) => candidate.id)
}

export const resolveSiteByHost = async (host) => {
  const normalizedHost = normalizeHost(host)
  const isLocalHost = normalizedHost === 'localhost' || normalizedHost === '127.0.0.1'

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
        projectsIndex,
        leadForm,
        seo,
        brand,
        navigation,
        organization
      }`,
      { host: normalizedHost },
      fetchOptions,
    )

    if (!site && isLocalHost && localSite?.slug) {
      const localSanitySite = await client.fetch(
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
          projectsIndex,
          leadForm,
          seo,
          brand,
          navigation,
          organization
        }`,
        { siteSlug: localSite.slug },
        fetchOptions,
      )

      return localSanitySite ?? localSite ?? getSiteBySlug('texas-solar-and-roofing-pros')
    }

    return site ?? localSite ?? getSiteBySlug('texas-solar-and-roofing-pros')
  } catch {
    return localSite ?? getSiteBySlug('texas-solar-and-roofing-pros')
  }
}

export const resolveCurrentSite = async () => {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')

  return resolveSiteByHost(host)
}

const describePageRequest = (site, slugParts) => `site "${site.slug}" (${getPageKey(slugParts) || '/'})`

/**
 * Fetch a page document, retrying against the published perspective in draft mode.
 *
 * Draft-mode reads use the `drafts` perspective, which requires SANITY_API_READ_TOKEN.
 * Without a valid token, any document that *has* a draft drops out of the result set
 * entirely — the query succeeds but returns nothing. Retrying with the published
 * perspective keeps Presentation previewing real Sanity content instead of silently
 * falling through to the hardcoded fixtures in `./fixtures`.
 */
/** An empty array is truthy, so list queries need their own emptiness test. */
const foundNothing = (value) =>
  value === null || value === undefined || (Array.isArray(value) && value.length === 0)

export const fetchWithPublishedFallback = async ({ client, isDraft, query, params, fetchOptions }) => {
  const draftResult = await client.fetch(query, params, fetchOptions)

  if (!isDraft || !foundNothing(draftResult)) {
    return draftResult
  }

  const publishedClient = getSanityServerClient({ preview: false, stega: true })

  if (!publishedClient) {
    return draftResult
  }

  const publishedResult = await publishedClient.fetch(query, params, { cache: 'no-store' })

  if (!foundNothing(publishedResult)) {
    console.warn(
      '[content] Draft-mode query returned nothing; using published content instead. Set SANITY_API_READ_TOKEN to preview unpublished drafts.',
    )
  }

  return publishedResult
}

/**
 * In draft mode (Presentation preview) a fixture fallback is almost always a
 * misconfiguration rather than intent: reading the "drafts" perspective requires
 * SANITY_API_READ_TOKEN, and without it documents that have drafts drop out of the
 * query entirely, so the editor silently previews fixture content instead of theirs.
 */
const warnOnDraftFixtureFallback = (isDraft, localPage, site, slugParts) => {
  if (!isDraft || !localPage) {
    return
  }

  console.warn(
    `[content] Draft-mode preview found no Sanity page for ${describePageRequest(site, slugParts)} — serving fixture content. Check that SANITY_API_READ_TOKEN is set and has draft read access.`,
  )
}

export const getPageForRequest = async (site, slugParts = []) => {
  const localPage = getPageForSite(site.slug, slugParts)

  const { client, fetchOptions, isDraft } = await getSanityReadContext()

  if (!client) {
    return localPage
  }

  try {
    const siteSlugs = getEquivalentSiteSlugs(site.slug)
    const requestedSlug = getPageKey(slugParts)
    const isHomepageRequest = requestedSlug === ''
    const homepageFetchOptions = isHomepageRequest ? { cache: 'no-store' } : fetchOptions
    const pageQuery = isHomepageRequest
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
      }`

    const rawPage = await fetchWithPublishedFallback({
      client,
      isDraft,
      query: pageQuery,
      params: { siteSlugs, slug: requestedSlug || '/' },
      fetchOptions: homepageFetchOptions,
    })

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
  } catch (error) {
    // Falling through to `localPage` means serving hardcoded fixture content instead
    // of Sanity. That is nearly invisible in the browser, so make it loud in the logs.
    console.warn(
      `[content] Sanity page fetch failed for ${describePageRequest(site, slugParts)} — serving fixture content instead.`,
      error,
    )
  }

  warnOnDraftFixtureFallback(isDraft, localPage, site, slugParts)

  return localPage
}

export const getSitemapEntriesForSite = async (site) => {
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

      return [...deduped.values()]
    }
  } catch {} // eslint-disable-line no-empty

  return localEntries
}

export const getHeroPages = async ({ stega = false } = {}) => {
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

export const getPageBySlug = async (siteSlug, slug) => {
  const site = getSiteBySlug(siteSlug)

  if (!site) {
    return null
  }

  return getPageForRequest(site, slug === '/' ? [] : slug.split('/').filter(Boolean))
}

export const getLaunchChecklist = async () => {
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

export const getHeroHomepageForSite = async (siteSlug) => {
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

export const getHomepageForSite = async (siteSlug) => {
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

export const getHomepageReviewsForSite = async (siteSlug) => {
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

export const getHeroSitesForAdmin = async () => {
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

export const getPrimaryUrl = (site, pathname = '/') => {
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `https://${site.primaryDomain}${safePath}`
}

const buildBreadcrumbList = (site, pathname, canonicalUrl) => {
  const homeCrumb = {
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: getPrimaryUrl(site, '/'),
  }

  const crumbs = pathname
    .split('/')
    .filter(Boolean)
    .reduce(
      (items, segment, index, all) => {
        const href = `/${all.slice(0, index + 1).join('/')}`
        items.push({
          '@type': 'ListItem',
          position: items.length + 1,
          name: segment.replaceAll('-', ' ').replaceAll(/\b\w/g, (char) => char.toUpperCase()),
          item: getPrimaryUrl(site, href),
        })
        return items
      },
      [homeCrumb],
    )

  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: crumbs,
  }
}

const selectFirstTruthy = (...candidates) => {
  for (const candidate of candidates) {
    if (candidate) {
      return candidate
    }
  }
  return
}

const buildArticleGraphNode = (canonicalUrl, page, site, webpageId, organizationId) => {
  return {
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    headline: page.title,
    description: selectFirstTruthy(page.seo?.description, page.description, site.seo?.description),
    mainEntityOfPage: { '@id': webpageId },
    about: site.categoryLabel,
    publisher: { '@id': organizationId },
    datePublished: selectFirstTruthy(page.createdAt, page._createdAt, page.updatedAt, page._updatedAt),
    dateModified: selectFirstTruthy(page.updatedAt, page._updatedAt, page.createdAt, page._createdAt),
    url: canonicalUrl,
  }
}

const buildFaqGraphNode = (canonicalUrl, faqSection) => {
  return {
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
  }
}

const buildOrganizationNode = (site, organizationId) => {
  return {
    '@type': selectFirstTruthy(site.organization?.type, 'LocalBusiness'),
    '@id': organizationId,
    name: selectFirstTruthy(site.organization?.name, site.name),
    url: getPrimaryUrl(site, '/'),
    telephone: site.organization?.phone,
    email: site.organization?.email,
    areaServed: site.organization?.serviceArea,
  }
}

export const createJsonLd = (site, page, pathname = '/') => {
  const canonicalUrl = getPrimaryUrl(site, pathname)
  const organizationId = `${getPrimaryUrl(site, '/')}#organization`
  const websiteId = `${getPrimaryUrl(site, '/')}#website`
  const webpageId = `${canonicalUrl}#webpage`
  const organization = buildOrganizationNode(site, organizationId)
  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    url: getPrimaryUrl(site, '/'),
    name: site.name,
    publisher: { '@id': organizationId },
  }
  const webPage = {
    '@type': 'WebPage',
    '@id': webpageId,
    name: selectFirstTruthy(page?.title, site.name),
    description: page
      ? selectFirstTruthy(page.seo?.description, page.description, site.seo?.description)
      : site.seo?.description,
    url: canonicalUrl,
    isPartOf: { '@id': websiteId },
  }
  const breadcrumbs = buildBreadcrumbList(site, pathname, canonicalUrl)
  const graph = [organization, website, webPage, breadcrumbs]

  if (page?.pageType === 'post') {
    graph.push(buildArticleGraphNode(canonicalUrl, page, site, webpageId, organizationId))
    return { '@context': 'https://schema.org', '@graph': graph }
  }

  const faqSection = page?.sections?.find((section) => section.type === 'faq')

  if (faqSection) {
    graph.push(buildFaqGraphNode(canonicalUrl, faqSection))
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

export const publishPageToSanity = async (job) => {
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
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')

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
