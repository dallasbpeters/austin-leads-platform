import Button from './Button'
import Card from './Card'
import Gradient from './Gradient'
import Image from 'next/image'
import ImageFader from './ImageFader'
import { getDevSectionAttributes } from './dev/DevTrace'
import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'
import { getImageAlt, getImageUrl, hasImageSource } from '@/lib/platform/imageSource'

export default function Hero({ heroSection = null, sectionId = 'hero-homepage' }) {
  const heroImageUrl = getImageUrl(heroSection?.heroAsset, heroSection?.heroImage)
  const hasHeroImage = hasImageSource(heroSection?.heroAsset, heroSection?.heroImage)
  const heroTextColor = heroSection?.heroTextColor || (hasHeroImage ? '#ffffff' : undefined)
  const { overlayStyle } = getHeroOverlayAppearance(heroSection)
  const softTextColor = heroTextColor ? hexToRgba(heroTextColor, 0.78) : undefined
  const cardBackground = hasHeroImage ? 'rgba(255, 255, 255, 0.08)' : undefined
  const cardBorder = hasHeroImage ? 'rgba(255, 255, 255, 0.16)' : undefined
  const rotatingHeroImages = [
    {
      src: heroImageUrl,
      alt: getImageAlt(heroSection?.heroAsset, heroSection?.heroImage, ''),
    },
    ...(heroSection?.items || [])
      .map((item) => ({
        src: getImageUrl(item?.imageAsset, item?.image),
        alt: getImageAlt(item?.imageAsset, item?.image, item?.title || ''),
      }))
      .filter((image) => image.src),
  ].filter(
    (image, index, images) => image.src && images.findIndex((entry) => entry.src === image.src) === index,
  )
  const hasRotatingHeroImages = rotatingHeroImages.length > 0

  return (
    <section
      className="radial-grid-bg type-accent text-body relative h-[80vh] overflow-x-hidden"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/Hero.jsx',
        content: 'homepage hero copy + hero media from homepage record',
      })}
    >
      <Gradient
        zIndex={1}
        className={hasHeroImage ? 'opacity-70' : 'opacity-100'}
        style={{ mixBlendMode: hasHeroImage ? 'screen' : 'normal' }}
      />
      {hasRotatingHeroImages ? (
        <ImageFader
          borderRadius="0"
          images={rotatingHeroImages}
          interval={10000}
          fadeDuration={300}
          overlayStyle={overlayStyle}
          showOverlay={Boolean(overlayStyle)}
          showDots={false}
          objectPosition="center"
          className="absolute inset-0 z-[2] min-h-[80vh]"
          imageClassName="object-top"
          backgroundColor={'#000000'}
        />
      ) : (
        <>
          <Image
            src="/assets/hero-bg.png"
            alt=""
            fill
            className="absolute inset-0 z-[2] object-cover object-top opacity-10"
          />
          {overlayStyle ? <div className="absolute inset-0 z-[3]" style={overlayStyle} /> : null}
        </>
      )}
      <div className="relative z-20 mx-auto flex min-h-[80vh] w-[min(80rem,calc(100%-3rem))] items-center px-4 py-30">
        <div className="grid w-full items-end gap-12 pb-12 lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]">
          <div className="solar-fade-up">
            <div className="mb-8 inline-flex items-center gap-4">
              <div className="relative flex h-3 w-3">
                <span className="bg-primary-300 absolute inset-0 animate-ping rounded-full opacity-75"></span>
                <span className="bg-primary relative h-3 w-3 rounded-full"></span>
              </div>
              <span
                className="text-[12px] font-bold tracking-[0.4em] uppercase"
                style={{ color: heroTextColor || 'var(--color-primary)' }}
              >
                Comprehensive Solar and Roofing for Texas Homeowners
              </span>
            </div>

            <h1
              className="type-display -leading-1 mb-10 text-[clamp(4.5rem,12vw,10rem)] tracking-[-0.04em] text-black"
              style={heroTextColor ? { color: heroTextColor } : undefined}
            >
              Texas Solar
              <span
                className="text-transparent [-webkit-text-stroke-width:1px]"
                style={{
                  WebkitTextStrokeColor: heroTextColor || 'black',
                }}
              >
                & Roofing Pros.
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-10 max-md:flex-col max-md:items-start">
              <Button href="#consultation" size="lg" pill>
                Connect with an expert
              </Button>

              <div className="flex items-center gap-6">
                <div className="hidden h-12 w-px bg-white/10 md:block"></div>
                <div>
                  <span
                    className="mb-1 block text-[12px] font-bold tracking-[0.2em] uppercase"
                    style={{ color: softTextColor || 'var(--color-slate-500)' }}
                  >
                    We'll help you understand
                  </span>
                  <span
                    className="block text-[15px] font-medium"
                    style={{ color: heroTextColor || 'var(--color-slate-800)' }}
                  >
                    Hail damage, roof replacement, insurance options, and solar savings
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="solar-fade-up solar-fade-up-delay">
            <Card
              className="p-8 backdrop-blur-[12px]"
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
              <p
                className="m-0 text-lg leading-7 font-light"
                style={{ color: heroTextColor || 'var(--color-text-strong)' }}
              >
                Clear answers on hail and storm damage, roof repairs, dealing with your insurance company, and
                whether solar works for your Texas home.
              </p>
              <div className="mt-6 flex gap-2">
                <div className="bg-primary h-1 w-8 rounded-full"></div>
                <div className="bg-primary h-1 w-2 rounded-full"></div>
                <div className="bg-primary h-1 w-2 rounded-full"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
