import Image from 'next/image'

import CloudSectionBackground from '@/components/cloud-section-background'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { Button } from '@/components/ui/button'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

function BannerCtaContent({ isCloudTheme, section }) {
  const ctaLabel = String(section?.ctaLabel || '').trim()
  const ctaHref = section?.ctaHref || '#consultation'

  return (
    <div
      className={`relative z-10 grid min-h-66 items-center gap-8 px-6 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:px-12 ${isCloudTheme ? '' : 'text-secondary-foreground'}`}
    >
      <div className="max-w-2xl">
        {section?.eyebrow ? (
          <p
            className={`mb-3 text-xs font-semibold tracking-[0.22em] uppercase ${isCloudTheme ? 'cloud-theme-section__eyebrow' : 'text-secondary-foreground/70'}`}
          >
            {section.eyebrow}
          </p>
        ) : null}
        {section?.title ? (
          <h2
            className={`type-accent m-0 text-3xl tracking-normal md:text-4xl ${isCloudTheme ? 'cloud-theme-section__heading' : ''}`}
          >
            {section.title}
          </h2>
        ) : null}
        {section?.body ? (
          <PortableTextContent
            as="div"
            value={section.body}
            className={`mt-4 max-w-xl text-[1rem] leading-7 ${isCloudTheme ? 'cloud-theme-section__body' : 'text-secondary-foreground/82'}`}
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
  )
}

export function BannerCtaSection({ section, sectionId }) {
  const imageUrl =
    getImageUrl(section?.imageAsset, section?.image, { width: 1600 }) || '/images/solar-install.png'
  const imageAlt = getImageAlt(section?.imageAsset, section?.image, section?.title || 'Consultation banner')
  const showClouds =
    section?.cloudVisibility !== 'hide' &&
    section?.cloudVisibility !== 'off' &&
    section?.cloudVisibility !== false

  return (
    <CloudSectionBackground
      className="relative isolate overflow-hidden px-3 py-24 md:px-6"
      showClouds={showClouds}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/banner-cta-section.jsx',
        content: `banner CTA from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/banner-cta-section.jsx"
        content={`banner CTA from ${section?._type || 'page section'}`}
      />
      <div className="relative z-2 mx-auto grid min-h-66 max-w-304 overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 1280px) calc(100vw - 24px), 1280px"
          className={`object-cover ${showClouds ? 'opacity-75' : ''}`}
        />
        <div
          className={
            showClouds
              ? 'cloud-theme-section__image-overlay absolute inset-0'
              : 'bg-secondary/70 absolute inset-0'
          }
        />
        <BannerCtaContent isCloudTheme={showClouds} section={section} />
      </div>
    </CloudSectionBackground>
  )
}
