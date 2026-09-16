import { stegaClean } from 'next-sanity'

import { isHeroSectionBlock } from '../platform/section-helpers.js'

function toKeyPart(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 40)
}

function createKey(prefix, index, value) {
  const fallback = `${prefix}-${index + 1}`
  const keyPart = toKeyPart(value)
  const suffix = keyPart || fallback

  return `${prefix}-${index + 1}-${suffix}`.slice(0, 96)
}

function withObjectArrayKeys(items, prefix, titleField = 'title') {
  return (items || []).map((item, index) => ({
    _key: item?._key || createKey(prefix, index, item?.[titleField] || item?.label),
    ...item,
  }))
}

function omitUndefined(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined))
}

function normalizeSectionItemType(section, item) {
  if (!item) {
    return item
  }

  const st = section?.type
  const schemaT = section?._type

  if (st === 'resourceGrid' || schemaT === 'resourceGridSection') {
    return {
      ...item,
      _type: 'resourceCard',
    }
  }

  if (st === 'guides' || schemaT === 'guidesSection') {
    return {
      ...item,
      _type: 'guideCardItem',
    }
  }

  if (st === 'logos' || schemaT === 'logosSection') {
    return {
      ...item,
      _type: 'logoMarqueeItem',
    }
  }

  if (st === 'faq' || schemaT === 'faqSection') {
    return {
      ...item,
      _type: 'pageFaqItem',
    }
  }

  if (
    st === 'highlights' ||
    st === 'steps' ||
    st === 'calculator' ||
    schemaT === 'highlightsSection' ||
    schemaT === 'stepsSection' ||
    schemaT === 'calculatorSection'
  ) {
    return {
      ...item,
      _type: 'sectionContentItem',
    }
  }

  if (item._type && item._type !== 'object') {
    return item
  }

  return {
    ...item,
    _type: 'pageItem',
  }
}

/* ---- normalizeSectionType helpers ---- */

function normalizeHeroSection(section) {
  return {
    ...section,
    _type: 'heroSection',
    type: section.type || 'hero',
  }
}

function normalizeResourceGridSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'resourceGridSection',
    type: 'resourceGrid',
    title: section.title,
    body: section.body,
    cloudVisibility: section.cloudVisibility,
    items,
  })
}

function normalizeGuideGridSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'guideGridSection',
    type: 'guideGrid',
    title: section.title,
    body: section.body,
    items,
  })
}

function normalizeServiceGridSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'serviceGridSection',
    type: 'serviceGrid',
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle,
    body: section.body,
    items,
    roofingTitle: section.roofingTitle,
    roofingItems: withObjectArrayKeys(section.roofingItems || [], 'roofing-item', 'title').map((item) =>
      normalizeSectionItemType(section, item),
    ),
    secondaryTitle: section.secondaryTitle,
    secondaryItems: withObjectArrayKeys(section.secondaryItems || [], 'secondary-item', 'title').map((item) =>
      normalizeSectionItemType(section, item),
    ),
  })
}

function normalizeStorySection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'storySection',
    type: 'story',
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
    subtitle: section.subtitle,
  })
}

function normalizeArticleSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'articleSection',
    type: 'article',
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
  })
}

function normalizeCalculatorSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'calculatorSection',
    type: 'calculator',
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle,
    body: section.body,
    items,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
  })
}

function normalizeCostsSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'costsSection',
    type: 'costs',
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle,
    body: section.body,
    items,
    secondaryTitle: section.secondaryTitle,
    secondaryItems: withObjectArrayKeys(section.secondaryItems || [], 'secondary-item', 'title').map((item) =>
      normalizeSectionItemType(section, item),
    ),
  })
}

function normalizeGuidesSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'guidesSection',
    type: 'guides',
    title: section.title,
    body: section.body,
    ctaLabel: section.ctaLabel,
    cloudVisibility: section.cloudVisibility,
    items,
  })
}

function normalizeSnapshotSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'snapshotSection',
    type: 'snapshot',
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
    cloudVisibility: section.cloudVisibility,
    items,
  })
}

function normalizeIncentivesSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'incentivesSection',
    type: 'incentives',
    title: section.title,
    body: section.body,
    image: section.image,
    imageAsset: section.imageAsset,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
  })
}

function normalizeTestimonialsSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'testimonialsSection',
    type: 'testimonials',
    title: section.title,
    body: section.body,
    reviews: Array.isArray(section.reviews) ? section.reviews : undefined,
  })
}

function normalizeHighlightsSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'highlightsSection',
    type: 'highlights',
    title: section.title,
    subtitle: section.subtitle,
    items,
  })
}

function normalizeStepsSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'stepsSection',
    type: 'steps',
    title: section.title,
    items,
  })
}

function normalizeFaqSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'faqSection',
    type: 'faq',
    title: section.title,
    items,
  })
}

function normalizeCtaSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'ctaSection',
    type: 'cta',
    title: section.title,
    body: section.body,
    ctaLabel: section.ctaLabel,
    theme: section.theme,
    cloudVisibility: section.cloudVisibility,
    avatarEyebrow: section.avatarEyebrow || section.personLabel,
    avatarName: section.avatarName || section.personName,
    avatarRole: section.avatarRole || section.personRole,
    avatarBlurb: section.avatarBlurb || section.personBlurb,
    avatarImage: section.avatarImage || section.profileImage,
    avatarColor: section.avatarColor,
    avatarImageAsset: section.avatarImageAsset || section.profileImageAsset,
  })
}

function normalizeQuoteSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'quoteSection',
    type: 'quote',
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
  })
}

function normalizeCtaBannerSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'ctaBannerSection',
    type: 'ctaBanner',
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
    ctaLabel: section.ctaLabel,
    theme: section.theme,
    cloudVisibility: section.cloudVisibility,
    avatarEyebrow: section.avatarEyebrow || section.personLabel,
    avatarName: section.avatarName || section.personName,
    avatarRole: section.avatarRole || section.personRole,
    avatarBlurb: section.avatarBlurb || section.personBlurb,
    avatarImage: section.avatarImage || section.profileImage,
    avatarImageAsset: section.avatarImageAsset || section.profileImageAsset,
  })
}

function normalizeBannerCtaSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'bannerCtaSection',
    type: 'bannerCta',
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
    image: section.image,
    imageAsset: section.imageAsset,
    cloudVisibility: section.cloudVisibility,
  })
}

function normalizeSecondaryCtaSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'secondaryCTASection',
    type: 'secondaryCTA',
    title: section.title,
    body: section.body,
    ctaLabel: section.ctaLabel,
    ctaHref: section.ctaHref,
    color: section.color,
  })
}

function normalizeScrollTextSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'scrollTextSection',
    type: 'scrollText',
    text: Array.isArray(section.text) ? section.text : undefined,
    fontSize: section.fontSize,
    textColor: section.textColor,
    showIcon: section.showIcon,
    showFlag: section.showFlag,
    icon: section.icon,
    velocity: section.velocity,
    direction: section.direction,
    startPosition: section.startPosition,
    damping: section.damping,
    stiffness: section.stiffness,
    numCopies: section.numCopies,
  })
}

function normalizeHailMapSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'hailMapSection',
    type: 'hailMap',
    title: section.title,
    body: section.body,
  })
}

function normalizeServiceAreaMapSection(section) {
  const areas = Array.isArray(section.areas)
    ? section.areas.map((area, index) => {
        const countyKey = stegaClean(area?.countyKey) || area?.countyKey
        return omitUndefined({
          ...area,
          countyKey,
          _type: 'serviceAreaItem',
          _key: area?._key || createKey('service-area', index, countyKey || area?.displayName),
        })
      })
    : undefined

  return omitUndefined({
    _key: section._key,
    _type: 'serviceAreaMapSection',
    type: 'serviceAreaMap',
    eyebrow: section.eyebrow,
    title: section.title,
    description: section.description,
    accentColor: section.accentColor,
    backgroundColor: section.backgroundColor,
    areas,
  })
}

function normalizeBandSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'bandSection',
    type: 'band',
    colors: section.colors,
    tint: section.tint,
    minHeight: section.minHeight,
    maxHeight: section.maxHeight,
    rotate: section.rotate,
    scrollStart: section.scrollStart,
    scrollEnd: section.scrollEnd,
    reverse: section.reverse,
    autoAnimate: section.autoAnimate,
    speed: section.speed,
    amplitude: section.amplitude,
  })
}

