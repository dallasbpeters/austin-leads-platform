import Image from 'next/image'

import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { getHeroImageUrl, getHeroVideoSource, getImageAlt } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'

import Card from './Card'
import { getDevSectionAttributes } from './dev/DevTrace'
import ImageFader from './ImageFader'
import PortableTextContent from './PortableTextContent'
import HeroActions from './HeroActions'

const FALLBACK_HERO_ACTIONS = [
  { label: 'Talk to a Solar Pro', href: '#consultation', variant: 'default' },
  { label: 'See how the math works', href: '#calculator', variant: 'secondary' },
]

export default function Hero({
  heroSection = null,
  sectionId = 'hero-homepage',
  fallbackBackdropSrc = null,
}) {
  const heroImageUrl = getHeroImageUrl(heroSection?.heroAsset, heroSection?.heroImage)
  const heroVideoSource = getHeroVideoSource(heroSection?.heroVideo, heroSection?.heroVideoAsset)
  const heroSlides = Array.isArray(heroSection?.heroSlides)
    ? heroSection.heroSlides
        .map((item) => ({
          src: getHeroImageUrl(item?.imageAsset, item?.image),
          alt: getImageAlt(item?.imageAsset, item?.image, item?.title || ''),
        }))
        .filter((image) => image.src)
    : []
  const hasHeroSlides = heroSlides.length > 0
  const explicitHeroMediaMode = heroSection?.heroMediaMode
  // Priority: a resolvable video source always wins. An explicit 'slides' choice
  // wins over auto-detected slides. Otherwise fall through to single image.
  const heroMediaMode = heroVideoSource
    ? 'video'
    : explicitHeroMediaMode === 'slides' || (hasHeroSlides && explicitHeroMediaMode !== 'single')
      ? 'slides'
      : 'single'
  const usesVideo = heroMediaMode === 'video'
  const usesSlidesOnly = heroMediaMode === 'slides'
  const rotatingHeroImagesBase = (
    usesVideo
      ? []
      : usesSlidesOnly && hasHeroSlides
        ? heroSlides
        : [
            {
              src: heroImageUrl,
              alt: getImageAlt(heroSection?.heroAsset, heroSection?.heroImage, ''),
            },
          ]
  ).filter(
    (image, index, images) => image.src && images.findIndex((entry) => entry.src === image.src) === index,
  )
  const rotatingHeroImages =
    !usesVideo && rotatingHeroImagesBase.length === 0 && fallbackBackdropSrc
      ? [{ src: fallbackBackdropSrc, alt: 'Festive holiday lights' }]
      : rotatingHeroImagesBase
  const hasHeroBackdropMedia = usesVideo || rotatingHeroImages.length > 0
  const heroTextColor = heroSection?.heroTextColor || (hasHeroBackdropMedia ? '#ffffff' : undefined)
  const { overlayStyle } = getHeroOverlayAppearance(heroSection)
  const softTextColor = heroTextColor ? hexToRgba(heroTextColor, 0.78) : undefined
  const cardBackground = hasHeroBackdropMedia ? 'rgba(255, 255, 255, 0.15)' : undefined
  const cardBorder = hasHeroBackdropMedia ? 'rgba(255, 255, 255, 0.16)' : undefined
  const primaryHeroImage = rotatingHeroImages[0] || null
  const hasRotatingHeroImages = rotatingHeroImages.length > 1

  const eyebrow = heroSection?.eyebrow || 'Austin averages 228 sunny days a year'

  // Decide layout off the *editor-provided* values (cleaned of stega payload),
  // not off display strings — otherwise hardcoded fallbacks would always look
  // truthy and the split-headline branch would never render.
  const titleRaw = heroSection?.title
  const titlePrimaryRaw = heroSection?.titlePrimary
  const titleAccentRaw = heroSection?.titleAccent
  const hasSingleTitle = (cleanRuntimeString(titleRaw) || '').trim().length > 0
  const hasSplitTitle =
    (cleanRuntimeString(titlePrimaryRaw) || '').trim().length > 0 ||
    (cleanRuntimeString(titleAccentRaw) || '').trim().length > 0
  // Single-title wins when present. Split renders whenever single is empty —
  // including the empty/empty case, which falls back to the demo split below.
  const useSingleHeadline = hasSingleTitle
  // Display values: keep stega-encoded strings (so Visual Editing overlays
  // still attach) and only fall back to demo copy when nothing was authored.
  const title = hasSingleTitle ? titleRaw : 'Solar & Roofing, Simplified.'
  const titlePrimary = hasSplitTitle ? titlePrimaryRaw : 'Solar &'
  const titleAccent = hasSplitTitle ? titleAccentRaw : 'Roofing, simplified.'
  const body =
    heroSection?.body ||
    'Straight answers on Austin solar costs, incentives, and whether the math works for your home.'
  const heroMetrics = (Array.isArray(heroSection?.metrics) ? heroSection.metrics : []).filter(
    (metric) => metric?.label && metric?.value,
  )
  const hasHeroMetrics = heroMetrics.length > 0
  const metricTileBackground = hasHeroBackdropMedia
    ? 'rgba(255, 255, 255, 0.20)'
    : 'var(--color-card, var(--color-surface-elevated))'
  const metricTileBorder = hasHeroBackdropMedia ? 'rgba(255, 255, 255, 0.18)' : 'var(--color-border)'
  const metricLabelColor = softTextColor || 'var(--color-slate-500)'
  const metricValueColor = heroTextColor || 'var(--color-text-strong)'
  const configuredHeroActions = (Array.isArray(heroSection?.actions) ? heroSection.actions : [])
    .map((action) => ({
      ...action,
      href: cleanRuntimeHref(action?.href),
    }))
    .filter((action) => action.href && action.label)
  const heroActions = configuredHeroActions.length ? configuredHeroActions : FALLBACK_HERO_ACTIONS
  // `body` already renders as the hero lede in the left column (sourced from
  // `heroSection?.body`). `cardCopy` is a separate field for the right-side
  // glass card so editors can show a distinct callout there. Falling back to
  // `body` here would duplicate the same paragraph in two places.
  const cardCopy = heroSection?.cardCopy || ''
  const hasHeroAside = hasHeroMetrics || Boolean(cardCopy)

  return (
    <section
      className="text-body type-accent relative top-0 min-h-[80vh] overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(var(--color-grid) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/Hero.jsx',
        content: 'homepage hero copy + hero media from homepage record',
      })}
    >
      {usesVideo ? (
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
      ) : hasRotatingHeroImages ? (
        <ImageFader
          borderRadius="0"
          images={rotatingHeroImages}
          interval={10000}
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
      ) : primaryHeroImage ? (
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
      ) : (
        <Image
          src="/assets/hero-bg.png"
          alt=""
          fill
          priority
          fetchPriority="high"
          quality={68}
          sizes="100vw"
          className="absolute inset-0 object-cover object-top opacity-10"
        />
      )}
      <div className="relative z-20 mx-auto flex min-h-[80vh] w-[min(80rem,calc(100%-3rem))] items-center px-2 py-30 md:px-4">
        <div
          className={`grid w-full items-end gap-12 pb-12 ${
            hasHeroAside ? 'lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]' : 'lg:grid-cols-1'
          }`}
        >
          <div className="solar-fade-up max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-4">
              <div className="relative flex h-3 w-3">
                <span
                  className="absolute inset-0 animate-ping rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--color-primary-300)' }}
                ></span>
                <span className="bg-primary relative h-3 w-3 rounded-full"></span>
              </div>
              <span
                className="text-[12px] font-bold tracking-[0.4em] uppercase"
                style={{ color: heroTextColor || 'var(--color-primary)' }}
              >
                {eyebrow}
              </span>
            </div>
            {useSingleHeadline ? (
              <h1
                className="type-display mb-3 text-[clamp(3.5rem,8vw,5rem)] leading-tight tracking-[-0.02em] text-black"
                style={heroTextColor ? { color: heroTextColor } : undefined}
              >
                {title}
              </h1>
            ) : (
              <h1
                className="type-display mb-10 text-[clamp(3.5rem,8vw,8rem)] leading-none! tracking-[-0.02em] text-black"
                style={heroTextColor ? { color: heroTextColor } : undefined}
              >
                {titlePrimary}
                <br />
                <span
                  className="text-transparent [-webkit-text-stroke-width:1px]"
                  style={{ WebkitTextStrokeColor: heroTextColor || 'black' }}
                >
                  {titleAccent}
                </span>
              </h1>
            )}

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

          {hasHeroAside ? (
            <div className="solar-fade-up solar-fade-up-delay">
              <Card
                className="p-6 backdrop-blur-md"
                radius="lg"
                style={{
                  backgroundColor: cardBackground,
                  borderColor: cardBorder,
                }}
              >
                {hasHeroMetrics ? (
                  <div className="grid gap-3">
                    <div
                      className="text-[11px] font-bold tracking-[0.22em] uppercase"
                      style={{ color: metricLabelColor }}
                    >
                      Snapshot
                    </div>
                    {heroMetrics.map((metric, index) => (
                      <div
                        key={buildRuntimeKey('hero-metric', metric.label, metric.value, index)}
                        className="rounded-xl border px-4 py-3"
                        style={{
                          backgroundColor: metricTileBackground,
                          borderColor: metricTileBorder,
                        }}
                      >
                        <div
                          className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                          style={{ color: metricLabelColor }}
                        >
                          {metric.label}
                        </div>
                        <div
                          className="text-lg font-semibold tracking-normal"
                          style={{ color: metricValueColor }}
                        >
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <PortableTextContent
                      as="div"
                      value={cardCopy}
                      className="font-wght-650 m-0 text-lg leading-7"
                      style={{ color: heroTextColor || 'var(--color-text-strong)' }}
                    />
                    <div className="mt-6 flex gap-2">
                      <div className="bg-primary h-1 w-8 rounded-full"></div>
                      <div className="bg-primary h-1 w-2 rounded-full"></div>
                      <div className="bg-primary h-1 w-2 rounded-full"></div>
                    </div>
                  </>
                )}
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
