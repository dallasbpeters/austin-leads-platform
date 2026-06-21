import {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Flash,
  HomeShield,
  Star,
  Thunderstorm,
  WarningTriangle,
  WindowTabs,
  Wrench,
} from 'iconoir-react'
import * as IconoirIcons from 'iconoir-react'
import Image from 'next/image'
import Link from 'next/link'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'

const serviceIconMap = {
  audit: AreaSearch,
  insulation: HomeShield,
  ducts: AirConditioner,
  windows: WindowTabs,
  heatpump: AirConditioner,
  solarbattery: BatteryCharging,
  detachreset: Wrench,
  shingles: HomeShield,
  metalroofing: HomeShield,
  stormdamage: Thunderstorm,
  commercialroofing: HomeShield,
  hailinspection: AreaSearch,
  rodent: WarningTriangle,
  electrical: Flash,
  evcharger: Car,
}

const serviceImageMap = {
  audit: {
    url: '/assets/services/photos/energy-audits.jpg',
    alt: 'Thermostat control being adjusted during a home energy audit',
  },
  insulation: {
    url: '/assets/services/photos/insulation-air-sealing.jpg',
    alt: 'Residential attic space with reflective insulation installed',
  },
  ducts: {
    url: '/assets/services/photos/duct-sealing.jpg',
    alt: 'Architectural vent detail representing HVAC airflow and duct performance',
  },
  windows: {
    url: '/assets/services/photos/window-replacement-flyer.jpg',
    alt: 'Crew installing new residential windows on a house exterior',
  },
  heatpump: {
    url: '/assets/services/photos/heat-pump-upgrades.jpg',
    alt: 'Residential outdoor heat pump unit mounted beside a home',
  },
  solarbattery: {
    url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
    alt: 'Solar array installation under a bright sky',
  },
  detachreset: {
    url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
    alt: 'Solar array on a residential roof ready for coordinated detach and reset work',
  },
  shingles: {
    url: 'https://images.unsplash.com/photo-1762726012995-81c2f26e6a4b?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Close-up of weathered roof shingles and eaves',
  },
  metalroofing: {
    url: 'https://images.unsplash.com/photo-1718948173667-fbd912b6d1fa?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'House with a standing seam metal roof',
  },
  stormdamage: {
    url: 'https://images.unsplash.com/photo-1767385945380-37deed400d81?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Storm-damaged structure with torn metal roofing',
  },
  commercialroofing: {
    url: 'https://images.unsplash.com/photo-1737256359080-9354dbcc21ef?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Large commercial building roof under clear sky',
  },
  hailinspection: {
    url: 'https://images.unsplash.com/photo-1656646549671-000665d8d8bc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Aerial view of a residential roof for inspection',
  },
  rodent: {
    url: 'https://images.unsplash.com/photo-1694248581706-a645f65a2f27?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Close-up of rooftop solar panels protected from pest intrusion',
  },
  electrical: {
    url: 'https://images.unsplash.com/photo-1759692071712-adc78a8516c8?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Electrical panel and power equipment',
  },
  evcharger: {
    url: 'https://images.unsplash.com/photo-1724963914478-77af9eba1c50?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
    alt: 'Electric vehicle plugged into a home charger',
  },
}

function getServiceIcon(item) {
  if (item.icon && serviceIconMap[item.icon]) return serviceIconMap[item.icon]
  if (item.icon && IconoirIcons[item.icon]) return IconoirIcons[item.icon]

  const title =
    `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''} ${portableTextToPlainText(item.body || item.answer) || ''}`.toLowerCase()

  if (title.includes('audit')) return AreaSearch
  if (title.includes('hail')) return Thunderstorm
  if (title.includes('storm')) return Thunderstorm
  if (title.includes('insurance')) return HomeShield
  if (title.includes('roof')) return HomeShield
  if (title.includes('shingle')) return HomeShield
  if (title.includes('metal')) return HomeShield
  if (title.includes('commercial')) return HomeShield
  if (title.includes('insulation') || title.includes('air sealing')) return HomeShield
  if (title.includes('duct')) return AirConditioner
  if (title.includes('window')) return WindowTabs
  if (title.includes('heat pump')) return AirConditioner
  if (title.includes('warranty')) return HomeShield
  if (title.includes('incentive') || title.includes('rebate')) return Flash
  if (title.includes('electrical')) return Flash
  if (title.includes('charger') || title.includes('ev')) return Car
  if (title.includes('battery') || title.includes('solar')) return BatteryCharging
  return AreaSearch
}