function normalizeLogosSection(section, items) {
  return omitUndefined({
    _key: section._key,
    _type: 'logosSection',
    type: 'logos',
    internalLabel: section.internalLabel,
    title: section.title,
    body: section.body,
    items,
  })
}

function normalizeSolarSwitchSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'solarSwitchSection',
    type: 'solarSwitch',
    leadingWords: section.leadingWords,
    accentWord: section.accentWord,
    trailingText: section.trailingText,
  })
}

function normalizeEnergyChartSection(section) {
  const chartAreaSeries = Array.isArray(section.chartAreaSeries)
    ? section.chartAreaSeries.map((row, index) =>
        omitUndefined({
          ...row,
          _type: 'energyChartAreaSeriesItem',
          _key: row._key || createKey('area-series', index, row?.title),
        }),
      )
    : undefined

  return omitUndefined({
    _key: section._key,
    _type: 'energyChartSection',
    type: 'energyChart',
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
    chartType: section.chartType,
    showGrid: section.showGrid,
    showLegend: section.showLegend,
    showAxisLines: section.showAxisLines,
    chartAreaFillOpacity: section.chartAreaFillOpacity,
    chartPeriodLabel: section.chartPeriodLabel,
    chartPrimaryLabel: section.chartPrimaryLabel,
    chartSecondaryLabel: section.chartSecondaryLabel,
    chartUnitLabel: section.chartUnitLabel,
    chartLineUnitLabel: section.chartLineUnitLabel,
    chartYAxisMax: section.chartYAxisMax,
    chartBarColor: section.chartBarColor,
    chartLineColor: section.chartLineColor,
    chartAreaStacked: section.chartAreaStacked,
    chartAreaSeries,
    chartPoints: Array.isArray(section.chartPoints)
      ? section.chartPoints.map((point, index) => ({
          ...point,
          _key:
            point?._key && String(point._key).trim()
              ? point._key
              : createKey('chart-point', index, point?.label),
        }))
      : undefined,
  })
}

function normalizeAboutProfileSection(section) {
  const people =
    Array.isArray(section.people) && section.people.length
      ? section.people
      : [
          omitUndefined({
            _key: section.personKey,
            _type: 'aboutProfilePerson',
            label: section.personLabel,
            name: section.personName,
            role: section.personRole,
            blurb: section.personBlurb,
            cardGradientStart: 'primary',
            cardGradientEnd: 'tidal',
            profileImage: section.profileImage,
            profileImageAsset: section.profileImageAsset,
            certificationLabel: section.certificationLabel,
            certificationTitle: section.certificationTitle,
            badgeImage: section.badgeImage,
            badgeImageAsset: section.badgeImageAsset,
          }),
          omitUndefined({
            _key: section.secondaryPersonKey,
            _type: 'aboutProfilePerson',
            label: section.secondaryPersonLabel,
            name: section.secondaryPersonName,
            role: section.secondaryPersonRole,
            blurb: section.secondaryPersonBlurb,
            cardGradientStart: 'primary',
            cardGradientEnd: 'sweetcorn',
            profileImage: section.secondaryProfileImage,
            profileImageAsset: section.secondaryProfileImageAsset,
          }),
        ].filter((person) => person.name)

  return omitUndefined({
    _key: section._key,
    _type: 'aboutProfileSection',
    type: 'aboutProfile',
    eyebrow: section.eyebrow,
    title: section.title,
    body: section.body,
    people,
  })
}

function normalizePassthroughSection(section, items) {
  return {
    ...section,
    ...(items ? { items } : {}),
  }
}

function normalizeFallbackSection(section) {
  return omitUndefined({
    _key: section._key,
    _type: 'storySection',
    type: 'story',
    eyebrow: section.eyebrow,
    title: section.title || section.question || 'Section',
    body: section.body || section.answer || section.subtitleValue || section.subtitle,
  })
}

