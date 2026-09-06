// oxlint-disable func-style jsx-a11y/media-has-caption
import Image from 'next/image'

import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { getHeroImageUrl, getHeroVideoSource, getImageAlt } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'

import Card from './card'
import { getDevSectionAttributes } from './dev/dev-trace'
import HeroActions from './hero-actions'
import ImageFader from './image-fader'
import PortableTextContent from './portable-text-content'

/*
 * The calculator link is root-relative so it works from any page, and carries
 * the calculator section's real DOM id. getSectionDomId() builds that id from
 * the section type plus its slugified title ("See what solar could save"), so
 * a bare `#calculator` matched nothing on the rendered page.
 */
const FALLBACK_HERO_ACTIONS = [
  { label: 'Talk to a Solar Pro', href: '#consultation', variant: 'default' },
  {
    label: 'See how the math works',
    href: '/#calculator-see-what-solar-could-save',
    variant: 'secondary',
  },
]

function resolveHeroMediaMode(heroVideoSource, explicitHeroMediaMode, hasHeroSlides) {
  if (heroVideoSource) {
    return 'video'
  }
  if (explicitHeroMediaMode !== 'slides' && !hasHeroSlides) {
    return 'single'
  }
  if (explicitHeroMediaMode === 'single') {
    return 'single'
  }
  return 'slides'
}

function buildHeroSlides(heroSection) {
  if (!Array.isArray(heroSection?.heroSlides)) {
    return []
  }
  return heroSection.heroSlides
    .map((item) => ({
      src: getHeroImageUrl(item?.imageAsset, item?.image),
      alt: getImageAlt(item?.imageAsset, item?.image, item?.title || ''),
    }))
    .filter((image) => image.src)
}

function getHeroImageSources(heroSection) {
  return {
    heroImageUrl: getHeroImageUrl(heroSection?.heroAsset, heroSection?.heroImage),
    heroVideoSource: getHeroVideoSource(heroSection?.heroVideo, heroSection?.heroVideoAsset),
    explicitHeroMediaMode: heroSection?.heroMediaMode,
  }
}

function getHeroTextValues(heroSection, hasHeroBackdropMedia) {
  const heroTextColor = heroSection?.heroTextColor || (hasHeroBackdropMedia ? '#ffffff' : undefined)
  return {
    body:
      heroSection?.body ||
      'Straight answers on Austin solar costs, incentives, and whether the math works for your home.',
    cardCopy: heroSection?.cardCopy || '',
    eyebrow: heroSection?.eyebrow || 'Austin averages 228 sunny days a year',
    heroTextColor,
    softTextColor: heroTextColor ? hexToRgba(heroTextColor, 0.78) : undefined,
  }
}

function resolveRotatingHeroImages(
  heroMediaMode,
  heroSlides,
  heroImageUrl,
  heroSection,
  fallbackBackdropSrc,
) {
  if (heroMediaMode === 'video') {
    return []
  }
  const base =
    heroMediaMode === 'slides' && heroSlides.length > 0
      ? heroSlides
      : [{ src: heroImageUrl, alt: getImageAlt(heroSection?.heroAsset, heroSection?.heroImage, '') }]
  const deduped = base.filter(
    (image, index, images) => image.src && images.findIndex((entry) => entry.src === image.src) === index,
  )
  if (deduped.length === 0 && fallbackBackdropSrc) {
    return [{ src: fallbackBackdropSrc, alt: 'Festive holiday lights' }]
  }
  return deduped
}

function resolveHeadline(heroSection) {
  const titleRaw = heroSection?.title
  const titlePrimaryRaw = heroSection?.titlePrimary
  const titleAccentRaw = heroSection?.titleAccent
  const hasSingleTitle = (cleanRuntimeString(titleRaw) || '').trim().length > 0
  const hasSplitTitle =
    (cleanRuntimeString(titlePrimaryRaw) || '').trim().length > 0 ||
    (cleanRuntimeString(titleAccentRaw) || '').trim().length > 0
  return {
    useSingleHeadline: hasSingleTitle,
    title: hasSingleTitle ? titleRaw : 'Solar & Roofing, Simplified.',
    titlePrimary: hasSplitTitle ? titlePrimaryRaw : 'Solar &',
    titleAccent: hasSplitTitle ? titleAccentRaw : 'Roofing, simplified.',
  }
}

