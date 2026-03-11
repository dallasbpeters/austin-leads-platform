import Link from 'next/link'

import Footer from '@/components/Footer'
import GuideCardGrid from '@/components/GuideCardGrid'
import { GuideCard } from '@/components/GuideCardGrid'
import HailWeatherLookup from '@/components/HailWeatherLookup'
import Header from '@/components/Header'
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
    <section className="place-content-center grid relative h-[60vh] overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_52%),linear-gradient(180deg,var(--site-surface),rgba(255,255,255,0.92))]">
      {hasHeroImage ? (
        <>
          <div className="absolute inset-0">
            <img alt={getImageAlt(section.heroAsset, section.heroImage, heroTitle)} className="h-full w-full object-cover" src={heroImageUrl} />
          </div>
          <div className="absolute inset-0" style={overlayStyle} />
        </>
      ) : null}
      <div className={hasHeroImage ? 'relative z-10 mx-auto place-content-center grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1.35fr_0.95fr] lg:px-10' : 'relative z-10 mx-auto place-content-center grid max-w-8xl gap-10 px-6 py-24 lg:grid-cols-1 lg:px-10'}>
        <div className="space-y-6">
          <Badge variant="outline" className={heroTextColor ? 'border-transparent bg-transparent' : 'border-primary/20 bg-primary/5 text-foreground'} style={badgeStyle}>
            {section.eyebrow}
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl tracking-tight text-foreground md:text-6xl" style={heroTextStyle}>
              {heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground" style={heroMutedStyle}>
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
            <Card className={hasHeroImage ? 'shadow-theme-glass border-white/15 bg-white/8 backdrop-blur gap-0' : 'shadow-theme-glass-soft border-border/70 bg-background/10 backdrop-blur gap-0'}>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground" style={heroMutedStyle}>
                  Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {section.metrics?.map((metric) => (
                  <div className={hasHeroImage ? 'rounded-xl border border-white/15 bg-white/8 px-4 py-4' : 'rounded-xl border border-border/70 bg-card/90 px-4 py-4'} key={metric.label}>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground" style={heroMutedStyle}>
                      {metric.label}
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground" style={heroTextStyle}>
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
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <Badge variant="outline" className="border-secondary/20 bg-secondary text-foreground">
          {section.eyebrow}
        </Badge>
        <h2 className="mx-auto mt-6 max-w-6xl text-3xl tracking-tight text-foreground md:text-5xl">{section.title}</h2>
        <p className="mx-auto mt-6 max-w-6xl text-lg leading-8 text-muted-foreground">{section.body}</p>
      </div>
    </section>
  )
}

function CardGridSection({ section }) {
  return (
    <section className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,242,0.96))]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-3xl  text-foreground md:text-4xl">{section.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {section.items?.map((item) => (
            <Card key={item.title} className="shadow-theme-sm border-border/80 bg-card/95">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{item.title || item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{item.body || item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function GuideGridSection({ section }) {
  const palette = ['bg-color-secondary-700 text-white', 'bg-[var(--color-secondary-alt)] text-white', 'bg-blue-400 text-white', 'bg-[var(--site-secondary)] text-white', 'bg-blue-200 text-foreground', 'bg-[var(--color-secondary-alt)] text-white']

  const cards = (section.items || []).slice(0, 6).map((item, index) => ({
    number: item.number || String(index + 1).padStart(2, '0'),
    title: item.title || item.question,
    copy: item.body || item.answer,
    href: item.href,
    image: getImageUrl(item.imageAsset, item.image),
    imageAlt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
  }))

  return (
    <section className="border-b border-border/60 bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-3xl text-foreground md:text-4xl">{section.title}</h2>
        </div>
        <GuideCardGrid cards={cards} columnsClassName="md:grid-cols-2 xl:grid-cols-3" palette={palette} />
      </div>
    </section>
  )
}

function ServiceGridSection({ section }) {
  const palette = ['bg-blue-200 text-foreground', 'bg-primary text-primary-foreground', 'bg-[var(--color-secondary-alt)] text-white', 'bg-blue-400 text-white', 'bg-[var(--site-secondary)] text-white', 'bg-blue-200 text-foreground']
  const cards = (section.items || []).slice(0, 6).map((item, index) => ({
    number: item.number || String(index + 1).padStart(2, '0'),
    title: item.title || item.question,
    copy: item.body || item.answer,
    href: item.href,
    image: getImageUrl(item.imageAsset, item.image),
    imageAlt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
    ctaLabel: item.eyebrow,
  }))
  return (
    <section className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.96))]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          {section.eyebrow ? (
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-foreground">
              {section.eyebrow}
            </Badge>
          ) : null}
          <h2 className="mt-5 text-3xl tracking-tight text-foreground md:text-4xl">{section.title}</h2>
          {section.body ? <p className="mt-4 text-base leading-8 text-muted-foreground">{section.body}</p> : null}
        </div>
        <GuideCardGrid cards={cards} columnsClassName="md:grid-cols-2 xl:grid-cols-3" palette={palette} />
      </div>
    </section>
  )
}