const SECTION_NORMALIZERS = [
  { match: isHeroSectionBlock, handler: normalizeHeroSection },
  { match: (s) => s.type === 'resourceGrid', handler: normalizeResourceGridSection },
  { match: (s) => s.type === 'guideGrid', handler: normalizeGuideGridSection },
  { match: (s) => s.type === 'serviceGrid', handler: normalizeServiceGridSection },
  { match: (s) => s.type === 'story', handler: normalizeStorySection },
  { match: (s) => s.type === 'article', handler: normalizeArticleSection },
  { match: (s) => s.type === 'calculator', handler: normalizeCalculatorSection },
  { match: (s) => s.type === 'costs', handler: normalizeCostsSection },
  { match: (s) => s.type === 'guides' || s._type === 'guidesSection', handler: normalizeGuidesSection },
  { match: (s) => s.type === 'snapshot', handler: normalizeSnapshotSection },
  { match: (s) => s.type === 'incentives', handler: normalizeIncentivesSection },
  {
    match: (s) => s.type === 'testimonials' || s._type === 'testimonialsSection',
    handler: normalizeTestimonialsSection,
  },
  { match: (s) => s.type === 'highlights', handler: normalizeHighlightsSection },
  { match: (s) => s.type === 'steps', handler: normalizeStepsSection },
  { match: (s) => s.type === 'faq', handler: normalizeFaqSection },
  { match: (s) => s.type === 'cta' || s._type === 'ctaSection', handler: normalizeCtaSection },
  { match: (s) => s.type === 'quote', handler: normalizeQuoteSection },
  {
    match: (s) => s.type === 'ctaBanner' || s._type === 'ctaBannerSection',
    handler: normalizeCtaBannerSection,
  },
  {
    match: (s) => s.type === 'bannerCta' || s._type === 'bannerCtaSection',
    handler: normalizeBannerCtaSection,
  },
  {
    match: (s) => s.type === 'secondaryCTA' || s._type === 'secondaryCTASection',
    handler: normalizeSecondaryCtaSection,
  },
  {
    match: (s) => s.type === 'scrollText' || s._type === 'scrollTextSection',
    handler: normalizeScrollTextSection,
  },
  { match: (s) => s.type === 'hailMap', handler: normalizeHailMapSection },
  {
    match: (s) => s.type === 'serviceAreaMap' || s._type === 'serviceAreaMapSection',
    handler: normalizeServiceAreaMapSection,
  },
  { match: (s) => s.type === 'band', handler: normalizeBandSection },
  { match: (s) => s.type === 'logos' || s._type === 'logosSection', handler: normalizeLogosSection },
  { match: (s) => s.type === 'solarSwitch', handler: normalizeSolarSwitchSection },
  {
    match: (s) => s.type === 'energyChart' || s._type === 'energyChartSection',
    handler: normalizeEnergyChartSection,
  },
  { match: (s) => s.type === 'aboutProfile', handler: normalizeAboutProfileSection },
  {
    match: (s) => s._type && s._type !== 'object' && s._type !== 'pageSection',
    handler: normalizePassthroughSection,
  },
  { match: () => true, handler: normalizeFallbackSection },
]

export function normalizeSectionType(section) {
  if (!section) {
    return section
  }

  const normalizedItems = Array.isArray(section.items)
    ? section.items.map((item) => normalizeSectionItemType(section, item))
    : undefined

  const normalizer = SECTION_NORMALIZERS.find((n) => n.match(section))
  return normalizer.handler(section, normalizedItems)
}

const SECTION_ARRAY_FIELDS = [
  ['metrics', 'metric', 'label'],
  ['actions', 'action', 'label'],
  ['heroSlides', 'hero-slide', 'title'],
  ['items', 'item', 'title'],
  ['roofingItems', 'roofing-item', 'title'],
  ['secondaryItems', 'secondary-item', 'title'],
  ['people', 'person', 'name'],
  ['chartPoints', 'chart-point', 'label'],
  ['chartAreaSeries', 'area-series', 'title'],
  ['reviews', 'review-ref', '_ref'],
]

export function withSectionKeys(sections) {
  return (sections || []).map((section, index) => {
    const normalizedSection = normalizeSectionType(section)

    const keyedSection = {
      _key:
        normalizedSection?._key ||
        createKey('section', index, normalizedSection?.title || normalizedSection?.type),
      ...normalizedSection,
    }

    for (const [field, prefix, titleField] of SECTION_ARRAY_FIELDS) {
      if (Array.isArray(normalizedSection?.[field])) {
        keyedSection[field] = withObjectArrayKeys(normalizedSection[field], prefix, titleField)
      }
    }

    return keyedSection
  })
}
