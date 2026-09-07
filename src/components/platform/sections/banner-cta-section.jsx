import Image from 'next/image'

import CloudSectionBackground from '@/components/cloud-section-background'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { Button } from '@/components/ui/button'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { cn } from '@/lib/utils'

function BannerCtaContent({ isCloudTheme, section }) {
  const ctaLabel = String(section?.ctaLabel || '').trim()
  const ctaHref = section?.ctaHref || '#consultation'

  return (
    <div className={cn('banner-cta__content', !isCloudTheme && 'banner-cta__content--solid')}>
      <div className="banner-cta__copy">
        {section?.eyebrow ? (
          <p
            className={cn('banner-cta__eyebrow text-size-90', isCloudTheme && 'cloud-theme-section__eyebrow')}
          >
            {section.eyebrow}
          </p>
        ) : null}
        {section?.title ? (
          <h2
            className={cn('banner-cta__title text-fluid-500', isCloudTheme && 'cloud-theme-section__heading')}
          >
            {section.title}
          </h2>
        ) : null}
        {section?.body ? (
          <PortableTextContent
            as="div"
            value={section.body}
            className={cn('banner-cta__body text-size-100', isCloudTheme && 'cloud-theme-section__body')}
          />
        ) : null}
      </div>
      {ctaLabel ? (
        <Button href={ctaHref} shape="pill" size="md" className="banner-cta__button">
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
      className="banner-cta"
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
      <div className="banner-cta__frame">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 1280px) calc(100vw - 24px), 1280px"
          className={cn('banner-cta__image', showClouds && 'banner-cta__image--dimmed')}
        />
        <div
          className={cn(
            'banner-cta__overlay',
            showClouds ? 'cloud-theme-section__image-overlay' : 'banner-cta__overlay--solid',
          )}
        />
        <BannerCtaContent isCloudTheme={showClouds} section={section} />
      </div>
    </CloudSectionBackground>
  )
}