function StepsSection({ section }) {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl tracking-tight text-foreground md:text-4xl">{section.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {section.items?.map((item, index) => (
            <Card key={item.title} className="border-border/80 bg-card">
              <CardHeader className="gap-4">
                <Badge className="w-fit rounded-full bg-secondary/90 px-3 py-1 text-secondary-foreground">Step {index + 1}</Badge>
                <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{item.body}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({ section }) {
  return (
    <section className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,0.98))]">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl tracking-tight text-foreground md:text-4xl">{section.title}</h2>
        </div>
        <div className="space-y-4">
          {section.items?.map((item) => (
            <Card key={item.question} className="border-border/80 bg-card">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HailMapSection({ section }) {
  return (
    <section className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,244,239,0.98))]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <HailWeatherLookup section={section} />
      </div>
    </section>
  )
}

function CtaSection({ section }) {
  return (
    <section className="bg-secondary py-20 text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.4fr_0.8fr] lg:px-10">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-secondary-foreground/65">Platform next step</p>
          <h2 className="mt-4 text-3xl tracking-tight md:text-4xl">{section.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-secondary-foreground/78">{section.body}</p>
        </div>
        <div className="flex items-end justify-start lg:justify-end">
          <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
            <Link href={section.ctaHref || '/dashboard'}>{section.ctaLabel || 'Continue'}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
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
    <section className="border-b border-border/60 bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))] py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="space-y-4">
          {section.eyebrow ? <p className="text-sm uppercase tracking-[0.22em] text-white/58">{section.eyebrow}</p> : null}
          <h2 className="max-w-3xl text-3xl tracking-tight md:text-4xl">{section.title}</h2>
          <p className="max-w-2xl text-base leading-8 text-white/78">{section.body}</p>
        </div>
        <Card className="gap-0 border-white/12 bg-white/6 text-white backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">Get matched with a roofing pro</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadCaptureForm context={leadContext} compact buttonLabel={section.ctaLabel || 'Request a roofing intro'} className="grid gap-4" inputClassName="rounded-md border border-white/16 bg-white/6 px-3 py-2 text-white placeholder:text-white/48" labelClassName="text-white/70" checkboxClassName="accent-white" messageClassName="text-left" />
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
  const style = {
    '--site-primary': site.brand?.primary || 'var(--color-primary)',
    '--site-secondary': site.brand?.secondary || 'var(--color-secondary)',
    '--site-accent': site.brand?.accent || 'var(--color-secondary-500)',
    '--site-surface': site.brand?.surface || 'var(--color-warm-bg)',
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        ...style,
        backgroundColor: 'var(--site-surface)',
      }}
    >
      {useSolarShell ? (
        <Header />
      ) : (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
            <Link href="/" className="flex min-w-0 flex-col">
              <span className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{site.brand?.eyebrow}</span>
              <span className="text-xl font-semibold tracking-tight text-foreground">{site.name}</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {navigation.map((item) => (
                <Link key={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href={item.href}>
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
        {page.sections.map((section, index) => {
          const Component = sectionRenderers[section.type]

          if (!Component) {
            return null
          }

          return <Component key={`${section.type}-${index}`} page={page} section={section} site={site} pathname={pathname} />
        })}
      </main>

      {useSolarShell ? (
        <Footer />
      ) : (
        <footer className="border-t border-border/60 bg-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-10">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{site.categoryLabel}</p>
              <h2 className="text-2xl tracking-tight text-foreground">{site.name}</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{site.seo?.description}</p>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
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
