import Button from './Button'
import Card from './Card'
import Image from 'next/image'
import { getHeroOverlayAppearance, hexToRgba } from '@/lib/platform/heroAppearance'

export default function Hero({ heroSection = null }) {
  const heroImageUrl = heroSection?.heroImage?.urls?.regular || heroSection?.heroImage?.urls?.small
  const hasHeroImage = Boolean(heroImageUrl)
  const heroTextColor = heroSection?.heroTextColor || (hasHeroImage ? '#ffffff' : undefined)
  const { overlayStyle } = getHeroOverlayAppearance(heroSection)
  const softTextColor = heroTextColor ? hexToRgba(heroTextColor, 0.78) : undefined
  const cardBackground = hasHeroImage ? 'rgba(255, 255, 255, 0.08)' : undefined
  const cardBorder = hasHeroImage ? 'rgba(255, 255, 255, 0.16)' : undefined

  return (
    <section
      className="type-accent text-solar-body relative min-h-[80vh] overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(var(--color-grid) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {hasHeroImage ? (
        <>
          <img src={heroImageUrl} alt={heroSection?.heroImage?.alt || ''} className="absolute inset-0 z-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 z-10" style={overlayStyle} />
        </>
      ) : (
        <Image src="/assets/hero-bg.png" alt="" fill className="absolute inset-0 object-cover object-top opacity-10" />
      )}
      <div className="relative z-20 mx-auto flex min-h-[80vh] w-[min(80rem,calc(100%-3rem))] items-center px-4 py-30">
        <div className="grid w-full items-end gap-12 pb-12 lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]">
          <div className="solar-fade-up">
            <div className="mb-8 inline-flex items-center gap-4">
              <div className="relative flex h-3 w-3">
                <span className="bg-solar-primary-300 absolute inset-0 animate-ping rounded-full opacity-75"></span>
                <span className="bg-solar-primary relative h-3 w-3 rounded-full"></span>
              </div>
              <span className="text-[12px] font-bold uppercase tracking-[0.4em]" style={{ color: heroTextColor || 'var(--color-primary)' }}>
                Austin averages 228 sunny days a year
              </span>
            </div>

            <h1 className="type-display mb-10 text-[clamp(4.5rem,12vw,10rem)] tracking-[-0.04em] text-black" style={heroTextColor ? { color: heroTextColor } : undefined}>
              Solar,
              <br />
              <span
                className="text-transparent [-webkit-text-stroke-width:1px]"
                style={{
                  WebkitTextStrokeColor: heroTextColor || 'black',
                }}
              >
                simplified.
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-10 max-md:flex-col max-md:items-start">
              <Button href="#consultation" size="lg" pill>
                Talk to a Solar Pro
              </Button>

              <div className="flex items-center gap-6">
                <div className="hidden h-12 w-px bg-white/10 md:block"></div>
                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: softTextColor || 'var(--color-slate-500)' }}>
                    Typical Austin Payback
                  </span>
                  <span className="block text-sm font-medium" style={{ color: heroTextColor || 'var(--color-slate-800)' }}>
                    7–9 years
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
              <p className="m-0 text-lg font-light leading-7" style={{ color: heroTextColor || 'var(--color-text-strong)' }}>
                Straight answers on Austin solar costs, incentives, and whether the math works for your home.
              </p>
              <div className="mt-6 flex gap-2">
                <div className="bg-solar-primary h-1 w-8 rounded-full"></div>
                <div className="bg-solar-primary h-1 w-2 rounded-full"></div>
                <div className="bg-solar-primary h-1 w-2 rounded-full"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
