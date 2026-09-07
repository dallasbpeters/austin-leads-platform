// oxlint-disable sort-keys radix eqeqeq no-eq-null
import { resolveIconoirIcon } from '@/lib/resolve-icon'
import {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Flash,
  HomeShield,
  Star,
  Thunderstorm,
  WindowTabs,
} from 'iconoir-react'
import Image from 'next/image'
import Link from 'next/link'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'

const serviceImageMap = {
  audit: {
    url: '/assets/services/photos/energy-audits.jpg',
    alt: 'Thermostat control being adjusted during a home energy audit',
  },
  commercialroofing: {
    url: 'https://images.unsplash.com/photo-1737256359080-9354dbcc21ef?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Large commercial building roof under clear sky',
  },
  detachreset: {
    url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
    alt: 'Solar array on a residential roof ready for coordinated detach and reset work',
  },
  ducts: {
    url: '/assets/services/photos/duct-sealing.jpg',
    alt: 'Architectural vent detail representing HVAC airflow and duct performance',
  },
  electrical: {
    url: 'https://images.unsplash.com/photo-1759692071712-adc78a8516c8?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Electrical panel and power equipment',
  },
  evcharger: {
    url: 'https://images.unsplash.com/photo-1724963914478-77af9eba1c50?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Electric vehicle plugged into a home charger',
  },
  hailinspection: {
    url: 'https://images.unsplash.com/photo-1656646549671-000665d8d8bc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Aerial view of a residential roof for inspection',
  },
  heatpump: {
    url: '/assets/services/photos/heat-pump-upgrades.jpg',
    alt: 'Residential outdoor heat pump unit mounted beside a home',
  },
  insulation: {
    url: '/assets/services/photos/insulation-air-sealing.jpg',
    alt: 'Residential attic space with reflective insulation installed',
  },
  metalroofing: {
    url: 'https://images.unsplash.com/photo-1718948173667-fbd912b6d1fa?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'House with a standing seam metal roof',
  },
  rodent: {
    url: 'https://images.unsplash.com/photo-1694248581706-a645f65a2f27?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Close-up of rooftop solar panels protected from pest intrusion',
  },
  shingles: {
    url: 'https://images.unsplash.com/photo-1762726012995-81c2f26e6a4b?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Close-up of weathered roof shingles and eaves',
  },
  solarbattery: {
    url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
    alt: 'Solar array installation under a bright sky',
  },
  stormdamage: {
    url: 'https://images.unsplash.com/photo-1767385945380-37deed400d81?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Storm-damaged structure with torn metal roofing',
  },
  windows: {
    url: '/assets/services/photos/window-replacement-flyer.jpg',
    alt: 'Crew installing new residential windows on a house exterior',
  },
}

const iconKeywordMap = [
  [AirConditioner, ['duct', 'heat pump']],
  [AreaSearch, ['audit']],
  [BatteryCharging, ['battery', 'solar']],
  [Car, ['charger', 'ev']],
  [Flash, ['incentive', 'rebate', 'electrical']],
  [
    HomeShield,
    ['insurance', 'roof', 'shingle', 'metal', 'commercial', 'insulation', 'air sealing', 'warranty'],
  ],
  [Thunderstorm, ['hail', 'storm']],
  [WindowTabs, ['window']],
]

const matchIconByKeyword = (title) => {
  for (const [icon, keywords] of iconKeywordMap) {
    if (keywords.some((keyword) => title.includes(keyword))) {
      return icon
    }
  }
  return null
}

const getServiceIcon = (item) => {
  const namedIcon = resolveIconoirIcon(item.icon)
  if (namedIcon) {
    return namedIcon
  }

  const title =
    `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''} ${portableTextToPlainText(item.body || item.answer) || ''}`.toLowerCase()

  return matchIconByKeyword(title) || AreaSearch
}

const imageKeywordRules = [
  { key: 'audit', keywords: ['audit'] },
  { key: 'commercialroofing', keywords: ['commercial'] },
  { key: 'detachreset', keywords: ['detach', 'reset'] },
  { key: 'ducts', keywords: ['duct'] },
  { key: 'electrical', keywords: ['electrical'] },
  { key: 'evcharger', keywords: ['charger', 'car charger', 'ev'] },
  { key: 'hailinspection', keywords: ['hail', 'wind damage'] },
  { key: 'heatpump', keywords: ['heat pump'] },
  { key: 'insulation', keywords: ['insulation', 'air sealing'] },
  { key: 'metalroofing', keywords: ['metal'] },
  { key: 'rodent', keywords: ['rodent'] },
  { key: 'shingles', keywords: ['shingle'] },
  { key: 'solarbattery', keywords: ['battery', 'solar'] },
  { key: 'stormdamage', keywords: ['storm damage', 'restoration'] },
  { key: 'windows', keywords: ['window'] },
]