function resolveHeroActions(heroSection) {
  const configured = (Array.isArray(heroSection?.actions) ? heroSection.actions : [])
    .map((action) => ({ ...action, href: cleanRuntimeHref(action?.href) }))
    .filter((action) => action.href && action.label)
  return configured.length ? configured : FALLBACK_HERO_ACTIONS
}

function resolveHeroMetrics(heroSection) {
  return (Array.isArray(heroSection?.metrics) ? heroSection.metrics : []).filter(
    (metric) => metric?.label && metric?.value,
  )
}

function getBackdropCardValue(hasHeroBackdropMedia, lightValue, darkValue) {
  return hasHeroBackdropMedia ? lightValue : darkValue
}

function HeroBackdrop({ heroMediaMode, heroVideoSource, rotatingHeroImages, overlayStyle }) {
  const primaryHeroImage = rotatingHeroImages[0] || null
  const hasRotatingHeroImages = rotatingHeroImages.length > 1

  if (heroMediaMode === 'video') {
    return (
      <>
        <video
          key={heroVideoSource.src}
          className="absolute inset-0 z-0 h-full w-full bg-black object-cover object-center"
          poster={heroVideoSource.poster || undefined}
          autoPlay={heroVideoSource.autoplay}
          loop={heroVideoSource.loop}
          muted={heroVideoSource.muted}
          controls={heroVideoSource.controls}
          playsInline={heroVideoSource.playsInline}
          preload="metadata"
          aria-label={heroVideoSource.alt || undefined}
        >
          <source src={heroVideoSource.src} type={heroVideoSource.type || undefined} />
        </video>
        <div className="absolute inset-0 z-10" style={overlayStyle} />
      </>
    )
  }

  if (hasRotatingHeroImages) {
    return (
      <ImageFader
        borderRadius="0"
        images={rotatingHeroImages}
        interval={10_000}
        fadeDuration={700}
        overlayStyle={overlayStyle}
        showOverlay={Boolean(overlayStyle)}
        showDots={false}
        objectPosition="center"
        className="absolute inset-0 z-0 min-h-[80vh]"
        imageClassName="object-top"
        backgroundColor="#000000"
        initialPriority
      />
    )
  }

  if (primaryHeroImage) {
    return (
      <>
        <Image
          src={primaryHeroImage.src}
          alt={primaryHeroImage.alt || ''}
          fill
          priority
          fetchPriority="high"
          quality={68}
          sizes="100vw"
          className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 z-10" style={overlayStyle} />
      </>
    )
  }

  return (
    <Image
      src="/assets/hero-bg.png"
      alt=""
      fill
      priority
      fetchPriority="high"
      quality={90}
      sizes="100vw"
      className="absolute inset-0 object-cover object-top opacity-10"
    />
  )
}

function HeroEyebrow({ eyebrow, heroTextColor }) {
  return (
    <div className="mb-8 inline-flex items-center gap-4">
      <div className="relative flex h-3 w-3">
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-75"
          style={{ backgroundColor: 'var(--color-wattle)' }}
        />
        <span className="relative h-3 w-3 rounded-full bg-(--color-wattle)" />
      </div>
      <span
        className="text-[12px] font-bold tracking-[0.4em] uppercase"
        style={{ color: heroTextColor || 'var(--color-primary)' }}
      >
        {eyebrow}
      </span>
    </div>
  )
}

