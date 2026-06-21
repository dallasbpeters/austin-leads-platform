import Image from 'next/image'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { Button } from '@/components/ui/button'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

export function BannerCtaSection({ section, sectionId }) {
  const imageUrl =
    getImageUrl(section?.imageAsset, section?.image, { width: 1600 }) || '/images/solar-install.png'
  const imageAlt = getImageAlt(section?.imageAsset, section?.image, section?.title || 'Consultation banner')
  const ctaLabel = String(section?.ctaLabel || '').trim()
  const ctaHref = section?.ctaHref || '#consultation'

  return (
    <section
      className="bg-background px-3 py-24 md:px-6"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/BannerCtaSection.jsx',
        content: `banner CTA from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/BannerCtaSection.jsx"
        content={`banner CTA from ${section?._type || 'page section'}`}
      />
      <div className="relative mx-auto grid min-h-66 max-w-7xl overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 1280px) calc(100vw - 24px), 1280px"
          className="object-cover"
        />
        <div className="bg-secondary/70 absolute inset-0" />
        <div className="text-secondary-foreground relative z-10 grid min-h-66 items-center gap-8 px-6 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:px-12">
          <div className="max-w-2xl">
            {section?.eyebrow ? (
              <p className="text-secondary-foreground/70 mb-3 text-xs font-semibold tracking-[0.22em] uppercase">
                {section.eyebrow}
              </p>
            ) : null}
            {section?.title ? (
              <h2 className="type-accent m-0 text-3xl tracking-normal md:text-4xl">{section.title}</h2>
            ) : null}
            {section?.body ? (
              <PortableTextContent
                as="div"
                value={section.body}
                className="text-secondary-foreground/82 mt-4 max-w-xl text-[1rem] leading-7"
              />
            ) : null}
          </div>
          {ctaLabel ? (
            <Button
              href={ctaHref}
              shape="pill"
              size="md"
              className="h-10 min-w-35 justify-self-start md:justify-self-center"
            >
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
