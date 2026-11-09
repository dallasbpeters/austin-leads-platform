import Image from '@/components/site-image'

import CloudSectionBackground from '@/components/cloud-section-background'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { Button } from '@/components/ui/button'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { shouldShowClouds } from '@/lib/platform/section-helpers'
import { surfaceTone } from '@/lib/platform/surface-tone'
import { cleanRuntimeString } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

const BUTTON_VARIANTS = new Set(['default', 'secondary', 'outline', 'dark'])

/*
 * The Banner style settings (Sanity bannerCtaSection). Overlay color, strength and text
 * color only apply without clouds; with clouds on, the cloud theme sets them.
 */
function bannerStyle(section, isCloudTheme) {
  const layout = cleanRuntimeString(section?.bannerLayout) === 'centered' ? 'centered' : 'split'
  const variant = cleanRuntimeString(section?.bannerButtonVariant)
  const overlayColor = cleanRuntimeString(section?.bannerOverlayColor) || null
  const opacity = Number(section?.bannerOverlayOpacity)
  const chosenTone = cleanRuntimeString(section?.bannerTextTone)
  // "Light"/"Dark" name the text; surfaceTone names the overlay, so a light overlay means dark text.
  const autoTone = overlayColor ? surfaceTone(overlayColor) : null
  let textOn = null
  if (chosenTone === 'light') {
    textOn = 'dark'
  } else if (chosenTone === 'dark') {
    textOn = 'light'
  } else if (autoTone) {
    textOn = autoTone
  }
  return {
    layout,
    buttonVariant: BUTTON_VARIANTS.has(variant) ? variant : 'default',
    overlay: isCloudTheme
      ? null
      : {
          '--banner-overlay': cleanRuntimeString(section?.bannerOverlayGradient) || overlayColor || undefined,
          '--banner-overlay-opacity': Number.isFinite(opacity)
            ? Math.min(Math.max(opacity, 0), 100) / 100
            : undefined,
        },
    textOn: isCloudTheme ? null : textOn,
  }
}

function BannerCtaContent({ isCloudTheme, section, style }) {
  const ctaLabel = String(section?.ctaLabel || '').trim()
  const ctaHref = section?.ctaHref || '#consultation'

  return (
    <div
      className={cn(
        'banner-cta__content',
        !isCloudTheme && 'banner-cta__content--solid',
        style.layout === 'centered' && 'banner-cta__content--centered',
        style.textOn && `banner-cta__content--on-${style.textOn}`,
      )}
    >
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
        <Button
          href={ctaHref}
          variant={style.buttonVariant}
          size="md"
          className={cn(
            'banner-cta__button',
            style.buttonVariant === 'outline' && 'banner-cta__button--outline',
          )}
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
  const showClouds = shouldShowClouds(section?.cloudVisibility)
  const style = bannerStyle(section, showClouds)

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
          style={style.overlay || undefined}
        />
        <BannerCtaContent isCloudTheme={showClouds} section={section} style={style} />
      </div>
    </CloudSectionBackground>
  )
}