function HeroHeadline({ useSingleHeadline, title, titlePrimary, titleAccent, heroTextColor }) {
  if (useSingleHeadline) {
    return (
      <h1
        className="type-display mb-3 text-[clamp(3.5rem,8vw,5rem)] leading-tight tracking-[-0.02em] text-black"
        style={heroTextColor ? { color: heroTextColor } : undefined}
      >
        {title}
      </h1>
    )
  }

  return (
    <h1
      className="type-display mb-10 text-[clamp(2.5rem,6vw,5rem)] leading-none! tracking-[-0.02em] text-black"
      style={heroTextColor ? { color: heroTextColor } : undefined}
    >
      {titlePrimary}
      <br />
      <span
        style={{
          color: 'var(--color-amber-400)',
          paintOrder: 'stroke fill',
        }}
      >
        {titleAccent}
      </span>
    </h1>
  )
}

function HeroMetricTile({
  metric,
  index,
  metricTileBackground,
  metricTileBorder,
  metricLabelColor,
  metricValueColor,
}) {
  return (
    <div
      key={buildRuntimeKey('hero-metric', metric.label, metric.value, index)}
      className="rounded-xl border px-4 py-3"
      style={{ backgroundColor: metricTileBackground, borderColor: metricTileBorder }}
    >
      <div
        className="text-[11px] font-semibold tracking-[0.18em] uppercase"
        style={{ color: metricLabelColor }}
      >
        {metric.label}
      </div>
      <div className="text-lg font-semibold tracking-normal" style={{ color: metricValueColor }}>
        {metric.value}
      </div>
    </div>
  )
}

function HeroMetrics({
  heroMetrics,
  metricTileBackground,
  metricTileBorder,
  metricLabelColor,
  metricValueColor,
}) {
  return (
    <div className="grid gap-3">
      <div className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: metricLabelColor }}>
        Snapshot
      </div>
      {heroMetrics.map((metric, index) => (
        <HeroMetricTile
          key={buildRuntimeKey('hero-metric', metric.label, metric.value, index)}
          metric={metric}
          index={index}
          metricTileBackground={metricTileBackground}
          metricTileBorder={metricTileBorder}
          metricLabelColor={metricLabelColor}
          metricValueColor={metricValueColor}
        />
      ))}
    </div>
  )
}

function HeroCardCopy({ cardCopy, heroTextColor }) {
  return (
    <>
      <PortableTextContent
        as="div"
        value={cardCopy}
        className="font-wght-650 m-0 text-lg leading-7"
        style={{ color: heroTextColor || 'var(--color-text-strong)' }}
      />
      <div className="mt-6 flex gap-2">
        <div className="bg-primary h-1 w-8 rounded-full" />
        <div className="bg-primary h-1 w-2 rounded-full" />
        <div className="bg-primary h-1 w-2 rounded-full" />
      </div>
    </>
  )
}

function HeroAside({
  hasHeroMetrics,
  heroMetrics,
  metricTileBackground,
  metricTileBorder,
  metricLabelColor,
  metricValueColor,
  cardCopy,
  cardBackground,
  cardBorder,
  heroTextColor,
}) {
  if (!hasHeroMetrics && !cardCopy) {
    return null
  }

  return (
    <div className="solar-fade-up solar-fade-up-delay">
      <Card
        className="p-6 backdrop-blur-md"
        radius="lg"
        style={{ backgroundColor: cardBackground, borderColor: cardBorder }}
      >
        {hasHeroMetrics ? (
          <HeroMetrics
            heroMetrics={heroMetrics}
            metricTileBackground={metricTileBackground}
            metricTileBorder={metricTileBorder}
            metricLabelColor={metricLabelColor}
            metricValueColor={metricValueColor}
          />
        ) : (
          <HeroCardCopy cardCopy={cardCopy} heroTextColor={heroTextColor} />
        )}
      </Card>
    </div>
  )
}

