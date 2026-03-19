import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  AirConditioner,
  AreaSearch,
  FastArrowRight,
  BatteryCharging,
  Car,
  Flash,
  HomeShield,
  Thunderstorm,
  WarningTriangle,
  WindowTabs,
  Wrench,
} from 'iconoir-react'
import * as IconoirIcons from 'iconoir-react'

import Image from 'next/image'

import Footer from '@/components/Footer'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import Band from '@/components/Band'
import GuideCardGrid from '@/components/GuideCard'
import GuidesSection from '@/components/GuidesSection'
import Header from '@/components/Header'
import ConsultationSection from '@/components/ConsultationSection'
import LeadCaptureForm from '@/components/LeadCaptureForm'
import GuideShareBar from '@/components/GuideShareBar'
import PortableTextContent from '@/components/PortableTextContent'
import QuoteSection from '@/components/QuoteSection'
import SolarSwitch from '@/components/SolarSwitch'
import ScrollText from '@/components/ScrollText'
import LogoCloud from '@/components/logo-cloud'

const EnergyChartSection = dynamic(() => import('@/components/EnergyChartSection'), { ssr: true })
const CalculatorSection = dynamic(() => import('@/components/CalculatorSection'), { ssr: true })
const CostsSection = dynamic(() => import('@/components/CostsSection'), { ssr: true })
const IncentivesSection = dynamic(() => import('@/components/IncentivesSection'), { ssr: true })
const ResourcesSection = dynamic(() => import('@/components/ResourcesSection'), { ssr: true })
const SnapshotSection = dynamic(() => import('@/components/SnapshotSection'), { ssr: true })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: true })
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { getGuideMetaByHref } from '@/lib/platform/guides'
import { isPrimarySiteSlug } from '@/lib/platform/content'
import { getHeroImageUrl, getImageAlt, getImageUrl, hasImageSource } from '@/lib/platform/imageSource'
import { getSanityPageEditAttributes, getSanitySectionEditAttributes } from '@/lib/sanity/visualEditing'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString, toRuntimeToken } from '@/lib/sanity/stega'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { roofingServices } from '@/lib/platform/service-catalog'

const CONSULTATION_ANCHOR_ID = 'consultation'

function slugifySectionToken(value) {
  return toRuntimeToken(value)
}

function getSectionDomId(section, index) {
  if (section?.anchor) return slugifySectionToken(section.anchor)
  if (section?.id) return slugifySectionToken(section.id)

  const token = slugifySectionToken(section?.title || section?.eyebrow || section?.question || '')
  return token ? `${section.type}-${token}` : `${section.type}-${index + 1}`
}

