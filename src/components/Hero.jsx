import Button from './Button'
import Card from './Card'
import Image from 'next/image'
import ImageFader from './ImageFader'
import PortableTextContent from './PortableTextContent'
import { getDevSectionAttributes } from './dev/DevTrace'
import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { getHeroImageUrl, getImageAlt, hasImageSource } from '@/lib/platform/imageSource'

export default function Hero({ heroSection = null, sectionId = 'hero-homepage' }) {
  const heroImageUrl = getHeroImageUrl(heroSection?.heroAsset, heroSection?.heroImage)
  const hasHeroImage = hasImageSource(heroSection?.heroAsset, heroSection?.heroImage)
  const heroSlides = Array.isArray(heroSection?.heroSlides)
    ? heroSection.heroSlides
        .map((item) => ({
          src: getHeroImageUrl(item?.imageAsset, item?.image),
          alt: getImageAlt(item?.imageAsset, item?.image, item?.title || ''),
        }))
        .filter((image) => image.src)
    : []
  const usesSlidesOnly = heroSection?.heroMediaMode === 'slides'
  const hasHeroSlides = heroSlides.length > 0
  const hasHeroBackdropMedia = hasHeroImage || hasHeroSlides
  const heroTextColor = heroSection?.heroTextColor || (hasHeroBackdropMedia ? '#ffffff' : undefined)
  const { overlayStyle } = getHeroOverlayAppearance(heroSection)
  const softTextColor = heroTextColor ? hexToRgba(heroTextColor, 0.78) : undefined
  const cardBackground = hasHeroBackdropMedia ? 'rgba(255, 255, 255, 0.08)' : undefined
  const cardBorder = hasHeroBackdropMedia ? 'rgba(255, 255, 255, 0.16)' : undefined
  const rotatingHeroImages = (usesSlidesOnly && hasHeroSlides ? heroSlides : hasHeroSlides ? heroSlides : [
    {
      src: heroImageUrl,
      alt: getImageAlt(heroSection?.heroAsset, heroSection?.heroImage, ''),
    },
  ]).filter((image, index, images) => image.src && images.findIndex((entry) => entry.src === image.src) === index)
  const primaryHeroImage = rotatingHeroImages[0] || null
  const hasRotatingHeroImages = rotatingHeroImages.length > 1

  const eyebrow = heroSection?.eyebrow || 'Austin averages 228 sunny days a year'
  const titlePrimary = heroSection?.titlePrimary || 'Solar &'
  const titleAccent = heroSection?.titleAccent || 'Roofing, simplified.'
  const primaryAction = heroSection?.actions?.[0] || null
  const primaryActionLabel = primaryAction?.label || 'Talk to a Solar Pro'
  const primaryActionHref = primaryAction?.href || '#consultation'
  const inlineMetric = Array.isArray(heroSection?.metrics)
    ? heroSection.metrics.find((metric) => metric?.label && metric?.value) || null
    : null
  const inlineMetricLabel = inlineMetric?.label || 'Typical Austin Payback'
  const inlineMetricValue = inlineMetric?.value || '7–9 years'
  const cardCopy =
    heroSection?.cardCopy ||
    heroSection?.body ||
    'Straight answers on Austin solar costs, incentives, and whether the math works for your home.'

  return (
    <section
      className="relative min-h-[80vh] text-body overflow-x-hidden type-accent"
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
      {hasRotatingHeroImages ? (
        <ImageFader
          borderRadius="0"
          images={rotatingHeroImages}
          interval={10000}
          fadeDuration={600}
          overlayStyle={overlayStyle}
          showOverlay={Boolean(overlayStyle)}
          showDots={false}
          objectPosition="center"
          className="absolute min-h-[80vh] inset-0 z-0"
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
            quality={70}
            sizes="100vw"
            className="absolute h-full w-full inset-0 object-center object-cover z-0"
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
          quality={70}
          sizes="100vw"
          className="absolute opacity-10 inset-0 object-cover object-top"
        />
      )}
      <div className="flex relative items-center min-h-[80vh] w-[min(80rem,calc(100%-3rem))] mx-auto px-4 py-30 z-20">
        <div className="grid items-end w-full gap-12 pb-12 lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]">
          <div className="solar-fade-up">
            <div className="items-center gap-4 mb-8 inline-flex">
              <div className="flex relative h-3 w-3">
                <span
                  className="absolute rounded-full opacity-75 animate-ping inset-0"
                  style={{ backgroundColor: 'var(--color-primary-300)' }}
                ></span>
                <span className="relative h-3 w-3 bg-primary rounded-full"></span>
              </div>
              <span
                className="font-bold text-[12px] tracking-[0.4em] uppercase"
                style={{ color: heroTextColor || 'var(--color-primary)' }}
              >
                {eyebrow}
              </span>
            </div>

            <h1
              className="mb-10 leading-none! text-[clamp(4.5rem,12vw,9rem)] text-black tracking-[-0.02em] type-display"
              style={heroTextColor ? { color: heroTextColor } : undefined}
            >
              {titlePrimary}
              <br />
              <span
                className="text-transparent [-webkit-text-stroke-width:1px]"
                style={{
                  WebkitTextStrokeColor: heroTextColor || 'black',
                }}
              >
                {titleAccent}
              </span>
            </h1>

            <div className="flex flex-wrap max-md:flex-col items-center max-md:items-start gap-10">
              <Button href={primaryActionHref} size="lg" pill>
                {primaryActionLabel}
              </Button>

              <div className="flex items-center gap-10">
                <div className="hidden md:block h-12 w-px bg-white/60"></div>
                <div>
                  <span
                    className="block mb-1 font-bold text-[12px] tracking-[0.2em] uppercase"
                    style={{ color: softTextColor || 'var(--color-slate-500)' }}
                  >
                    {inlineMetricLabel}
                  </span>
                  <span
                    className="block font-medium text-md"
                    style={{ color: heroTextColor || 'var(--color-slate-800)' }}
                  >
                    {inlineMetricValue}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="solar-fade-up solar-fade-up-delay">
            <Card
              className="p-6 backdrop-blur-md"
              radius="lg"
              style={
                hasHeroImage
                  ? {
                      backgroundColor: cardBackground,
                      borderColor: cardBorder,
                    }
                  : undefined
              }
            >
              <PortableTextContent
                as="div"
                value={cardCopy}
                className="m-0 font-wght-650 leading-7 text-lg"
                style={{ color: heroTextColor || 'var(--color-text-strong)' }}
              />
              <div className="flex gap-2 mt-6">
                <div className="h-1 w-8 bg-primary rounded-full"></div>
                <div className="h-1 w-2 bg-primary rounded-full"></div>
                <div className="h-1 w-2 bg-primary rounded-full"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
