import Link from 'next/link'
import {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Flash,
  HomeShield,
  HomeSimple,
  Thunderstorm,
  WarningTriangle,
  WindowTabs,
  Wrench,
} from 'iconoir-react'

import Image from 'next/image'

import Footer from '@/components/Footer'
import GuideCardGrid from '@/components/GuideCardGrid'
import HailWeatherLookup from '@/components/HailWeatherLookup'
import Header from '@/components/Header'
import ConsultationSection from '@/components/ConsultationSection'
import LeadCaptureForm from '@/components/LeadCaptureForm'
import QuoteSection from '@/components/QuoteSection'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { isPrimarySiteSlug } from '@/lib/platform/content'
import { getImageAlt, getImageUrl, hasImageSource } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString, toRuntimeToken } from '@/lib/sanity/stega'

function slugifySectionToken(value) {
  return toRuntimeToken(value)
}

function getSectionDomId(section, index) {
  if (section?.anchor) return slugifySectionToken(section.anchor)
  if (section?.id) return slugifySectionToken(section.id)

  const token = slugifySectionToken(section?.title || section?.eyebrow || section?.question || '')
  return token ? `${section.type}-${token}` : `${section.type}-${index + 1}`
}

function HeroSection({ page, section, sectionId }) {
  const heroImageUrl = getImageUrl(section.heroAsset, section.heroImage)
  const hasHeroImage = hasImageSource(section.heroAsset, section.heroImage)
  const heroTitle = page?.pageType === 'post' ? page.title : section.title
  const heroTextColor = section.heroTextColor || (hasHeroImage ? '#ffffff' : '')
  const { overlayStyle } = getHeroOverlayAppearance(section)
  const heroMutedColor = heroTextColor ? hexToRgba(heroTextColor, 0.82) : undefined
  const heroTextStyle = heroTextColor ? { color: heroTextColor } : undefined
  const heroMutedStyle = heroMutedColor ? { color: heroMutedColor } : undefined
  const badgeStyle = heroTextColor
    ? {
        color: heroTextColor,
        borderColor: hexToRgba(heroTextColor, 0.24),
        backgroundColor: hexToRgba(heroTextColor, 0.08),
      }
    : undefined

  return (
    <section
      className="border-border/60 relative grid min-h-[60vh] place-content-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_52%),linear-gradient(180deg,var(--site-surface),rgba(255,255,255,0.92))] py-32"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:HeroSection',
        content: `page record from ${page?.source || 'fixture'} + hero section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:HeroSection"
        content={`page record from ${page?.source || 'fixture'} + hero section from ${section?._type || 'page section'}`}
      />
      {hasHeroImage ? (
        <>
          <div className="absolute inset-0 z-2">
            <Image
              width={2000}
              height={2000}
              alt={getImageAlt(section.heroAsset, section.heroImage, heroTitle)}
              className="h-full w-full object-cover"
              src={heroImageUrl}
            />
          </div>
          <div className="absolute inset-0 z-3" style={overlayStyle} />
        </>
      ) : null}
      {/* {!hasHeroImage && overlayStyle ? <div className="absolute inset-0" style={overlayStyle} /> : null} */}
      <div
        className={
          hasHeroImage
            ? 'relative z-10 mx-auto grid max-w-7xl place-content-center gap-10 px-6 py-24 lg:grid-cols-[1.35fr_0.95fr] lg:px-10'
            : 'max-w-8xl relative z-10 mx-auto grid place-content-center gap-10 px-6 py-24 lg:grid-cols-1 lg:px-10'
        }
      >
        <div className="space-y-6">
          <Badge
            variant="outline"
            className={
              heroTextColor
                ? 'border-transparent bg-transparent'
                : 'border-primary/20 bg-primary/5 text-foreground'
            }
            style={badgeStyle}
          >
            {section.eyebrow}
          </Badge>
          <div className="space-y-4">
            <h1
              className="text-foreground max-w-4xl text-4xl tracking-tight md:text-6xl"
              style={heroTextStyle}
            >
              {heroTitle}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-8" style={heroMutedStyle}>
              {section.body}
            </p>
          </div>
          {section.actions?.length ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {section.actions.map((action, index) => {
                const href = cleanRuntimeHref(action.href)

                if (!href) {
                  return null
                }

                return (
                  <Button
                    asChild
                    key={buildRuntimeKey('hero-action', action.href, action.label, index)}
                    variant={action.variant || 'default'}
                    size="lg"
                  >
                    <Link href={href}>{action.label}</Link>
                  </Button>
                )
              })}
            </div>
          ) : null}
        </div>
        {hasHeroImage ? (
          <div className="grid grid-cols-1 content-center space-y-4">
            <Card
              className={
                hasHeroImage
                  ? 'shadow-theme-glass gap-0 border-white/15 bg-white/8 backdrop-blur'
                  : 'shadow-theme-glass-soft border-border/70 bg-background/10 gap-0 backdrop-blur'
              }
            >
              <CardHeader className="pb-4">
                <CardTitle
                  className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase"
                  style={heroMutedStyle}
                >
                  Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {section.metrics?.map((metric) => (
                  <div
                    className={
                      hasHeroImage
                        ? 'rounded-xl border border-white/15 bg-white/8 px-4 py-4'
                        : 'border-border/70 bg-card/90 rounded-xl border px-4 py-4'
                    }
                    key={buildRuntimeKey('hero-metric', metric.label, metric.value)}
                  >
                    <div
                      className="text-muted-foreground text-sm tracking-[0.18em] uppercase"
                      style={heroMutedStyle}
                    >
                      {metric.label}
                    </div>
                    <div
                      className="text-foreground text-lg font-semibold tracking-tight"
                      style={heroTextStyle}
                    >
                      {metric.value}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function StorySection({ section, sectionId }) {
  return (
    <section
      className="border-border/60 bg-background border-b"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:StorySection',
        content: `story section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:StorySection"
        content={`story section from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 place-items-start px-6 py-24 lg:px-10">
        <Badge variant="outline" className="border-secondary/20 bg-secondary text-foreground">
          {section.eyebrow}
        </Badge>
        <h2 className="font-display text-foreground mt-6 w-full max-w-5xl text-3xl tracking-tight md:text-6xl">
          {section.title}
        </h2>
        <p className="text-muted-foreground mt-6 max-w-5xl text-lg leading-8">{section.body}</p>
      </div>
    </section>
  )
}

function CardGridSection({ section, sectionId }) {
  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,242,0.96))]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:CardGridSection',
        content: `highlight cards from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:CardGridSection"
        content={`highlight cards from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-8 max-w-3xl grid gap-2">
          <h2 className="text-foreground text-3xl md:text-4xl">{section.title}</h2>
          <p className="text-foreground text-lg leading-8 mb-4">{section.subtitle}</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {section.items?.map((item, index) => (
            <Card
              key={buildRuntimeKey('card-grid-item', item.title, item.question, index)}
              className="grid grid-cols-1 place-content-start"
            >
              <CardHeader>
                <CardTitle className="text-foreground text-xl">{item.title || item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-md leading-6">
                {item.body || item.answer}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function GuideGridSection({ section, sectionId }) {
  const palette = [
    'bg-primary text-white',
    'bg-tertiary text-white',
    'bg-blue-400 text-white',
    'bg-[var(--color-tertiary-alt)] text-foreground',
    'bg-blue-200 text-foreground',
    'bg-[var(--color-secondary-alt)] text-white',
  ]

  const cards = (section.items || []).slice(0, 6).map((item, index) => ({
    number: item.number || String(index + 1).padStart(2, '0'),
    title: item.title || item.question,
    copy: item.body || item.answer,
    href: item.href,
    image: getImageUrl(item.imageAsset, item.image),
    imageAlt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
  }))

  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-size-[24px_24px]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:GuideGridSection',
        content: `guide grid from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:GuideGridSection"
        content={`guide grid from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-foreground text-3xl md:text-4xl">{section.title}</h2>
        </div>
        <GuideCardGrid
          cards={cards}
          columnsClassName="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          palette={palette}
        />
      </div>
    </section>
  )
}

const serviceIconMap = {
  audit: AreaSearch,
  insulation: HomeShield,
  ducts: AirConditioner,
  windows: WindowTabs,
  heatpump: AirConditioner,
  solarbattery: BatteryCharging,
  detachreset: Wrench,
  shingles: HomeSimple,
  metalroofing: HomeShield,
  stormdamage: Thunderstorm,
  commercialroofing: Wrench,
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
  if (item.icon && serviceIconMap[item.icon]) {
    return serviceIconMap[item.icon]
  }

  const title = `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''}`.toLowerCase()

  if (title.includes('audit')) return AreaSearch
  if (title.includes('insulation') || title.includes('air sealing')) return HomeShield
  if (title.includes('duct')) return AirConditioner
  if (title.includes('window')) return WindowTabs
  if (title.includes('heat pump')) return AirConditioner
  if (title.includes('battery') || title.includes('solar')) return BatteryCharging

  return HomeSimple
}

function getServiceImage(item) {
  if (item.imageAsset?.asset?._ref) {
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

  if (item.icon && serviceImageMap[item.icon]) {
    return serviceImageMap[item.icon]
  }

  const title = `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''}`.toLowerCase()

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

function ServiceGridSection({ section, sectionId }) {
  const items = (section.items || []).map((item) => {
    const serviceImage = getServiceImage(item)

    return {
      ...item,
      copy: item.body || item.answer || '',
      imageUrl: serviceImage.url,
      imageAlt: serviceImage.alt,
    }
  })

  const roofingItems = (section.roofingItems || []).map((item) => {
    const serviceImage = getServiceImage(item)

    return {
      ...item,
      copy: item.body || item.answer || '',
      imageUrl: serviceImage.url,
      imageAlt: serviceImage.alt,
    }
  })
  const secondaryItems = (section.secondaryItems || []).map((item) => {
    const serviceImage = getServiceImage(item)

    return {
      ...item,
      copy: item.body || item.answer || '',
      imageUrl: serviceImage.url,
      imageAlt: serviceImage.alt,
    }
  })

  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.96))]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:ServiceGridSection',
        content: `service grid from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:ServiceGridSection"
        content={`service grid from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          {section.eyebrow ? (
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-foreground">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="text-foreground mt-5 text-3xl tracking-tight md:text-4xl">{section.title}</h2>
          {section.subtitle ? (
            <p className="text-foreground/80 mt-4 text-lg leading-8">{section.subtitle}</p>
          ) : null}
          {section.body ? (
            <p className="text-muted-foreground mt-4 text-base leading-8">{section.body}</p>
          ) : null}
        </div>
        <div className="grid gap-6 max-[900px]:grid-cols-1 md:grid-cols-3">
          {items.map((item) => {
            const Icon = getServiceIcon(item)
            const content = (
              <Card className="relative aspect-square" variant="media" radius="lg">
                <Image
                  width={2000}
                  height={2000}
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,59,66,0.9),rgba(11,59,66,0.2),transparent)]"></div>
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div className="type-accent text-[1.875rem] leading-[1.1] font-bold">{item.title}</div>
                  <div className="text-md mt-1 font-semibold text-white/70">{item.copy}</div>
                </div>
              </Card>
            )

            if (!item.href) {
              return <div key={buildRuntimeKey('service-item', item.title, item.href)}>{content}</div>
            }

            return (
              <Link
                key={buildRuntimeKey('service-item', item.title, item.href)}
                href={cleanRuntimeHref(item.href)}
              >
                {content}
              </Link>
            )
          })}
        </div>
        {roofingItems.length ? (
          <div className="border-border/60 mt-8 border-t pt-8">
            {section.roofingTitle ? (
              <h3 className="text-foreground mb-4 text-lg">{section.roofingTitle}</h3>
            ) : null}
            <div className="grid gap-4 max-[900px]:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {roofingItems.map((item) => {
                const Icon = getServiceIcon(item)
                const content = (
                  <Card className="relative aspect-4/5 overflow-hidden" variant="media" radius="lg">
                    <Image
                      width={2000}
                      height={2000}
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,59,66,1)_20%,rgba(11,59,66,0.4),transparent)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="type-accent text-[1.375rem] leading-[1.05] font-bold">{item.title}</div>
                      <p className="text-md mt-2 leading-6 text-white/82">{item.copy}</p>
                    </div>
                  </Card>
                )

                if (!item.href) {
                  return <div key={buildRuntimeKey('roofing-item', item.title, item.href)}>{content}</div>
                }

                return (
                  <Link
                    key={buildRuntimeKey('roofing-item', item.title, item.href)}
                    href={cleanRuntimeHref(item.href)}
                  >
                    {content}
                  </Link>
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
                const content = (
                  <Card className="relative aspect-square overflow-hidden" variant="media" radius="lg">
                    <Image
                      width={2000}
                      height={2000}
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,59,66,1)_20%,rgba(11,59,66,0.4),transparent)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="type-accent text-[1.375rem] leading-[1.05] font-bold">{item.title}</div>
                      <p className="text-md mt-2 leading-6 text-white/82">{item.copy}</p>
                    </div>
                  </Card>
                )

                if (!item.href) {
                  return <div key={buildRuntimeKey('secondary-item', item.title, item.href)}>{content}</div>
                }

                return (
                  <Link
                    key={buildRuntimeKey('secondary-item', item.title, item.href)}
                    href={cleanRuntimeHref(item.href)}
                  >
                    {content}
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function StepsSection({ section, sectionId }) {
  return (
    <section
      className="radial-grid-bg bg-secondary-100 border-border/60 border-b"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:StepsSection',
        content: `steps section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:StepsSection"
        content={`steps section from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-foreground text-3xl tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {section.items?.map((item, index) => (
            <Card key={buildRuntimeKey('step-item', item.title, index)} className="border-border/80 bg-card">
              <CardHeader className="gap-4">
                <Badge className="bg-secondary/90 text-secondary-foreground w-fit rounded-full px-3 py-1">
                  Step {index + 1}
                </Badge>
                <CardTitle className="text-foreground text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-md leading-6">{item.body}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({ section, sectionId }) {
  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,0.98))]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:FaqSection',
        content: `faq section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:FaqSection"
        content={`faq section from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-foreground text-3xl tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="space-y-4">
          {section.items?.map((item, index) => (
            <Card key={buildRuntimeKey('faq-item', item.question, index)} className="border-border/80 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground text-xl">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-md leading-6">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HailMapSection({ section, sectionId }) {
  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,239,0.98))]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:HailMapSection',
        content: `hail lookup section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:HailMapSection"
        content={`hail lookup section from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <HailWeatherLookup section={section} />
      </div>
    </section>
  )
}

function QuoteBannerSection({ section, sectionId }) {
  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(247,244,239,0.98),rgba(255,255,255,0.98))]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:QuoteBannerSection',
        content: `quote section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:QuoteBannerSection"
        content={`quote section from ${section?._type || 'page section'}`}
      />
      <QuoteSection
        variant="primary"
        eyebrow={section.eyebrow || 'KEY MESSAGE'}
        quoteText={section.body || section.title || ''}
        attribution={section.title || 'Texas Solar and Roofing Pros'}
        sectionId={`${sectionId}-content`}
      />
    </section>
  )
}

function CtaSection({ page, section, site, pathname, sectionId }) {
  return (
    <>
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:CtaSection"
        content={`shared consultation section fallback for page from ${page?.source || 'fixture'}`}
      />
      <ConsultationSection site={site} sectionId={sectionId} />
    </>
  )
}

function CtaBannerSection({ page, section, site, sectionId }) {
  const slug = cleanRuntimeString(page?.slug)
  const leadContext = {
    sourceType: 'cross-lead',
    sourceSection: 'cta-banner',
    serviceInterest: 'roofing',
    siteSlug: site?.slug || 'texas-solar-and-roofing-pros',
    siteName: site?.name || 'Texas Solar and Roofing Pros',
    sourceDomain: site?.primaryDomain || 'texassolarandroofingpros.com',
    pagePath: slug ? `/${slug}` : '/',
    pageTitle: page?.title || section?.title || 'Guide CTA',
    metadata: {
      entryPoint: 'guide-cta-banner',
    },
  }

  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))] py-20 text-white"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:CtaBannerSection',
        content: `cross-lead banner from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:CtaBannerSection"
        content={`cross-lead banner from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="space-y-4">
          {section.eyebrow ? (
            <p className="text-md tracking-[0.22em] text-white/58 uppercase">{section.eyebrow}</p>
          ) : null}
          <h2 className="max-w-3xl text-3xl tracking-tight md:text-4xl">{section.title}</h2>
          <p className="max-w-2xl text-base leading-8 text-white/78">{section.body}</p>
        </div>
        <Card className="gap-0 border-white/12 bg-white/6 text-white backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">Get matched with a roofing pro</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadCaptureForm
              context={leadContext}
              compact
              buttonLabel={section.ctaLabel || 'Request a roofing intro'}
              className="grid gap-4"
              inputClassName="rounded-md border border-white/16 bg-white/6 px-3 py-2 text-white placeholder:text-white/48"
              labelClassName="text-white/70"
              checkboxClassName="accent-white"
              messageClassName="text-left"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

const sectionRenderers = {
  hero: HeroSection,
  story: StorySection,
  quote: QuoteBannerSection,
  highlights: CardGridSection,
  guideGrid: GuideGridSection,
  serviceGrid: ServiceGridSection,
  faq: FaqSection,
  hailMap: HailMapSection,
  steps: StepsSection,
  cta: CtaSection,
  ctaBanner: CtaBannerSection,
}

export default function PublicSite({ site, page, pathname, navigation, jsonLd }) {
  const useSolarShell = isPrimarySiteSlug(site.slug)
  const sections = page.sections || []
  const hasLeadCaptureSection = sections.some((section) => section.type === 'cta')
  const style = {
    '--site-primary': site.brand?.primary || 'var(--color-primary)',
    '--site-secondary': site.brand?.secondary || 'var(--color-secondary)',
    '--site-accent': site.brand?.accent || 'var(--color-secondary-500)',
    '--site-surface': site.brand?.surface || 'var(--color-warm-bg)',
  }

  return (
    <div
      className="bg-background text-foreground min-h-screen"
      {...getDevSectionAttributes({
        id: 'public-site-root',
        markup: 'src/components/platform/PublicSite.jsx',
        content: `page "${page.title}" from ${page.source || 'fixture'}`,
        note: `route ${pathname || '/'} using ${useSolarShell ? 'solar shell' : 'generic shell'}`,
      })}
      style={{
        ...style,
        backgroundColor: 'var(--site-surface)',
      }}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx"
        content={`page "${page.title}" from ${page.source || 'fixture'}`}
        note={`route ${pathname || '/'} using ${useSolarShell ? 'solar shell' : 'generic shell'}`}
      />
      {useSolarShell ? (
        <Header />
      ) : (
        <header
          className="border-border/60 bg-background/90 sticky top-0 z-40 border-b backdrop-blur"
          {...getDevSectionAttributes({
            id: 'site-header',
            markup: 'src/components/platform/PublicSite.jsx:GenericHeader',
            content: 'generic public-site shell header',
          })}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
            <Link href="/" className="flex min-w-0 flex-col">
              <span className="text-muted-foreground text-md tracking-[0.22em] uppercase">
                {site.brand?.eyebrow}
              </span>
              <span className="text-foreground text-xl font-semibold tracking-tight">{site.name}</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {navigation.map((item, index) => (
                <Link
                  key={buildRuntimeKey('site-nav-item', item.href, item.label, index)}
                  className="text-muted-foreground hover:text-foreground text-md font-medium transition-colors"
                  href={cleanRuntimeHref(item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Button asChild>
              <Link href="/dashboard">Ops dashboard</Link>
            </Button>
          </div>
        </header>
      )}

      <main
        {...getDevSectionAttributes({
          id: 'public-site-main',
          markup: 'src/components/platform/PublicSite.jsx',
          content: `rendered sections for "${page.title}"`,
        })}
      >
        {sections.map((section, index) => {
          const Component = sectionRenderers[section.type]

          if (!Component) {
            return null
          }

          const sectionId = getSectionDomId(section, index)

          return (
            <Component
              key={buildRuntimeKey('page-section', section._key, section.type, sectionId, index)}
              page={page}
              section={section}
              site={site}
              pathname={pathname}
              sectionId={sectionId}
            />
          )
        })}

        {!hasLeadCaptureSection ? (
          <CtaSection page={page} section={null} site={site} pathname={pathname} sectionId="cta-contact" />
        ) : null}
      </main>

      {useSolarShell ? (
        <Footer />
      ) : (
        <footer
          className="border-border/60 bg-background border-t"
          {...getDevSectionAttributes({
            id: 'site-footer',
            markup: 'src/components/platform/PublicSite.jsx:GenericFooter',
            content: 'generic public-site shell footer',
          })}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">{site.categoryLabel}</p>
              <h2 className="text-foreground text-2xl tracking-tight">{site.name}</h2>
              <p className="text-muted-foreground text-md max-w-2xl leading-6">{site.seo?.description}</p>
            </div>
            <div className="text-muted-foreground text-md space-y-2">
              <div>{site.organization?.phone}</div>
              <div>{site.organization?.email}</div>
              <div>{site.organization?.serviceArea?.join(' · ')}</div>
            </div>
          </div>
        </footer>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </div>
  )
}