const matchImageByKeyword = (title) => {
  for (const rule of imageKeywordRules) {
    if (rule.keywords.some((keyword) => title.includes(keyword))) {
      return serviceImageMap[rule.key]
    }
  }
  return null
}

const resolveDirectImage = (item) => {
  if (item.imageAsset?.asset?._ref || item.imageAsset?.asset?.url) {
    return {
      url: getImageUrl(item.imageAsset, item.image),
      alt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
    }
  }
  if (item.imageUrl) {
    return {
      url: cleanRuntimeString(item.imageUrl),
      alt: cleanRuntimeString(item.imageAlt || item.alt || item.title || item.question),
    }
  }
  if (item.image) {
    return {
      url: getImageUrl(null, item.image),
      alt: getImageAlt(null, item.image, item.title || item.question),
    }
  }
  return null
}

const getServiceImage = (item) => {
  const direct = resolveDirectImage(item)
  if (direct) {
    return direct
  }

  if (item.icon && serviceImageMap[item.icon]) {
    return serviceImageMap[item.icon]
  }

  const title =
    `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''}`.toLowerCase()

  return (
    matchImageByKeyword(title) || {
      url: getImageUrl(item.imageAsset, item.image),
      alt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
    }
  )
}

const resolveCardColorHex = (item) => {
  const raw = item.cardColor?.hex || item.color?.hex || null
  if (!raw || typeof raw !== 'string') {
    return null
  }
  const hex = cleanRuntimeString(raw).trim()
  return hex.startsWith('#') ? hex : null
}

const formatServiceGridPrice = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) {
    return null
  }
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/*
 * Cards with no color set in Sanity fall back to the active theme's primary, so
 * the overlay follows whichever site theme is in scope instead of a hard-coded
 * teal. rgba() can't take a var(), so the translucent stop is mixed toward
 * transparent -- color-mix(in srgb, C x%, transparent) is C at x% alpha.
 */
const THEME_OVERLAY_COLOR = 'var(--color-primary)'

const fadeThemeColor = (percent) => `color-mix(in srgb, ${THEME_OVERLAY_COLOR} ${percent}, transparent)`

const buildCardOverlay = (hex, variant = 'large') => {
  if (!hex) {
    if (variant === 'large') {
      return `linear-gradient(to top, ${THEME_OVERLAY_COLOR} 50%, ${fadeThemeColor('8%')}, transparent)`
    }
    if (variant === 'medium') {
      return `linear-gradient(to top, ${THEME_OVERLAY_COLOR} 15%, ${fadeThemeColor('20%')}, transparent)`
    }
    return `linear-gradient(to top, ${THEME_OVERLAY_COLOR} 5%, ${fadeThemeColor('20%')}, transparent)`
  }
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  const c = `${r},${g},${b}`
  if (variant === 'large') {
    return `linear-gradient(to top, rgba(${c},1) 40%, rgba(${c},0.08), transparent)`
  }
  if (variant === 'medium') {
    return `linear-gradient(to top, rgba(${c},1) 35%, rgba(${c},0.20), transparent)`
  }
  return `linear-gradient(to top, rgba(${c},1) 15%, rgba(${c},0.20), transparent)`
}

const enrichItems = (rawItems) =>
  (rawItems || []).map((item) => {
    const serviceImage = getServiceImage(item)
    return {
      ...item,
      isRecommended: item.isRecommended || false,
      number: item.number ? Number.parseInt(item.number, 10) : null,
      price: item.price != null && Number.isFinite(Number(item.price)) ? Number(item.price) : null,
      copy: item.body || item.answer || null,
      imageUrl: serviceImage.url,
      imageAlt: serviceImage.alt,
      cardColorHex: resolveCardColorHex(item),
    }
  })

const ServiceMedia = ({ item, overlayStyle }) => {
  if (!item.imageUrl) {
    return <div className="service-grid__wash" style={overlayStyle} />
  }
  return (
    <>
      <Image
        width={2000}
        height={2000}
        src={item.imageUrl}
        alt={item.title}
        className="service-grid__image"
      />
      <div className="service-grid__wash" style={overlayStyle} />
    </>
  )
}

const ServiceCardLink = ({ item, children }) => {
  if (!item.href) {
    return <div className="service-grid__link-wrap">{children}</div>
  }
  return (
    <Link href={cleanRuntimeHref(item.href)} className="service-grid__link">
      {children}
    </Link>
  )
}

