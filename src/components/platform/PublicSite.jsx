import Link from 'next/link'
import {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Flash,
  HomeShield,
  HomeSimple,
  SunLight,
  Thunderstorm,
  WarningTriangle,
  WindowTabs,
  Wrench,
} from 'iconoir-react'

import Footer from '@/components/Footer'
import GuideCardGrid from '@/components/GuideCardGrid'
import HailWeatherLookup from '@/components/HailWeatherLookup'
import Header from '@/components/Header'
import ConsultationSection from '@/components/ConsultationSection'
import LeadCaptureForm from '@/components/LeadCaptureForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { isPrimarySiteSlug } from '@/lib/platform/content'
import { getImageAlt, getImageUrl, hasImageSource } from '@/lib/platform/imageSource'

function HeroSection({ page, section }) {
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
    <section className="border-border/60 relative grid h-[60vh] place-content-center overflow-hidden border-b bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_52%),linear-gradient(180deg,var(--site-surface),rgba(255,255,255,0.92))]">
      {hasHeroImage ? (
        <>
          <div className="absolute inset-0">
            <img
              alt={getImageAlt(section.heroAsset, section.heroImage, heroTitle)}
              className="h-full w-full object-cover"
              src={heroImageUrl}
            />
          </div>
          <div className="absolute inset-0" style={overlayStyle} />
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
              {section.actions.map((action) => (
                <Button asChild key={action.href} variant={action.variant || 'default'} size="lg">
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        {hasHeroImage ? (
          <div className="space-y-4">
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
                    key={metric.label}
                  >
                    <div
                      className="text-muted-foreground text-xs tracking-[0.18em] uppercase"
                      style={heroMutedStyle}
                    >
                      {metric.label}
                    </div>
                    <div
                      className="text-foreground mt-2 text-2xl font-semibold tracking-tight"
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

function StorySection({ section }) {
  return (
    <section className="border-border/60 bg-background border-b">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <Badge variant="outline" className="border-secondary/20 bg-secondary text-foreground">
          {section.eyebrow}
        </Badge>
        <h2 className="text-foreground mx-auto mt-6 max-w-6xl text-3xl tracking-tight md:text-5xl">
          {section.title}
        </h2>
        <p className="text-muted-foreground mx-auto mt-6 max-w-6xl text-lg leading-8">{section.body}</p>
      </div>
    </section>
  )
}

function CardGridSection({ section }) {
  return (
    <section className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,242,0.96))]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-foreground text-3xl md:text-4xl">{section.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {section.items?.map((item) => (
            <Card key={item.title} className="shadow-theme-sm border-border/80 bg-card/95">
              <CardHeader>
                <CardTitle className="text-foreground text-xl">{item.title || item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-7">
                {item.body || item.answer}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function GuideGridSection({ section }) {
  const palette = [
    'bg-color-secondary-700 text-white',
    'bg-[var(--color-secondary-alt)] text-white',
    'bg-blue-400 text-white',
    'bg-[var(--site-secondary)] text-white',
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
    <section className="border-border/60 border-b bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-foreground text-3xl md:text-4xl">{section.title}</h2>
        </div>
        <GuideCardGrid cards={cards} columnsClassName="md:grid-cols-2 xl:grid-cols-3" palette={palette} />
      </div>
    </section>
  )
}
const iconMap = {
  'solar:map-point-linear': Thunderstorm,
  'solar:home-linear': HomeShield,
  'solar:wad-of-money-linear': SunLight,
  thunderstorm: Thunderstorm,
  hail: Thunderstorm,
  roofing: HomeShield,
  solar: SunLight,
  sunlight: SunLight,
}

function getResourceIcon(iconName) {
  return iconMap[iconName] || HomeSimple
}

const serviceIconMap = {
  audit: AreaSearch,
  insulation: HomeShield,
  ducts: AirConditioner,
  windows: WindowTabs,
  heatpump: AirConditioner,
  solarbattery: BatteryCharging,
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
}

function getServiceIcon(item) {
  if (item.icon && serviceIconMap[item.icon]) {
    return serviceIconMap[item.icon]
  }

  const title = `${item.title || ''} ${item.eyebrow || ''}`.toLowerCase()

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

  if (item.icon && serviceImageMap[item.icon]) {
    return serviceImageMap[item.icon]
  }

  const title = `${item.title || ''} ${item.eyebrow || ''}`.toLowerCase()

  if (title.includes('audit')) return serviceImageMap.audit
  if (title.includes('insulation') || title.includes('air sealing')) return serviceImageMap.insulation
  if (title.includes('duct')) return serviceImageMap.ducts
  if (title.includes('window')) return serviceImageMap.windows
  if (title.includes('heat pump')) return serviceImageMap.heatpump
  if (title.includes('battery') || title.includes('solar')) return serviceImageMap.solarbattery

  return {
    url: getImageUrl(item.imageAsset, item.image),
    alt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
  }
}

function ServiceGridSection({ section }) {
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
    <section className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.96))]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          {section.eyebrow ? (
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-foreground">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="text-foreground mt-5 text-3xl tracking-tight md:text-4xl">{section.title}</h2>
          {section.body ? (
            <p className="text-muted-foreground mt-4 text-base leading-8">{section.body}</p>
          ) : null}
        </div>
        <div className="grid gap-6 max-[900px]:grid-cols-1 md:grid-cols-3">
          {items.map((item) => {
            const Icon = getServiceIcon(item)
            const content = (
              <Card className="relative aspect-[1/1]" variant="media" radius="lg">
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,59,66,0.9),rgba(11,59,66,0.2),transparent)]"></div>
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-[8px]">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div className="type-accent text-[1.875rem] leading-[1.1] font-bold">{item.title}</div>
                  <div className="mt-1 text-sm font-semibold text-white/70">{item.copy}</div>
                </div>
              </Card>
            )

            if (!item.href) {
              return <div key={item.title}>{content}</div>
            }

            return (
              <Link key={item.title} href={item.href}>
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
            <div className="grid gap-4 max-[900px]:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {roofingItems.map((item) => {
                const Icon = getServiceIcon(item)
                const content = (
                  <Card className="relative aspect-[4/5] overflow-hidden" variant="media" radius="lg">
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,59,66,0.92),rgba(11,59,66,0.4),transparent)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-[8px]">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="type-accent text-[1.375rem] leading-[1.05] font-bold">{item.title}</div>
                      <p className="mt-2 text-sm leading-6 text-white/82">{item.copy}</p>
                    </div>
                  </Card>
                )

                if (!item.href) {
                  return <div key={item.title}>{content}</div>
                }

                return (
                  <Link key={item.title} href={item.href}>
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
            <div className="grid gap-4 max-[900px]:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {secondaryItems.map((item) => {
                const Icon = getServiceIcon(item)
                const content = (
                  <Card className="relative aspect-[1/1] overflow-hidden" variant="media" radius="lg">
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,59,66,0.92),rgba(11,59,66,0.4),transparent)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-[8px]">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <div className="type-accent text-[1.375rem] leading-[1.05] font-bold">{item.title}</div>
                      <p className="mt-2 text-sm leading-6 text-white/82">{item.copy}</p>
                    </div>
                  </Card>
                )

                if (!item.href) {
                  return <div key={item.title}>{content}</div>
                }

                return (
                  <Link key={item.title} href={item.href}>
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

function StepsSection({ section }) {
  return (
    <section className="border-border/60 bg-background border-b">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-foreground text-3xl tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {section.items?.map((item, index) => (
            <Card key={item.title} className="border-border/80 bg-card">
              <CardHeader className="gap-4">
                <Badge className="bg-secondary/90 text-secondary-foreground w-fit rounded-full px-3 py-1">
                  Step {index + 1}
                </Badge>
                <CardTitle className="text-foreground text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-7">{item.body}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({ section }) {
  return (
    <section className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,0.98))]">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-foreground text-3xl tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="space-y-4">
          {section.items?.map((item) => (
            <Card key={item.question} className="border-border/80 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground text-xl">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-7">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HailMapSection({ section }) {
  return (
    <section className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,239,0.98))]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <HailWeatherLookup section={section} />
      </div>
    </section>
  )
}

function CtaSection({ page, section, site, pathname }) {
  return <ConsultationSection site={site} />
}

function CtaBannerSection({ page, section, site }) {
  const leadContext = {
    sourceType: 'cross-lead',
    sourceSection: 'cta-banner',
    serviceInterest: 'roofing',
    siteSlug: site?.slug || 'texas-solar-and-roofing-pros',
    siteName: site?.name || 'Texas Solar and Roofing Pros',
    sourceDomain: site?.primaryDomain || 'texassolarandroofingpros.com',
    pagePath: page?.slug ? `/${page.slug}` : '/',
    pageTitle: page?.title || section?.title || 'Guide CTA',
    metadata: {
      entryPoint: 'guide-cta-banner',
    },
  }

  return (
    <section className="border-border/60 border-b bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))] py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="space-y-4">
          {section.eyebrow ? (
            <p className="text-sm tracking-[0.22em] text-white/58 uppercase">{section.eyebrow}</p>
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
      style={{
        ...style,
        backgroundColor: 'var(--site-surface)',
      }}
    >
      {useSolarShell ? (
        <Header />
      ) : (
        <header className="border-border/60 bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
            <Link href="/" className="flex min-w-0 flex-col">
              <span className="text-muted-foreground text-sm tracking-[0.22em] uppercase">
                {site.brand?.eyebrow}
              </span>
              <span className="text-foreground text-xl font-semibold tracking-tight">{site.name}</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  href={item.href}
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

      <main>
        {sections.map((section, index) => {
          const Component = sectionRenderers[section.type]

          if (!Component) {
            return null
          }

          return (
            <Component
              key={`${section.type}-${index}`}
              page={page}
              section={section}
              site={site}
              pathname={pathname}
            />
          )
        })}

        {!hasLeadCaptureSection ? (
          <CtaSection page={page} section={null} site={site} pathname={pathname} />
        ) : null}
      </main>

      {useSolarShell ? (
        <Footer />
      ) : (
        <footer className="border-border/60 bg-background border-t">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">{site.categoryLabel}</p>
              <h2 className="text-foreground text-2xl tracking-tight">{site.name}</h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-7">{site.seo?.description}</p>
            </div>
            <div className="text-muted-foreground space-y-2 text-sm">
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
