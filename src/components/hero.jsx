// oxlint-disable func-style jsx-a11y/media-has-caption
import { ArrowUpRight } from 'iconoir-react'
import Image from 'next/image'
import Link from 'next/link'

import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { getHeroImageUrl, getHeroVideoSource, getImageAlt } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

import Card from './card'
import CloudBackground from './cloud-background'
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
function resolveHeroMediaMode(heroVideoSource, explicitHeroMediaMode, hasHeroSlides) {
  if (explicitHeroMediaMode === 'clouds') {
    return 'clouds'
  }
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
  if (heroMediaMode === 'video' || heroMediaMode === 'clouds') {
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
  // No fallback buttons: a hero without actions in Sanity shows none.
  return configured
}

function resolveHeroMetrics(heroSection) {
  return (Array.isArray(heroSection?.metrics) ? heroSection.metrics : []).filter(
    (metric) => metric?.label && metric?.value,
  )
}

function getBackdropCardValue(hasHeroBackdropMedia, lightValue, darkValue) {
  return hasHeroBackdropMedia ? lightValue : darkValue
}

function HeroBackdrop({ heroMediaMode, heroVideoSource, rotatingHeroImages, overlayStyle, cutout }) {
  const primaryHeroImage = rotatingHeroImages[0] || null
  const hasRotatingHeroImages = rotatingHeroImages.length > 1

  /* Sky tone and drifting clouds come from CloudBackground; the cutout (a transparent PNG) sits over them. */
  if (heroMediaMode === 'clouds') {
    return (
      <>
        <CloudBackground density="regular" />
        {cutout?.url ? (
          <Image
            src={cutout.url}
            alt={cutout.alt || ''}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="solar-hero__cutout"
          />
        ) : null}
      </>
    )
  }

  if (heroMediaMode === 'video') {
    return (
      <>
        <video
          key={heroVideoSource.src}
          className="solar-hero__media solar-hero__media--video"
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
        <div className="solar-hero__overlay" style={overlayStyle} />
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
        className="solar-hero__fader"
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
          quality={95}
          sizes="100vw"
          className="solar-hero__media"
        />
        <div className="solar-hero__overlay" style={overlayStyle} />
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
      className="solar-hero__media solar-hero__media--fallback"
    />
  )
}

function HeroHeadline({ useSingleHeadline, title, titlePrimary, titleAccent, heroTextColor }) {
  if (useSingleHeadline) {
    return (
      <h1
        className="solar-hero__title solar-hero__title--single text-fluid-800"
        style={heroTextColor ? { color: heroTextColor } : undefined}
      >
        {title}
      </h1>
    )
  }

  return (
    <h1
      className="solar-hero__title text-fluid-800"
      style={heroTextColor ? { color: heroTextColor } : undefined}
    >
      {titlePrimary}
      <br />
      <span className="solar-hero__title-accent">{titleAccent}</span>
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
      className="solar-hero__metric"
      style={{ backgroundColor: metricTileBackground, borderColor: metricTileBorder }}
    >
      <div className="solar-hero__metric-label text-size-80" style={{ color: metricLabelColor }}>
        {metric.label}
      </div>
      <div className="solar-hero__metric-value text-size-200" style={{ color: metricValueColor }}>
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
    <div className="solar-hero__metrics">
      <div className="solar-hero__metrics-heading text-size-80" style={{ color: metricLabelColor }}>
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
        className="solar-hero__card-copy text-size-200"
        style={{ color: heroTextColor || 'var(--color-text-strong)' }}
      />
      <div className="solar-hero__card-bars" aria-hidden="true">
        <div className="solar-hero__card-bar solar-hero__card-bar--long" />
        <div className="solar-hero__card-bar" />
        <div className="solar-hero__card-bar" />
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
  glass = false,
}) {
  if (!hasHeroMetrics && !cardCopy) {
    return null
  }

  // Over a photo or sky the snapshot matches the homepage glass cards.
  if (glass) {
    return (
      <div className="solar-fade-up solar-fade-up-delay">
        <div className="solar-hero__glass solar-hero__aside-card solar-hero__aside-card--glass">
          {hasHeroMetrics ? (
            <div className="solar-hero__metrics">
              <p className="solar-hero__glass-eyebrow">Snapshot</p>
              {heroMetrics.map((metric, index) => (
                <div
                  key={buildRuntimeKey('hero-metric', metric.label, metric.value, index)}
                  className="solar-hero__metric solar-hero__metric--glass"
                >
                  <div className="solar-hero__metric-label">{metric.label}</div>
                  <div className="solar-hero__metric-value">{metric.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <HeroCardCopy cardCopy={cardCopy} heroTextColor="var(--color-white)" />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="solar-fade-up solar-fade-up-delay">
      <Card
        className="solar-hero__aside-card"
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

function resolveHeroCards(heroSection) {
  return (Array.isArray(heroSection?.heroCards) ? heroSection.heroCards : [])
    .map((card) => ({
      ...card,
      href: cleanRuntimeHref(card?.href),
      imageUrl: cleanRuntimeHref(card?.imageUrl),
    }))
    .filter((card) => card.title)
}

/*
 * Frosted cards along the bottom of the hero (Sanity "Glass cards"). When a
 * card has a link, the link's ::after covers the card so the whole card is
 * the tap target.
 */
function HeroCards({ cards }) {
  return (
    <div className="solar-hero__cards solar-fade-up solar-fade-up-delay">
      {cards.map((card, index) => (
        <article
          key={buildRuntimeKey('hero-card', card.title, card._key, index)}
          className={cn('solar-hero__glass', card.imageUrl && 'solar-hero__glass--with-image')}
        >
          <div className="solar-hero__glass-head">
            <div className="solar-hero__glass-heading">
              <h2 className="solar-hero__glass-title">{card.title}</h2>
              {card.eyebrow ? <p className="solar-hero__glass-eyebrow">{card.eyebrow}</p> : null}
            </div>
            {card.stat ? <p className="solar-hero__glass-stat">{card.stat}</p> : null}
          </div>
          {card.body ? <p className="solar-hero__glass-body">{card.body}</p> : null}
          {card.href ? (
            <Link href={card.href} className="solar-hero__glass-link">
              <span className="solar-hero__glass-link-label">{card.linkLabel || 'Learn more'}</span>
              <span className="solar-hero__glass-link-icon" aria-hidden="true">
                <ArrowUpRight strokeWidth={2} />
              </span>
            </Link>
          ) : null}
          {card.imageUrl ? (
            <img
              src={`${card.imageUrl}?w=800&h=400&fit=crop&auto=format`}
              alt=""
              width={400}
              height={200}
              loading="lazy"
              className="solar-hero__glass-image"
            />
          ) : null}
        </article>
      ))}
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
  const hasHeroBackdropMedia =
    heroMediaMode === 'video' || heroMediaMode === 'clouds' || rotatingHeroImages.length > 0
  const { body, cardCopy, heroTextColor, softTextColor } = getHeroTextValues(
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
  const heroCards = resolveHeroCards(heroSection)
  const hasHeroAside = hasHeroMetrics || Boolean(cardCopy)

  return (
    <section
      className={cn(
        'solar-hero',
        heroMediaMode === 'clouds' ? 'solar-hero--clouds cloud-theme-section' : 'radial-grid-bg',
      )}
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
        cutout={heroSection?.heroCutout}
      />
      <div className={cn('solar-hero__shell', heroCards.length > 0 && 'solar-hero__shell--with-cards')}>
        <div className={cn('solar-hero__layout', hasHeroAside && 'solar-hero__layout--with-aside')}>
          <div className="solar-hero__copy solar-fade-up">
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
                className="solar-hero__body text-size-200"
                style={{ color: softTextColor || 'var(--color-muted-foreground)' }}
              />
            ) : null}
            {/* Glass cards, when set, are the hero's calls to action. */}
            {heroCards.length === 0 && heroActions.length > 0 ? (
              <div className="solar-hero__actions">
                <div className="solar-hero__action-group">
                  <HeroActions actions={heroActions} textColor={heroTextColor} />
                </div>
              </div>
            ) : null}
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
            glass={hasHeroBackdropMedia}
          />
        </div>
        {heroCards.length > 0 ? <HeroCards cards={heroCards} /> : null}
      </div>
    </section>
  )
}