function HeroSection({ page, section, sectionId, editAttributes = {} }) {
  const heroImageUrl = getHeroImageUrl(section.heroAsset, section.heroImage)
  const hasHeroImage = hasImageSource(section.heroAsset, section.heroImage)
  const heroTitle = cleanRuntimeString(section?.title) || cleanRuntimeString(page?.title)
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
      className="grid relative min-h-[60vh] py-12 lg:py-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_52%),linear-gradient(180deg,var(--site-surface),rgba(255,255,255,0.92))] border-border/60 overflow-hidden place-content-center"
      {...editAttributes}
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
              width={1920}
              height={1080}
              quality={75}
              sizes="100vw"
              priority
              fetchPriority="high"
              alt={getImageAlt(section.heroAsset, section.heroImage, heroTitle)}
              className="h-full w-full object-cover"
              src={heroImageUrl}
            />
          </div>
          <div className="absolute inset-0 z-3" style={overlayStyle} />
        </>
      ) : null}
      {!hasHeroImage && overlayStyle ? <div className="absolute inset-0" style={overlayStyle} /> : null}
      <div
        className={
          hasHeroImage
            ? "grid relative max-w-7xl gap-10 mx-auto px-3 md:px-6 py-14 lg:px-10 place-content-center z-10 lg:grid-cols-[1.35fr_0.95fr]"
            : "grid relative max-w-7xl gap-10 mx-auto px-3 md:px-6 py-14 lg:px-10 place-content-center z-10 lg:grid-cols-1"
        }
      >
        <div className="space-y-6">
          <Badge
            variant="outline"
            className={
              heroTextColor
                ? "bg-transparent border-transparent"
                : "text-foreground bg-primary/5 border-primary/20"
            }
            style={badgeStyle}
          >
            {section.eyebrow}
          </Badge>
          <div className="space-y-4">
            <h1
              className="max-w-4xl text-4xl text-foreground tracking-tight md:text-6xl"
              style={heroTextStyle}
            >
              {heroTitle}
            </h1>
            <PortableTextContent
              as="div"
              value={section.body}
              className="max-w-2xl leading-8 text-lg text-muted-foreground"
              style={heroMutedStyle}
            />
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
                    variant={action.variant || (index === 0 ? 'default' : 'tertiary')}
                    shape="pill"
                    size="lg"
                  >
                    <Link href={href}>{action.label}</Link>
                  </Button>
                )
              })}
            </div>
          ) : null}
        </div>
        {hasHeroImage && section.metrics?.length ? (
          <div className="grid content-center space-y-4 grid-cols-1">
            <Card
              className={
                hasHeroImage
                  ? "gap-0 bg-white/8 border-white/15 shadow-theme-glass backdrop-blur"
                  : "gap-0 bg-background/10 border-border/70 shadow-theme-glass-soft backdrop-blur"
              }
            >
              <CardHeader className="pb-4">
                <CardTitle
                  className="font-medium text-muted-foreground text-xs tracking-[0.2em] uppercase"
                  style={heroMutedStyle}
                >
                  Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 px-3">
                {section.metrics?.map((metric) => (
                  <div
                    className={
                      hasHeroImage
                        ? "px-4 py-4 bg-white/8 border border-white/15 rounded-xl"
                        : "px-4 py-4 bg-card/90 border border-border/70 rounded-xl"
                    }
                    key={buildRuntimeKey('hero-metric', metric.label, metric.value)}
                  >
                    <div
                      className="text-muted-foreground text-xs tracking-[0.18em] uppercase"
                      style={heroMutedStyle}
                    >
                      {metric.label}
                    </div>
                    <div
                      className="font-semibold text-foreground text-lg tracking-tight"
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

function StorySection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-background border-b border-border/60"
      {...editAttributes}
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
      <div className="grid max-w-7xl mx-auto px-3 md:px-6 py-24 lg:px-10 grid-cols-1 place-items-start">
        {section.eyebrow ? (
          <Badge variant="outline" className="text-foreground bg-secondary border-secondary/20">
            {section.eyebrow}
          </Badge>
        ) : null}
        <h2 className="max-w-5xl w-full mt-6 font-display text-3xl text-foreground tracking-tight md:text-4xl">
          {section.title}
        </h2>
        <PortableTextContent as="div" value={section.body} className="max-w-5xl mt-6 leading-8 text-lg text-muted-foreground" />
      </div>
    </section>
  )
}

function ScrollTextSection({ section, sectionId, editAttributes = {} }) {
  const textItems = Array.isArray(section?.text)
    ? section.text
    : (Array.isArray(section?.texts) ? section.texts : null)
  const hasTextItems = Array.isArray(textItems) && textItems.length > 0
  const shouldShowIcon = Boolean(section?.showIcon || section?.showFlag || section?.icon)
  const resolvedIcon = section?.showFlag ? 'TexasFlag' : section?.icon
  const scrollTexts = hasTextItems
    ? (shouldShowIcon && resolvedIcon
        ? textItems.map((text) => ({ text, icon: resolvedIcon }))
        : textItems)
    : undefined
  const numCopies = Number.isFinite(section?.numCopies) ? section.numCopies : undefined
  const velocity = Number.isFinite(section?.velocity) ? section.velocity : undefined
  const startPosition = Number.isFinite(section?.startPosition) ? section.startPosition : undefined
  const damping = Number.isFinite(section?.damping) ? section.damping : undefined
  const stiffness = Number.isFinite(section?.stiffness) ? section.stiffness : undefined
  const fontSize = Number.isFinite(section?.fontSize) ? section.fontSize : undefined

  return (
    <section
    id={sectionId}
      className="bg-card border-b border-border/60"
      {...editAttributes}
    >
      <ScrollText
        texts={scrollTexts}
        numCopies={numCopies}
        velocity={velocity}
        direction={section.direction}
        startPosition={startPosition}
        damping={damping}
        stiffness={stiffness}
        fontSize={fontSize}
        textColor={section.textColor}
        showIcon={shouldShowIcon}
        showFlag={section.showFlag}
        style={section.style} 
      />
    </section>
  ) }


function CardGridSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,242,0.96))] border-b border-border/60"
      {...editAttributes}
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
      <div className="mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div className="grid max-w-3xl gap-2 mb-8">
          <h2 className="text-3xl text-foreground md:text-4xl">{section.title}</h2>
          {section.subtitle ? (
            <PortableTextContent as="div" value={section.subtitle} className="mb-4 leading-8 text-foreground text-xl" />
          ) : null}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
          {section.items?.map((item, index) => {
            const Icon = getServiceIcon(item)

            return (
              <Card
                key={buildRuntimeKey('card-grid-item', item.title, item.question, index)}
                className="grid py-8 grid-cols-1 place-content-start"
              >
                <CardHeader className="gap-4">
                  {Icon ? (
                    <div className="flex items-center justify-center text-primary bg-primary/8 rounded-full size-12">
                      <Icon className="size-5" />
                    </div>
                  ) : null}
                  <CardTitle className="text-foreground text-xl">{item.title || item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PortableTextContent
                    as="div"
                    value={item.body || item.answer}
                    className="leading-6 text-md text-muted-foreground"
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function GuideGridSection({ section, sectionId, editAttributes = {} }) {
  const cards = (section.items || []).map((item, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: item.title || item.question,
    copy: portableTextToPlainText(item.body || item.answer),
    icon: item.icon,
    color: item.color,
    href: item.href,
    image: getImageUrl(item.imageAsset, item.image),
    imageAlt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
    category: item.category || getGuideMetaByHref(item.href).category,
    tags: Array.isArray(item.tags) && item.tags.length ? item.tags : getGuideMetaByHref(item.href).tags,
  }))

  return (
    <section
      className="bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-size-[24px_24px] border-b border-border/60"
      {...editAttributes}
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
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div className="max-w-3xl mb-8">
          <h2 className="mb-4 text-3xl text-foreground md:text-4xl">{section.title}</h2>
          {section.body ? (
            <PortableTextContent as="div" value={section.body} className="leading-8 text-lg text-muted-foreground" />
          ) : null}
        </div>
        <GuideCardGrid
          cards={cards}
          columnsClassName="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          enableFiltering
          pageSize={6}
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
  if (item.icon && serviceIconMap[item.icon]) {
    return serviceIconMap[item.icon]
  }

  // Support PascalCase iconoir icon names from Sanity dropdowns
  if (item.icon && IconoirIcons[item.icon]) {
    return IconoirIcons[item.icon]
  }

  const title = `${cleanRuntimeString(item.title) || ''} ${cleanRuntimeString(item.eyebrow) || ''} ${portableTextToPlainText(item.body || item.answer) || ''}`.toLowerCase()

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
  // Sanity projection can provide either asset._ref or asset.url.
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

  if (item.icon && serviceImageMap[item.icon]) {
    return serviceImageMap[item.icon]
  }

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

function ServiceGridSection({ section, sectionId, editAttributes = {} }) {
  const items = (section.items || []).map((item) => {
    const serviceImage = getServiceImage(item)

    return {
      ...item,
      copy: portableTextToPlainText(item.body || item.answer),
      imageUrl: serviceImage.url,
      imageAlt: serviceImage.alt,
    }
  })

  const roofingItems = (section.roofingItems || []).map((item) => {
    const serviceImage = getServiceImage(item)

    return {
      ...item,
      copy: portableTextToPlainText(item.body || item.answer),
      imageUrl: serviceImage.url,
      imageAlt: serviceImage.alt,
    }
  })
  const secondaryItems = (section.secondaryItems || []).map((item) => {
    const serviceImage = getServiceImage(item)

    return {
      ...item,
      copy: portableTextToPlainText(item.body || item.answer),
      imageUrl: serviceImage.url,
      imageAlt: serviceImage.alt,
    }
  })

  function renderServiceMedia(item, overlayClassName) {
    if (!item.imageUrl) {
      return <div className={`absolute inset-0 ${overlayClassName}`} />
    }

    return (
      <>
        <Image
          width={2000}
          height={2000}
          src={item.imageUrl}
          alt={item.imageAlt}
          className="absolute h-full w-full duration-500 transition-transform inset-0 object-cover hover:scale-105"
        />
        <div className={`absolute inset-0 ${overlayClassName}`} />
      </>
    )
  }

  return (
    <section
      className="bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.96))] border-b border-border/60"
      {...editAttributes}
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
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div className="max-w-3xl mb-10">
          {section.eyebrow ? (
            <Badge variant="outline" className="text-foreground bg-primary/5 border-primary/20">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="mt-5 text-3xl text-foreground tracking-tight md:text-4xl">{section.title}</h2>
          {section.subtitle ? (
            <PortableTextContent as="div" value={section.subtitle} className="mt-4 leading-8 text-foreground/80 text-lg" />
          ) : null}
          {section.body ? (
            <PortableTextContent as="div" value={section.body} className="mt-4 leading-8 text-base text-muted-foreground" />
          ) : null}
        </div>
        <div className="grid gap-6 max-[900px]:grid-cols-1 md:grid-cols-3">
          {items.map((item) => {
            const Icon = getServiceIcon(item)
            const content = (
              <Card className="relative aspect-3/4" variant="media" radius="lg">
                {renderServiceMedia(
                  item,
                  'bg-[linear-gradient(to_top,var(--color-charade)_30%,rgba(11,59,66,0.1),transparent)]',
                )}
                <div className="absolute p-8 text-white bottom-0 inset-x-0">
                  <div className="items-center justify-center h-16 w-16 mb-4 bg-white/20 rounded-full backdrop-blur-sm inline-flex">
                    <Icon className="h-8 w-8" strokeWidth={2} />
                  </div>
                  <div className="font-bold leading-[1.1] text-[1.875rem] type-accent">{item.title}</div>
                  <div className="mt-1 font-semibold text-md text-white/70">{item.copy}</div>
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
          <div className="mt-8 pt-8 border-border/60 border-t">
            {section.roofingTitle ? (
              <h3 className="mb-4 text-foreground text-lg">{section.roofingTitle}</h3>
            ) : null}
            <div className="grid gap-4 lg:grid-cols-3 max-[900px]:grid-cols-1 md:grid-cols-2">
              {roofingItems.map((item) => {
                const Icon = getServiceIcon(item)
                const content = (
                  <Card className="relative aspect-4/5 overflow-hidden" variant="media" radius="lg">
                    {renderServiceMedia(
                      item,
                      'bg-[linear-gradient(to_top,rgba(11,59,66,1)_20%,rgba(11,59,66,0.4),transparent)]',
                    )}
                    <div className="absolute p-5 text-white bottom-0 inset-x-0">
                      <div className="items-center justify-center h-10 w-10 mb-3 bg-white/20 rounded-full backdrop-blur-sm inline-flex">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="font-bold leading-[1.05] text-[1.375rem] type-accent">{item.title}</div>
                      <p className="mt-2 leading-6 text-md text-white/82">{item.copy}</p>
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
          <div className="mt-8 pt-8 border-border/60 border-t">
            {section.secondaryTitle ? (
              <h3 className="mb-4 text-foreground text-lg">{section.secondaryTitle}</h3>
            ) : null}
            <div className="grid gap-4 lg:grid-cols-3 max-[900px]:grid-cols-1 md:grid-cols-2">
              {secondaryItems.map((item) => {
                const Icon = getServiceIcon(item)
                const content = (
                  <Card className="relative aspect-square overflow-hidden" variant="media" radius="lg">
                    {renderServiceMedia(
                      item,
                      'bg-[linear-gradient(to_top,rgba(11,59,66,1)_20%,rgba(11,59,66,0.4),transparent)]',
                    )}
                    <div className="absolute p-5 text-white bottom-0 inset-x-0">
                      <div className="items-center justify-center h-10 w-10 mb-3 bg-white/20 rounded-full backdrop-blur-sm inline-flex">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="font-bold leading-[1.05] text-[1.375rem] type-accent">{item.title}</div>
                      <p className="mt-2 leading-6 text-md text-white/82">{item.copy}</p>
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

function StepsSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-secondary-100 border-b border-border/60 radial-grid-bg"
      {...editAttributes}
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
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl text-foreground tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {section.items?.map((item, index) => (
            <Card
              key={buildRuntimeKey('step-item', item.title, index)}
              className="pb-8 pt-12 bg-card border-border/80"
            >
              <CardHeader className="gap-4">
                <Badge className="text-lg text-secondary-foreground bg-primary border-primary rounded-full ring-1 ring-primary size-8">
                  {index + 1}
                </Badge>
                <CardTitle className="text-foreground text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <PortableTextContent as="div" value={item.body} className="leading-6 text-md text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,0.98))] border-b border-border/60"
      {...editAttributes}
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
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl text-foreground tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="space-y-4">
          <Card className="bg-card border-border/80 p-4">
          <Accordion type="single" collapsible>
          {section.items?.map((item, index) => (
            <AccordionItem
              key={buildRuntimeKey('faq-item', item.question, index)}
              value={item.question}
              className="border-b border-border/80"
            >
              <AccordionTrigger className="text-foreground text-xl">{item.question}</AccordionTrigger>
              <AccordionContent>
                <PortableTextContent as="div" value={item.answer} className="leading-6 text-lg text-muted-foreground" />
              </AccordionContent>
            </AccordionItem>

          ))}
          </Accordion>
          </Card>
        </div>
      </div>
    </section>
  )
}

function HailMapSection({ section, sectionId, editAttributes = {} }) {
  const ctaLabel = section?.ctaLabel || 'Open interactive hail map'
  const ctaHref = section?.ctaHref?.startsWith('/') ? cleanRuntimeHref(section.ctaHref) : '/hail-map'

  return (
    <section
      className="bg-gradient border-b border-border/60"
      {...editAttributes}
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
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-10 lg:px-10">
        <Link
          href={ctaHref}
          className="block rounded-2xl border border-white/12 bg-[linear-gradient(90deg,hsl(var(--color-secondary-h)_35%_14%),hsl(var(--color-secondary-h)_30%_11%))] p-10 text-white transition-transform hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.22)] md:p-12"
        >
          <div className="grid items-center justify-end content-end gap-6 md:grid-cols-1">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl text-center">
                {section?.title || 'Check hail risk and recent storm signals near your property'}
              </h2>
              {section?.body ? (
                <PortableTextContent as="div" value={section.body} className="max-w-3xl mx-auto leading-7 text-white/78 text-center" />
              ) : (
                <p className=" max-w-3xl mx-auto leading-7 text-white/78 text-center">
                  Open the dedicated hail map page to search your address and compare storm evidence with your roof
                  inspection.
                </p>
              )}
            </div>
            <div className="place-self-center w-fit inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/8 px-5 py-3 font-semibold text-sm text-white">
              {ctaLabel}
              <FastArrowRight className="size-4" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}

function parseColorToRgb(value) {
  if (typeof value !== 'string') return null
  const color = value.trim()

  const shortHexMatch = color.match(/^#([0-9a-f]{3})$/i)
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('').map((part) => Number.parseInt(`${part}${part}`, 16))
    return { r, g, b }
  }

  const hexMatch = color.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i)
  if (hexMatch) {
    const hex = hexMatch[1]
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    }
  }

  const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/i)
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((part) => Number.parseFloat(part.trim()))
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      return { r: parts[0], g: parts[1], b: parts[2] }
    }
  }

  return null
}

function getContrastTextBase(color) {
  const rgb = parseColorToRgb(color)
  if (!rgb) return '#111111'

  const toLinear = (channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  const luminance = 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
  return luminance > 0.35 ? '#111111' : '#ffffff'
}

function SecondaryCTASection({ section, sectionId, editAttributes = {} }) {
  const ctaLabel = section?.ctaLabel || 'Request a free roofing inspection'
  const ctaHref = section?.ctaHref?.startsWith('/') ? cleanRuntimeHref(section.ctaHref) : '/free-roofing-inspection'
  const resolvedColor = section?.color || 'var(--color-sweetcorn)'
  const contrastBase = getContrastTextBase(resolvedColor)
  const blendedTextColor = `color-mix(in oklch, ${resolvedColor} 10%, ${contrastBase})`

  return (
    <section
      id={sectionId}
      className={`bg-card border-b border-border/60`}
      {...editAttributes}

    >
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-10 lg:px-10">
        <Link
          href={ctaHref}
          className={`block rounded-2xl border py-8 border-white/12 `}
          style={{ 
            backgroundColor: resolvedColor,
            color: blendedTextColor,
           }}
        >
          <div className="grid items-center justify-end content-end gap-6 md:grid-cols-1">
            <div className="space-y-3">
              <h2 className="text-2xl text-inherit font-semibold tracking-tight md:text-3xl text-center">
                {section?.title || 'Secondary CTA section'}
              </h2>
              {section?.body ? (
                <PortableTextContent as="div" value={section.body} className="max-w-3xl mx-auto leading-7 text-inherit/85 text-center" />
              ) : (
                <p className=" max-w-3xl mx-auto leading-7 text-inherit text-center">
                  Secondary CTA section
                </p>
              )}
            </div>
            <div className="place-self-center w-fit inline-flex items-center gap-3 rounded-full border border-inherit px-5 py-3 font-semibold text-sm text-inherit">
              {ctaLabel}
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}

function QuoteBannerSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-[linear-gradient(180deg,rgba(247,244,239,0.98),rgba(255,255,255,0.98))] border-b border-border/60"
      {...editAttributes}
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
        quoteText={portableTextToPlainText(section.body) || section.title || ''}
        attribution={section.title || 'Texas Solar and Roofing Pros'}
        sectionId={`${sectionId}-content`}
      />
    </section>
  )
}

function AboutProfileSection({ section, sectionId, editAttributes = {} }) {
  const aboutCardThemeColorMap = {
    primary: 'var(--color-primary)',
    sweetcorn: 'var(--color-sweetcorn)',
    voodoo: 'var(--color-voodoo)',
    tidal: 'var(--color-tidal)',
    secondaryAlt: 'var(--color-secondary-alt)',
    blue400: 'var(--color-blue-400)',
    secondary: 'var(--color-secondary)',
    tasman: 'var(--color-tasman)',
    chaletGreen: 'var(--color-chalet-green)',
    metterhorn: 'var(--color-metterhorn)',
    heather: 'var(--color-heather)',
    wattle: 'var(--color-wattle)',
    charade: 'var(--color-charade)',
    ceramic: 'var(--color-ceramic)',
    tapaGreen: 'var(--color-tapa-green)',
    seaMist: 'var(--color-sea-mist)',
    blackCurrent: 'var(--color-black-current)',
    confetti: 'var(--color-confetti)',
  }
  const defaultAboutCardGradients = [
    { start: 'primary', end: 'tidal' },
    { start: 'primary', end: 'sweetcorn' },
    { start: 'secondary', end: 'tertiary' },
  ]
  const people = section.people?.length
    ? section.people
    : [
        {
          label: section.personLabel,
          name: section.personName,
          role: section.personRole,
          blurb: section.personBlurb,
          profileImage: section.profileImage,
          profileImageAsset: section.profileImageAsset,
          certificationLabel: section.certificationLabel,
          certificationTitle: section.certificationTitle,
          badgeImage: section.badgeImage,
          badgeImageAsset: section.badgeImageAsset,
        },
        {
          label: section.secondaryPersonLabel,
          name: section.secondaryPersonName,
          role: section.secondaryPersonRole,
          blurb: section.secondaryPersonBlurb,
          profileImage: section.secondaryProfileImage,
          profileImageAsset: section.secondaryProfileImageAsset,
        },
      ].filter((person) => person?.name)

  return (
    <section
      className="bg-gradient"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:AboutProfileSection',
        content: `about profile section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:AboutProfileSection"
        content={`about profile section from ${section?._type || 'page section'}`}
      />
      <div className="grid max-w-7xl gap-6 mx-auto px-3 md:px-6 py-20 lg:px-10 grid-cols-1 md:grid-cols-[.85fr_1.15fr]">
        <div className="grid content-start gap-6 grid-cols-1">
          {people.map((person, index) => {
            const profileImageUrl = getImageUrl(person.profileImageAsset, person.profileImage)
            const profileImageAlt = getImageAlt(
              person.profileImageAsset,
              person.profileImage,
              person.name || 'Profile image',
            )
            const badgeImageUrl = getImageUrl(person.badgeImageAsset, person.badgeImage)
            const badgeImageAlt = getImageAlt(
              person.badgeImageAsset,
              person.badgeImage,
              person.certificationTitle || 'Certification badge',
            )
            const resolvedBadgeImageUrl =
              badgeImageUrl ||
              (person.certificationTitle?.includes('NABCEP')
                ? 'https://www.nabcep.org/wp-content/uploads/2020/01/PVTS-Registered-Seal.jpg'
                : '')
            const resolvedBadgeImageAlt = badgeImageAlt || person.certificationTitle || 'Certification badge'
            const defaultGradient = defaultAboutCardGradients[index % defaultAboutCardGradients.length]
            const gradientStart = aboutCardThemeColorMap[person.cardGradientStart] || aboutCardThemeColorMap[defaultGradient.start]
            const gradientEnd = aboutCardThemeColorMap[person.cardGradientEnd] || aboutCardThemeColorMap[defaultGradient.end]
            const profileCardBackground = `linear-gradient(45deg, ${gradientStart}, ${gradientEnd}), url('https://grainy-gradients.vercel.app/noise.svg')`

            return (
              <Card
                key={buildRuntimeKey('about-person', person.name, index)}
                radius="lg"
                className="grid content-between items-end pt-8 bg-card aspect-3/3 grid-cols-1"
                style={{
                  background: profileCardBackground,
                  backgroundBlendMode: 'multiply',
                }}
              >
                <Image
                  width={700}
                  height={700}
                  src={profileImageUrl}
                  alt={profileImageAlt}
                  className="absolute filter grayscale inset-0 object-cover size-full"
                />
                <CardHeader className="flex relative items-center gap-4 z-10">
                  <div className="flex items-start">
                    <div className="grid gap-1">
                      <div className="text-white text-xs tracking-[0.2em] uppercase">
                        {person.label || 'Profile'}
                      </div>
                      <CardTitle className="leading-4 text-3xl text-white tracking-tight">
                        {person.name}
                      </CardTitle>
                      {person.role ? (
                        <p className="font-semibold leading-4 text-lg text-white">{person.role}</p>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid relative content-end h-30 gap-4 grid-cols-1 z-10">
                  
                  {person.certificationTitle ? (
                    <div className="grid gap-3 border-border/80">
                      <div className="flex items-center gap-3">
                        {resolvedBadgeImageUrl ? (
                          <Image
                            width={100}
                            height={100}
                            src={resolvedBadgeImageUrl}
                            alt={resolvedBadgeImageAlt}
                            className="bg-white rounded-full object-contain size-18"
                          />
                        ) : null}
                        <div className="grid gap-1">
                          {person.certificationLabel ? (
                            <div className="text-white text-xs tracking-[0.2em] uppercase">
                              {person.certificationLabel}
                            </div>
                          ) : null}
                          <div className="font-semibold leading-6 text-base text-white">
                            {person.certificationTitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
                <div className="absolute bg-[linear-gradient(to_top,var(--color-black)_15%,rgba(11,59,66,0.2),transparent)] inset-0"></div>
              </Card>
            )
          })}
        </div>
        <div className="max-w-3xl mb-10">
          {section.eyebrow ? (
            <Badge variant="outline" className="text-foreground bg-primary/5 border-primary/20">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="mt-5 text-3xl text-foreground leading-1 tracking-tight md:text-4xl">{section.title}</h2>
          {section.body ? (
            <PortableTextContent as="div" value={section.body} className="mt-2 leading-8 text-base text-muted-foreground" />
          ) : null}
        </div>
      </div>
    </section>
  )
}

function RoofingLogoCloudSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-card border-b border-border/60"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:RoofingLogoCloudSection',
        content: `logos marquee section from ${section?._type || 'local fallback section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:RoofingLogoCloudSection"
        content={`logos marquee section from ${section?._type || 'local fallback section'}`}
      />
      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-10">
        {section?.title || section?.body ? (
          <div className="pt-16 text-left" {...editAttributes}>
            {section?.title ? <h2 className="text-xl tracking-tight md:text-2xl">{section.title}</h2> : null}
            {section?.body ? (
              <PortableTextContent
                as="div"
                value={section.body}
                className="max-w-3xl mx-auto mt-4 leading-8 text-base text-muted-foreground"
              />
            ) : null}
          </div>
        ) : null}
        <LogoCloud items={section?.items} />
      </div>
    </section>
  )
}

function CtaSection({ page, section, site, pathname, sectionId, editAttributes }) {
  const pathnameSegments = (pathname || '').split('/').filter(Boolean)
  const topLevelPath = cleanRuntimeString(pathnameSegments[0])
  const serviceSlug = pathnameSegments[0] === 'services' ? cleanRuntimeString(pathnameSegments[1]) : ''
  const roofingServiceSlugs = new Set(roofingServices.map((service) => service.slug))
  const isRoofingContext =
    topLevelPath === 'roofing' ||
    topLevelPath === 'hail-damage' ||
    (topLevelPath === 'services' && roofingServiceSlugs.has(serviceSlug))
  const pageSlug = cleanRuntimeString(page?.slug)
  const pagePath = pageSlug ? `/${pageSlug}` : pathname || '/'
  const ctaTheme = section?.theme === 'dark' ? 'dark' : 'light'

  return (
    <>
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:CtaSection"
        content={`shared consultation section fallback for page from ${page?.source || 'fixture'}`}
      />
      <ConsultationSection
        site={site}
        section={section}
        sectionId={CONSULTATION_ANCHOR_ID}
        variant={isRoofingContext ? 'roofingInspection' : 'default'}
        theme={ctaTheme}
        pagePath={pagePath}
        pageTitle={page?.title || 'Texas Solar and Roofing Pros'}
        editAttributes={editAttributes}
      />
    </>
  )
}

function CtaBannerSection({ page, section, site, sectionId, editAttributes }) {
  const slug = cleanRuntimeString(page?.slug)
  const avatarEyebrow = section?.avatarEyebrow || section?.personLabel || ''
  const avatarName = section?.avatarName || section?.personName || ''
  const avatarRole = section?.avatarRole || section?.personRole || ''
  const avatarBlurb = section?.avatarBlurb || section?.personBlurb || ''
  const avatarColor = section?.avatarColor || ''
  const avatarImageUrl = getImageUrl(
    section?.avatarImageAsset || section?.profileImageAsset,
    section?.avatarImage || section?.profileImage,
  )
  const avatarImageAlt = getImageAlt(
    section?.avatarImageAsset || section?.profileImageAsset,
    section?.avatarImage || section?.profileImage,
    avatarName,
  )
  const avatarInitials = String(avatarName || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  const avatarStyle = avatarColor ? { backgroundColor: avatarColor } : undefined
  const isDarkTheme = section?.theme !== 'light'
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
      id={CONSULTATION_ANCHOR_ID}
      className={`py-20 ${isDarkTheme ? 'text-white bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))]' : 'bg-card text-foreground border-b border-border/60'}`}
      {...editAttributes}
      {...getDevSectionAttributes({
        id: CONSULTATION_ANCHOR_ID,
        markup: 'src/components/platform/PublicSite.jsx:CtaBannerSection',
        content: `cross-lead banner from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:CtaBannerSection"
        content={`cross-lead banner from ${section?._type || 'page section'}`}
      />
      <div className="grid max-w-7xl gap-12 mx-auto px-3 md:px-6 lg:px-10 place-items-center lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {section.eyebrow ? (
            <p className={`text-sm tracking-[0.22em] uppercase ${isDarkTheme ? 'text-white/58' : 'text-muted-foreground'}`}>{section.eyebrow}</p>
          ) : null}
          <h2 className="max-w-3xl text-3xl tracking-tight md:text-4xl">{section.title}</h2>
          <PortableTextContent as="div" value={section.body} className={`max-w-2xl leading-8 text-base ${isDarkTheme ? 'text-white/78' : 'text-muted-foreground'}`} />
          {avatarName ? (
            <div className="max-w-xl pt-2">
              <div className="flex items-center gap-4">
                <Avatar size="xl" className={`size-16 ${isDarkTheme ? 'bg-white/10 ring-1 ring-white/20' : 'bg-primary ring-1 ring-black/5'}`} style={avatarStyle}>
                  {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={avatarImageAlt} /> : null}
                  <AvatarFallback
                    className={`font-semibold text-base ${isDarkTheme ? 'text-white bg-white/12' : 'text-secondary-foreground bg-secondary'}`}
                    style={avatarStyle}
                  >
                    {avatarInitials || 'TS'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  {avatarEyebrow ? (
                    <div className={`mb-1 font-semibold text-[11px] tracking-[0.22em] uppercase ${isDarkTheme ? 'text-white/58' : 'text-muted-foreground'}`}>
                      {avatarEyebrow}
                    </div>
                  ) : null}
                  <div className={`font-semibold text-lg ${isDarkTheme ? 'text-white' : 'text-foreground'}`}>{avatarName}</div>
                  {avatarRole ? <div className={`text-sm ${isDarkTheme ? 'text-white/72' : 'text-muted-foreground'}`}>{avatarRole}</div> : null}
                  {avatarBlurb ? (
                    <PortableTextContent as="div" value={avatarBlurb} className={`mt-3 text-sm leading-6 ${isDarkTheme ? 'text-white/80' : 'text-muted-foreground'}`} />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <Card className={`gap-0 ${isDarkTheme ? 'text-white bg-white/6 border-white/12 backdrop-blur' : ''}`}>
          <CardContent>
            <LeadCaptureForm
              context={leadContext}
              compact
              buttonLabel={section.ctaLabel || 'Request a roofing intro'}
              className="grid gap-4"
              inputClassName={isDarkTheme ? 'border-b px-3 py-2 text-white placeholder:text-white/48' : 'border-color-grid placeholder:text-slate-700 focus:border-primary text-foreground'}
              labelClassName={isDarkTheme ? 'text-white/70' : 'text-slate-500'}
              checkboxClassName={isDarkTheme ? 'accent-white' : 'accent-primary'}
              messageClassName="text-left"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function BandSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-transparent"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:BandSection',
        content: `band section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:BandSection"
        content={`band section from ${section?._type || 'page section'}`}
      />
      <Band
        colors={Array.isArray(section.colors) && section.colors.length ? section.colors : undefined}
        tint={section.tint || undefined}
        minHeight={typeof section.minHeight === 'number' ? section.minHeight : undefined}
        maxHeight={typeof section.maxHeight === 'number' ? section.maxHeight : undefined}
        rotate={Boolean(section.rotate)}
        scrollStart={typeof section.scrollStart === 'number' ? section.scrollStart : undefined}
        scrollEnd={typeof section.scrollEnd === 'number' ? section.scrollEnd : undefined}
        reverse={Boolean(section.reverse)}
        autoAnimate={Boolean(section.autoAnimate)}
        speed={typeof section.speed === 'number' ? section.speed : undefined}
        amplitude={typeof section.amplitude === 'number' ? section.amplitude : undefined}
      />
    </section>
  )
}

function SolarSwitchSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-background border-b border-border/60"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/PublicSite.jsx:SolarSwitchSection',
        content: `solar switch section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx:SolarSwitchSection"
        content={`solar switch section from ${section?._type || 'page section'}`}
      />
      <SolarSwitch
        leadingWords={
          Array.isArray(section.leadingWords) && section.leadingWords.length
            ? section.leadingWords
            : undefined
        }
        accentWord={section.accentWord || undefined}
        trailingText={section.trailingText || undefined}
      />
    </section>
  )
}

const sectionRenderers = {
  hero: HeroSection,
  story: StorySection,
  calculator: CalculatorSection,
  costs: CostsSection,
  guides: GuidesSection,
  snapshot: SnapshotSection,
  incentives: IncentivesSection,
  testimonials: Testimonials,
  resourceGrid: ResourcesSection,
  scrollText: ScrollTextSection,
  aboutProfile: AboutProfileSection,
  secondaryCTA: SecondaryCTASection,
  quote: QuoteBannerSection,
  highlights: CardGridSection,
  guideGrid: GuideGridSection,
  serviceGrid: ServiceGridSection,
  faq: FaqSection,
  hailMap: HailMapSection,
  band: BandSection,
  logos: RoofingLogoCloudSection,
  solarSwitch: SolarSwitchSection,
  energyChart: EnergyChartSection,
  steps: StepsSection,
  cta: CtaSection,
  ctaBanner: CtaBannerSection,
}

export default function PublicSite({ site, page, pathname, navigation, jsonLd, reviews = [] }) {
  const useSolarShell = isPrimarySiteSlug(site.slug)
  const sections = page.sections || []
  const leadCaptureSectionTypes = new Set(['cta', 'ctaBanner'])
  const hasLeadCaptureSection = sections.some((section) => leadCaptureSectionTypes.has(section.type))
  const hasLogosSection = sections.some((section) => section.type === 'logos')
  const heroSectionIndex = sections.findIndex((section) => section.type === 'hero')
  const pageSlug = cleanRuntimeString(page.slug)
  const firstLeadCaptureSectionIndex = sections.findIndex((section) =>
    leadCaptureSectionTypes.has(section.type),
  )
  const pathnameSegments = (pathname || '').split('/').filter(Boolean)
  const topLevelPath = cleanRuntimeString(pathnameSegments[0])
  const serviceSlug = pathnameSegments[0] === 'services' ? cleanRuntimeString(pathnameSegments[1]) : ''
  const roofingServiceSlugs = new Set(roofingServices.map((service) => service.slug))
  const showRoofingLogoCloud =
    useSolarShell &&
    (topLevelPath === 'roofing' || (topLevelPath === 'services' && roofingServiceSlugs.has(serviceSlug)))
  const showFallbackRoofingLogoCloud = showRoofingLogoCloud && !hasLogosSection
  const suppressDefaultLeadCapture =
    pageSlug === 'privacy-policy' || pageSlug === 'terms' || pageSlug === 'services/detach-and-reset'
  const isGuidePost = page.pageType === 'post' && pageSlug.startsWith('guides/')
  const shareUrl =
    cleanRuntimeString(page?.seo?.canonicalUrl) ||
    (site?.primaryDomain ? `https://${site.primaryDomain}${pathname || '/'}` : '')
  const pageEditAttrs = getSanityPageEditAttributes(page, 'title')
  const pageSectionsEditAttrs = getSanityPageEditAttributes(page, 'sections')
  const style = {
    '--site-primary': site.brand?.primary || 'var(--color-primary)',
    '--site-secondary': site.brand?.secondary || 'var(--color-secondary)',
    '--site-accent': site.brand?.accent || 'var(--color-secondary-500)',
    '--site-surface': site.brand?.surface || 'var(--color-warm-bg)',
  }

  return (
    <div
      className="min-h-screen text-foreground bg-background"
      {...getDevSectionAttributes({
        id: 'public-site-root',
        markup: 'src/components/platform/PublicSite.jsx',
        content: `page "${page.title}" from ${page.source || 'fixture'}`,
        note: `route ${pathname || '/'} using ${useSolarShell ? 'solar shell' : 'generic shell'}`,
      })}
      {...pageEditAttrs}
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
          className="sticky bg-background/90 border-b border-border/60 backdrop-blur top-0 z-40"
          {...getDevSectionAttributes({
            id: 'site-header',
            markup: 'src/components/platform/PublicSite.jsx:GenericHeader',
            content: 'generic public-site shell header',
          })}
        >
          <div className="flex items-center justify-between max-w-7xl gap-6 mx-auto px-3 md:px-6 py-4 lg:px-10">
            <Link href="/" className="flex flex-col min-w-0">
              <span className="text-md text-muted-foreground tracking-[0.22em] uppercase">
                {site.brand?.eyebrow}
              </span>
              <span className="font-semibold text-foreground text-xl tracking-tight">{site.name}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item, index) => (
                <Link
                  key={buildRuntimeKey('site-nav-item', item.href, item.label, index)}
                  className="font-medium text-md text-muted-foreground hover:text-foreground transition-colors"
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
        {...pageSectionsEditAttrs}
      >
        {sections.map((section, index) => {
          const Component = sectionRenderers[section.type]

          if (!Component) {
            return null
          }

          const sectionId = getSectionDomId(section, index)
          const sectionEditAttrs = getSanitySectionEditAttributes(page, section)

          return (
            <div
              key={buildRuntimeKey('page-section', section._key, section.type, sectionId, index)}
              {...sectionEditAttrs}
            >
              {showFallbackRoofingLogoCloud && index === firstLeadCaptureSectionIndex ? (
                <RoofingLogoCloudSection sectionId="roofing-certifications" />
              ) : null}
              <Component
                page={page}
                section={section}
                site={site}
                pathname={pathname}
                reviews={reviews}
                sectionId={sectionId}
                editAttributes={sectionEditAttrs}
              />
              {isGuidePost && index === heroSectionIndex ? (
                <GuideShareBar url={shareUrl} title={page.seo?.title || page.title || ''} />
              ) : null}
            </div>
          )
        })}

        {isGuidePost && heroSectionIndex === -1 ? (
          <GuideShareBar url={shareUrl} title={page.seo?.title || page.title || ''} />
        ) : null}

        {showFallbackRoofingLogoCloud && firstLeadCaptureSectionIndex === -1 ? (
          <div {...pageSectionsEditAttrs}>
            <RoofingLogoCloudSection sectionId="roofing-certifications" />
          </div>
        ) : null}

        {!hasLeadCaptureSection && !suppressDefaultLeadCapture ? (
          <CtaSection page={page} section={null} site={site} pathname={pathname} sectionId="cta-contact" />
        ) : null}
      </main>

      {useSolarShell ? (
        <Footer />
      ) : (
        <footer
          className="bg-background border-border/60 border-t"
          {...getDevSectionAttributes({
            id: 'site-footer',
            markup: 'src/components/platform/PublicSite.jsx:GenericFooter',
            content: 'generic public-site shell footer',
          })}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between max-w-7xl gap-6 mx-auto px-3 md:px-6 py-10 lg:px-10">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase">{site.categoryLabel}</p>
              <h2 className="text-2xl text-foreground tracking-tight">{site.name}</h2>
              <p className="max-w-2xl leading-6 text-md text-muted-foreground">{site.seo?.description}</p>
            </div>
            <div className="space-y-2 text-md text-muted-foreground">
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
