import { stegaClean } from 'next-sanity'
import { isHeroSectionBlock } from '../platform/section-helpers'

function toKeyPart(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

export function normalizeSectionType(section) {
  if (!section) {
    return section
  }

  const normalizedItems = Array.isArray(section.items)
    ? section.items.map((item) => normalizeSectionItemType(section, item))
    : undefined

  if (isHeroSectionBlock(section)) {
    return {
      ...section,
      _type: 'heroSection',
      type: section.type || 'hero',
    }
  }

  if (section.type === 'resourceGrid') {
    return omitUndefined({
      _key: section._key,
      _type: 'resourceGridSection',
      type: 'resourceGrid',
      title: section.title,
      body: section.body,
      items: normalizedItems,
    })
  }

  if (section.type === 'guideGrid') {
    return omitUndefined({
      _key: section._key,
      _type: 'guideGridSection',
      type: 'guideGrid',
      title: section.title,
      body: section.body,
      items: normalizedItems,
    })
  }

  if (section.type === 'serviceGrid') {
    return omitUndefined({
      _key: section._key,
      _type: 'serviceGridSection',
      type: 'serviceGrid',
      eyebrow: section.eyebrow,
      title: section.title,
      subtitle: section.subtitle,
      body: section.body,
      items: normalizedItems,
      roofingTitle: section.roofingTitle,
      roofingItems: withObjectArrayKeys(section.roofingItems || [], 'roofing-item', 'title').map((item) =>
        normalizeSectionItemType(section, item),
      ),
      secondaryTitle: section.secondaryTitle,
      secondaryItems: withObjectArrayKeys(section.secondaryItems || [], 'secondary-item', 'title').map(
        (item) => normalizeSectionItemType(section, item),
      ),
    })
  }

  if (section.type === 'story') {
    return omitUndefined({
      _key: section._key,
      _type: 'storySection',
      type: 'story',
      eyebrow: section.eyebrow,
      title: section.title,
      body: section.body,
    })
  }

  if (section.type === 'calculator') {
    return omitUndefined({
      _key: section._key,
      _type: 'calculatorSection',
      type: 'calculator',
      eyebrow: section.eyebrow,
      title: section.title,
      subtitle: section.subtitle,
      body: section.body,
      items: normalizedItems,
      ctaLabel: section.ctaLabel,
      ctaHref: section.ctaHref,
    })
  }

  if (section.type === 'costs') {
    return omitUndefined({
      _key: section._key,
      _type: 'costsSection',
      type: 'costs',
      eyebrow: section.eyebrow,
      title: section.title,
      subtitle: section.subtitle,
      body: section.body,
      items: normalizedItems,
      secondaryTitle: section.secondaryTitle,
      secondaryItems: withObjectArrayKeys(section.secondaryItems || [], 'secondary-item', 'title').map(
        (item) => normalizeSectionItemType(section, item),
      ),
    })
  }

  if (section.type === 'guides' || section._type === 'guidesSection') {
    return omitUndefined({
      _key: section._key,
      _type: 'guidesSection',
      type: 'guides',
      title: section.title,
      body: section.body,
      ctaLabel: section.ctaLabel,
      items: normalizedItems,
    })
  }

  if (section.type === 'snapshot') {
    return omitUndefined({
      _key: section._key,
      _type: 'snapshotSection',
      type: 'snapshot',
      eyebrow: section.eyebrow,
      title: section.title,
      body: section.body,
      items: normalizedItems,
    })
  }

  if (section.type === 'incentives') {
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

  if (section.type === 'testimonials' || section._type === 'testimonialsSection') {
    return omitUndefined({
      _key: section._key,
      _type: 'testimonialsSection',
      type: 'testimonials',
      title: section.title,
      body: section.body,
      reviews: Array.isArray(section.reviews) ? section.reviews : undefined,
    })
  }

  if (section.type === 'highlights') {
    return omitUndefined({
      _key: section._key,
      _type: 'highlightsSection',
      type: 'highlights',
      title: section.title,
      subtitle: section.subtitle,
      items: normalizedItems,
    })
  }

  if (section.type === 'steps') {
    return omitUndefined({
      _key: section._key,
      _type: 'stepsSection',
      type: 'steps',
      title: section.title,
      items: normalizedItems,
    })
  }

  if (section.type === 'faq') {
    return omitUndefined({
      _key: section._key,
      _type: 'faqSection',
      type: 'faq',
      title: section.title,
      items: normalizedItems,
    })
  }

  if (section.type === 'cta' || section._type === 'ctaSection') {
    return omitUndefined({
      _key: section._key,
      _type: 'ctaSection',
      type: 'cta',
      title: section.title,
      body: section.body,
      ctaLabel: section.ctaLabel,
      theme: section.theme,
      avatarEyebrow: section.avatarEyebrow || section.personLabel,
      avatarName: section.avatarName || section.personName,
      avatarRole: section.avatarRole || section.personRole,
      avatarBlurb: section.avatarBlurb || section.personBlurb,
      avatarImage: section.avatarImage || section.profileImage,
      avatarColor: section.avatarColor,
      avatarImageAsset: section.avatarImageAsset || section.profileImageAsset,
    })
  }

  if (section.type === 'quote') {
    return omitUndefined({
      _key: section._key,
      _type: 'quoteSection',
      type: 'quote',
      eyebrow: section.eyebrow,
      title: section.title,
      body: section.body,
    })
  }

  if (section.type === 'ctaBanner' || section._type === 'ctaBannerSection') {
    return omitUndefined({
      _key: section._key,
      _type: 'ctaBannerSection',
      type: 'ctaBanner',
      eyebrow: section.eyebrow,
      title: section.title,
      body: section.body,
      ctaLabel: section.ctaLabel,
      theme: section.theme,
      avatarEyebrow: section.avatarEyebrow || section.personLabel,
      avatarName: section.avatarName || section.personName,
      avatarRole: section.avatarRole || section.personRole,
      avatarBlurb: section.avatarBlurb || section.personBlurb,
      avatarImage: section.avatarImage || section.profileImage,
      avatarImageAsset: section.avatarImageAsset || section.profileImageAsset,
    })
  }

  if (section.type === 'secondaryCTA' || section._type === 'secondaryCTASection') {
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

  if (section.type === 'scrollText' || section._type === 'scrollTextSection') {
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

  if (section.type === 'hailMap') {
    return omitUndefined({
      _key: section._key,
      _type: 'hailMapSection',
      type: 'hailMap',
      title: section.title,
      body: section.body,
    })
  }

  if (section.type === 'serviceAreaMap' || section._type === 'serviceAreaMapSection') {
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

  if (section.type === 'band') {
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

  if (section.type === 'logos' || section._type === 'logosSection') {
    return omitUndefined({
      _key: section._key,
      _type: 'logosSection',
      type: 'logos',
      internalLabel: section.internalLabel,
      title: section.title,
      body: section.body,
      items: normalizedItems,
    })
  }

  if (section.type === 'solarSwitch') {
    return omitUndefined({
      _key: section._key,
      _type: 'solarSwitchSection',
      type: 'solarSwitch',
      leadingWords: section.leadingWords,
      accentWord: section.accentWord,
      trailingText: section.trailingText,
    })
  }

  if (section.type === 'energyChart' || section._type === 'energyChartSection') {
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

  if (section.type === 'aboutProfile') {
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

  if (section._type && section._type !== 'object' && section._type !== 'pageSection') {
    return {
      ...section,
      ...(normalizedItems ? { items: normalizedItems } : {}),
    }
  }

  // Never emit legacy pageSection objects; fall back to a valid story section.
  return omitUndefined({
    _key: section._key,
    _type: 'storySection',
    type: 'story',
    eyebrow: section.eyebrow,
    title: section.title || section.question || 'Section',
    body: section.body || section.answer || section.subtitleValue || section.subtitle,
  })
}

export function withSectionKeys(sections) {
  return (sections || []).map((section, index) => {
    const normalizedSection = normalizeSectionType(section)

    const keyedSection = {
      _key:
        normalizedSection?._key ||
        createKey('section', index, normalizedSection?.title || normalizedSection?.type),
      ...normalizedSection,
    }

    if (Array.isArray(normalizedSection?.metrics)) {
      keyedSection.metrics = withObjectArrayKeys(normalizedSection.metrics, 'metric', 'label')
    }

    if (Array.isArray(normalizedSection?.actions)) {
      keyedSection.actions = withObjectArrayKeys(normalizedSection.actions, 'action', 'label')
    }

    if (Array.isArray(normalizedSection?.heroSlides)) {
      keyedSection.heroSlides = withObjectArrayKeys(normalizedSection.heroSlides, 'hero-slide', 'title')
    }

    if (Array.isArray(normalizedSection?.items)) {
      keyedSection.items = withObjectArrayKeys(normalizedSection.items, 'item', 'title')
    }

    if (Array.isArray(normalizedSection?.roofingItems)) {
      keyedSection.roofingItems = withObjectArrayKeys(normalizedSection.roofingItems, 'roofing-item', 'title')
    }

    if (Array.isArray(normalizedSection?.secondaryItems)) {
      keyedSection.secondaryItems = withObjectArrayKeys(
        normalizedSection.secondaryItems,
        'secondary-item',
        'title',
      )
    }

    if (Array.isArray(normalizedSection?.people)) {
      keyedSection.people = withObjectArrayKeys(normalizedSection.people, 'person', 'name')
    }

    if (Array.isArray(normalizedSection?.chartPoints)) {
      keyedSection.chartPoints = withObjectArrayKeys(normalizedSection.chartPoints, 'chart-point', 'label')
    }

    if (Array.isArray(normalizedSection?.chartAreaSeries)) {
      keyedSection.chartAreaSeries = withObjectArrayKeys(
        normalizedSection.chartAreaSeries,
        'area-series',
        'title',
      )
    }

    if (Array.isArray(normalizedSection?.reviews)) {
      keyedSection.reviews = withObjectArrayKeys(normalizedSection.reviews, 'review-ref', '_ref')
    }

    return keyedSection
  })
}