export const ServiceGridSection = ({ section, sectionId }) => {
  const items = enrichItems(section.items)
  const roofingItems = enrichItems(section.roofingItems)
  const secondaryItems = enrichItems(section.secondaryItems)

  return (
    <section
      className="service-grid section-shell section-shell--paper"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/service-grid-section.jsx',
        content: `service grid from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/service-grid-section.jsx"
        content={`service grid from ${section?._type || 'page section'}`}
      />
      <div className="section-shell__inner">
        <div className="section-shell__intro">
          {section.eyebrow ? (
            <Badge variant="outline" className="section-shell__badge">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="section-shell__title section-shell__title--after-badge text-fluid-500">
            {section.title}
          </h2>
          {section.subtitle ? (
            <PortableTextContent
              as="div"
              value={section.subtitle}
              className="section-shell__subtitle text-size-200"
            />
          ) : null}
          {section.body ? (
            <PortableTextContent
              as="div"
              value={section.body}
              className="section-shell__body text-size-100"
            />
          ) : null}
        </div>

        <ul className="service-grid__list">
          {items.map((item) => {
            const Icon = getServiceIcon(item)
            const card = (
              <Card className="service-grid__card">
                {item.isRecommended ? (
                  <div className="service-grid__flag">
                    <Badge variant="outline" className="service-grid__flag-badge">
                      <Star className="service-grid__flag-icon" />
                      Recommended
                    </Badge>
                  </div>
                ) : null}
                <div className="service-grid__media-frame">
                  <div className="service-grid__stack">
                    <ServiceMedia
                      item={item}
                      overlayStyle={{ background: buildCardOverlay(item.cardColorHex, 'large') }}
                    />
                  </div>
                  <div className="service-grid__ring" aria-hidden />
                </div>
                <div className="service-grid__copy">
                  {item.icon ? (
                    <div className="service-grid__glyph service-grid__glyph--icon">
                      <Icon className="service-grid__glyph-icon" strokeWidth={2} />
                    </div>
                  ) : null}
                  {item.number ? (
                    <div className="service-grid__glyph">
                      <div className="service-grid__number text-size-500">{item.number}</div>
                    </div>
                  ) : null}

                  {item.eyebrow ? (
                    <h3 className="service-grid__eyebrow text-size-90">{item.eyebrow}</h3>
                  ) : null}
                  <div className="service-grid__title text-size-400">{item.title}</div>
                  {item.price ? (
                    <div className="service-grid__price text-size-300">
                      {formatServiceGridPrice(item.price)}
                    </div>
                  ) : null}
                  <PortableTextContent
                    as="div"
                    value={item.copy}
                    className="service-grid__body text-size-90"
                  />
                </div>
              </Card>
            )
            return (
              <li
                className="service-grid__list-item"
                key={buildRuntimeKey('service-item', item.title, item.href)}
              >
                <ServiceCardLink item={item}>{card}</ServiceCardLink>
              </li>
            )
          })}
        </ul>

        {roofingItems.length ? (
          <div className="service-grid__group">
            {section.roofingTitle ? (
              <h3 className="service-grid__group-title text-size-200">{section.roofingTitle}</h3>
            ) : null}
            <div className="service-grid__subgrid">
              {roofingItems.map((item) => {
                const Icon = getServiceIcon(item)
                const card = (
                  <Card className="service-grid__mini" variant="media" radius="lg">
                    <ServiceMedia
                      item={item}
                      overlayStyle={{ background: buildCardOverlay(item.cardColorHex, 'medium') }}
                    />
                    <div className="service-grid__mini-copy">
                      <div className="service-grid__mini-glyph">
                        <Icon className="service-grid__mini-icon" strokeWidth={2.2} />
                      </div>
                      <div className="service-grid__mini-title text-size-200">{item.title}</div>
                      <PortableTextContent value={item.copy} className="service-grid__mini-body" />
                    </div>
                  </Card>
                )
                return (
                  <ServiceCardLink key={buildRuntimeKey('roofing-item', item.title, item.href)} item={item}>
                    {card}
                  </ServiceCardLink>
                )
              })}
            </div>
          </div>
        ) : null}

        {secondaryItems.length ? (
          <div className="service-grid__group">
            {section.secondaryTitle ? (
              <h3 className="service-grid__group-title text-size-200">{section.secondaryTitle}</h3>
            ) : null}
            <div className="service-grid__subgrid">
              {secondaryItems.map((item) => {
                const Icon = getServiceIcon(item)
                const card = (
                  <Card className="service-grid__mini service-grid__mini--square" variant="media" radius="lg">
                    <ServiceMedia
                      item={item}
                      overlayStyle={{ background: buildCardOverlay(item.cardColorHex, 'small') }}
                    />
                    <div className="service-grid__mini-copy">
                      <div className="service-grid__mini-glyph">
                        <Icon className="service-grid__mini-icon" strokeWidth={2.2} />
                      </div>
                      <div className="service-grid__mini-title text-size-200">{item.title}</div>
                      <PortableTextContent value={item.copy} className="service-grid__mini-body" />
                    </div>
                  </Card>
                )
                return (
                  <ServiceCardLink key={buildRuntimeKey('secondary-item', item.title, item.href)} item={item}>
                    {card}
                  </ServiceCardLink>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