export default function Hero({
  heroSection = null,
  sectionId = 'hero-homepage',
  fallbackBackdropSrc = null,
}) {
  const { heroImageUrl, heroVideoSource, explicitHeroMediaMode } = getHeroImageSources(heroSection)
  const heroSlides = buildHeroSlides(heroSection)
  const heroMediaMode = resolveHeroMediaMode(heroVideoSource, explicitHeroMediaMode, heroSlides.length > 0)
  const rotatingHeroImages = resolveRotatingHeroImages(
    heroMediaMode,
    heroSlides,
    heroImageUrl,
    heroSection,
    fallbackBackdropSrc,
  )
  const hasHeroBackdropMedia = heroMediaMode === 'video' || rotatingHeroImages.length > 0
  const { body, cardCopy, eyebrow, heroTextColor, softTextColor } = getHeroTextValues(
    heroSection,
    hasHeroBackdropMedia,
  )
  const { overlayStyle } = getHeroOverlayAppearance(heroSection)
  const cardBackground = getBackdropCardValue(hasHeroBackdropMedia, 'rgba(255, 255, 255, 0.15)')
  const cardBorder = getBackdropCardValue(hasHeroBackdropMedia, 'rgba(255, 255, 255, 0.16)')
  const { useSingleHeadline, title, titlePrimary, titleAccent } = resolveHeadline(heroSection)
  const heroMetrics = resolveHeroMetrics(heroSection)
  const hasHeroMetrics = heroMetrics.length > 0
  const metricTileBackground = getBackdropCardValue(
    hasHeroBackdropMedia,
    'rgba(255, 255, 255, 0.20)',
    'var(--color-card, var(--color-surface-elevated))',
  )
  const metricTileBorder = getBackdropCardValue(
    hasHeroBackdropMedia,
    'rgba(255, 255, 255, 0.18)',
    'var(--color-border)',
  )
  const heroActions = resolveHeroActions(heroSection)
  const hasHeroAside = hasHeroMetrics || Boolean(cardCopy)

  return (
    <section
      className="text-body type-accent relative top-0 min-h-[50vh] overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(var(--color-grid) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/hero.jsx',
        content: 'homepage hero copy + hero media from homepage record',
      })}
    >
      <HeroBackdrop
        heroMediaMode={heroMediaMode}
        heroVideoSource={heroVideoSource}
        rotatingHeroImages={rotatingHeroImages}
        overlayStyle={overlayStyle}
      />
      <div className="relative z-20 mx-auto flex min-h-[60vh] w-[min(80rem,calc(100%-3rem))] items-center px-2 pt-40 md:px-4">
        <div
          className={`grid w-full items-end gap-12 pb-12 ${hasHeroAside ? 'lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]' : 'lg:grid-cols-1'}`}
        >
          <div className="solar-fade-up max-w-4xl">
            <HeroEyebrow eyebrow={eyebrow} heroTextColor={heroTextColor} />
            <HeroHeadline
              useSingleHeadline={useSingleHeadline}
              title={title}
              titlePrimary={titlePrimary}
              titleAccent={titleAccent}
              heroTextColor={heroTextColor}
            />
            {body ? (
              <PortableTextContent
                as="div"
                value={body}
                className="mb-10 max-w-2xl text-lg leading-7"
                style={{ color: softTextColor || 'var(--color-muted-foreground)' }}
              />
            ) : null}
            <div className="flex flex-wrap items-center gap-6 max-md:flex-col max-md:items-start">
              <div className="flex flex-wrap gap-3">
                <HeroActions actions={heroActions} textColor={heroTextColor} />
              </div>
            </div>
          </div>
          <HeroAside
            hasHeroMetrics={hasHeroMetrics}
            heroMetrics={heroMetrics}
            metricTileBackground={metricTileBackground}
            metricTileBorder={metricTileBorder}
            metricLabelColor={softTextColor || 'var(--color-slate-500)'}
            metricValueColor={heroTextColor || 'var(--color-text-strong)'}
            cardCopy={cardCopy}
            cardBackground={cardBackground}
            cardBorder={cardBorder}
            heroTextColor={heroTextColor}
          />
        </div>
      </div>
    </section>
  )
}
