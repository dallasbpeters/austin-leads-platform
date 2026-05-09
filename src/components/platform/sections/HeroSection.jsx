import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { getHeroImageUrl, getImageAlt, hasImageSource } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'

export function HeroSection({ page, section, sectionId, editAttributes = {} }) {
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
        markup: 'src/components/platform/sections/HeroSection.jsx',
        content: `page record from ${page?.source || 'fixture'} + hero section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/HeroSection.jsx"
        content={`page record from ${page?.source || 'fixture'} + hero section from ${section?._type || 'page section'}`}
      />
      {hasHeroImage ? (
        <>
          <div className="absolute inset-0 z-2">
            <Image
              width={1920}
              height={1080}
              quality={90}
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
            ? 'grid relative max-w-7xl gap-10 mx-auto px-3 md:px-6 py-14 lg:px-10 place-content-center z-10 lg:grid-cols-[1.35fr_0.95fr]'
            : 'grid relative max-w-10xl gap-10 mx-auto px-3 md:px-6 py-14 lg:px-10 place-content-center z-10 lg:grid-cols-1'
        }
      >
        <div className="space-y-6">
          <Badge
            variant="outline"
            className={
              heroTextColor
                ? 'bg-transparent border-transparent'
                : 'text-foreground bg-primary/5 border-primary/20'
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
                if (!href) return null
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
                  ? 'gap-0 bg-white/8 border-white/15 shadow-theme-glass backdrop-blur'
                  : 'gap-0 bg-background/10 border-border/70 shadow-theme-glass-soft backdrop-blur'
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
                        ? 'px-4 py-4 bg-white/8 border border-white/15 rounded-xl'
                        : 'px-4 py-4 bg-card/90 border border-border/70 rounded-xl'
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