function getServiceImage(item) {
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
  if (item.icon && serviceImageMap[item.icon]) return serviceImageMap[item.icon]

  const title =
    `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''}`.toLowerCase()
  if (title.includes('audit')) return serviceImageMap.audit
  if (title.includes('insulation') || title.includes('air sealing')) return serviceImageMap.insulation
  if (title.includes('duct')) return serviceImageMap.ducts
  if (title.includes('window')) return serviceImageMap.windows
  if (title.includes('heat pump')) return serviceImageMap.heatpump
  if (title.includes('detach') || title.includes('reset')) return serviceImageMap.detachreset
  if (title.includes('battery') || title.includes('solar')) return serviceImageMap.solarbattery
  if (title.includes('shingle')) return serviceImageMap.shingles
  if (title.includes('metal')) return serviceImageMap.metalroofing
  if (title.includes('storm damage') || title.includes('restoration')) return serviceImageMap.stormdamage
  if (title.includes('commercial')) return serviceImageMap.commercialroofing
  if (title.includes('hail') || title.includes('wind damage')) return serviceImageMap.hailinspection
  if (title.includes('rodent')) return serviceImageMap.rodent
  if (title.includes('electrical')) return serviceImageMap.electrical
  if (title.includes('charger') || title.includes('car charger') || title.includes('ev'))
    return serviceImageMap.evcharger
  return {
    url: getImageUrl(item.imageAsset, item.image),
    alt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
  }
}

function resolveCardColorHex(item) {
  const raw = item.cardColor?.hex || item.color?.hex || null
  if (!raw || typeof raw !== 'string') return null
  const hex = cleanRuntimeString(raw).trim()
  return hex.startsWith('#') ? hex : null
}

const formatServiceGridPrice = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function buildCardOverlay(hex, variant = 'large') {
  if (!hex) {
    const fallback = '11,59,66'
    if (variant === 'large')
      return `linear-gradient(to top, rgba(${fallback},0.7) 50%, rgba(${fallback},0.08), transparent)`
    if (variant === 'medium')
      return `linear-gradient(to top, rgba(${fallback},0.70) 15%, rgba(${fallback},0.20), transparent)`
    return `linear-gradient(to top, rgba(${fallback},0.65) 5%, rgba(${fallback},0.20), transparent)`
  }
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const c = `${r},${g},${b}`
  if (variant === 'large') return `linear-gradient(to top, rgba(${c},0.95) 20%, rgba(${c},0.08), transparent)`
  if (variant === 'medium')
    return `linear-gradient(to top, rgba(${c},0.70) 15%, rgba(${c},0.20), transparent)`
  return `linear-gradient(to top, rgba(${c},0.65) 5%, rgba(${c},0.20), transparent)`
}

function enrichItems(rawItems) {
  return (rawItems || []).map((item) => {
    const serviceImage = getServiceImage(item)
    return {
      ...item,
      isRecommended: item.isRecommended || false,
      number: item.number ? parseInt(item.number) : null,
      price: item.price != null && Number.isFinite(Number(item.price)) ? Number(item.price) : null,
      copy: item.body || item.answer || null,
      imageUrl: serviceImage.url,
      imageAlt: serviceImage.alt,
      cardColorHex: resolveCardColorHex(item),
    }
  })
}

function ServiceMedia({ item, overlayStyle }) {
  if (!item.imageUrl) return <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
  return (
    <>
      <Image
        width={2000}
        height={2000}
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
    </>
  )
}

function ServiceCardLink({ item, children }) {
  if (!item.href) return <div className="service-grid-card-border-wrap block w-full">{children}</div>
  return (
    <Link
      href={cleanRuntimeHref(item.href)}
      className="service-grid-card-link block w-full rounded-2xl focus-visible:outline-none"
    >
      {children}
    </Link>
  )
}

export function ServiceGridSection({ section, sectionId }) {
  const items = enrichItems(section.items)
  const roofingItems = enrichItems(section.roofingItems)
  const secondaryItems = enrichItems(section.secondaryItems)

  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.96))]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/ServiceGridSection.jsx',
        content: `service grid from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/ServiceGridSection.jsx"
        content={`service grid from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-3 py-20 md:px-6 lg:px-10">
        <div className="mb-10 max-w-3xl">
          {section.eyebrow ? (
            <Badge variant="outline" className="text-primary border-primary">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="text-foreground mt-5 text-3xl tracking-normal md:text-4xl">{section.title}</h2>
          {section.subtitle ? (
            <PortableTextContent
              as="div"
              value={section.subtitle}
              className="text-foreground/80 mt-4 text-lg leading-8"
            />
          ) : null}
          {section.body ? (
            <PortableTextContent
              as="div"
              value={section.body}
              className="text-muted-foreground mt-4 text-base leading-8"
            />
          ) : null}
        </div>

        <ul className="grid gap-6 max-[900px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = getServiceIcon(item)
            const card = (
              <Card className="service-grid-card-border group relative aspect-4/4 overflow-hidden rounded-2xl border-0 bg-transparent shadow-none contain-none">
                {item.isRecommended ? (
                  <div className="absolute top-3 right-5 z-10">
                    <Badge variant="outline" className="border-secondary bg-secondary text-white">
                      <Star className="h-4 w-4" />
                      Recommended
                    </Badge>
                  </div>
                ) : null}
                <div className="service-grid-card-media-frame">
                  <div className="service-grid-card-stack">
                    <ServiceMedia
                      item={item}
                      overlayStyle={{ background: buildCardOverlay(item.cardColorHex, 'large') }}
                    />
                  </div>
                  <div className="service-grid-card-ring" aria-hidden />
                </div>
                <div className="service-grid-card-copy rounded-[inherit] p-4 text-white">
                  {item.icon ? (
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Icon className="h-8 w-8" strokeWidth={2} />
                    </div>
                  ) : null}
                  {item.number ? (
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <div className="type-accent font-mono text-[2.5rem] leading-[1.1] font-bold">
                        {item.number}
                      </div>
                    </div>
                  ) : null}

                  <h3 className="font-mono text-sm leading-[1.1] font-bold uppercase">{item.eyebrow}</h3>
                  <div className="type-accent mb-3 text-[1.975rem] leading-[1.1] font-bold">{item.title}</div>
                  {item.price != null ? (
                    <div className="mb-3 text-[1.575rem] leading-[1.1] font-bold">
                      {formatServiceGridPrice(item.price)}
                    </div>
                  ) : null}
                  <PortableTextContent
                    as="div"
                    value={item.copy}
                    className="mt-1 text-sm font-normal text-white"
                  />
                </div>
              </Card>
            )
            return (
              <ServiceCardLink key={buildRuntimeKey('service-item', item.title, item.href)} item={item}>
                {card}
              </ServiceCardLink>
            )
          })}
        </ul>

        {roofingItems.length ? (
          <div className="border-border/60 mt-8 border-t pt-8">
            {section.roofingTitle ? (
              <h3 className="text-foreground mb-4 text-lg">{section.roofingTitle}</h3>
            ) : null}
            <div className="grid gap-4 max-[900px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {roofingItems.map((item) => {
                const Icon = getServiceIcon(item)
                const card = (
                  <Card className="group relative aspect-4/5 overflow-hidden" variant="media" radius="lg">
                    <ServiceMedia
                      item={item}
                      overlayStyle={{ background: buildCardOverlay(item.cardColorHex, 'medium') }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="type-accent text-[1.375rem] leading-[1.05] font-bold">{item.title}</div>
                      <PortableTextContent
                        value={item.copy}
                        className="text-md mt-2 leading-6 text-white/82"
                      />
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
          <div className="border-border/60 mt-8 border-t pt-8">
            {section.secondaryTitle ? (
              <h3 className="text-foreground mb-4 text-lg">{section.secondaryTitle}</h3>
            ) : null}
            <div className="grid gap-4 max-[900px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {secondaryItems.map((item) => {
                const Icon = getServiceIcon(item)
                const card = (
                  <Card className="group relative aspect-square overflow-hidden" variant="media" radius="lg">
                    <ServiceMedia
                      item={item}
                      overlayStyle={{ background: buildCardOverlay(item.cardColorHex, 'small') }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="type-accent text-[1.375rem] leading-[1.05] font-bold">{item.title}</div>
                      <PortableTextContent
                        value={item.copy}
                        className="text-md mt-2 leading-6 text-white/82"
                      />
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
