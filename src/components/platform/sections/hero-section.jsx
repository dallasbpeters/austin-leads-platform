import Hero from '@/components/hero'

import { isTxChristmasLightsSite, TX_CHRISTMAS_PUBLIC_HERO_FALLBACK_SRC } from '../public-site-utils'

/**
 * Multi-tenant section renderer for `_type: 'heroSection'`.
 *
 * This is intentionally a thin forwarder over the canonical Hero component so
 * the platform pages stay in sync with the homepage hero (split headline,
 * video backdrop, slides, overlays, etc.). Per-tenant theming flows through
 * `[data-public-site]` on `<html>`, not through duplicated component logic.
 */
export const HeroSection = ({ section, sectionId, site }) => {
  const fallbackBackdropSrc = isTxChristmasLightsSite(site) ? TX_CHRISTMAS_PUBLIC_HERO_FALLBACK_SRC : null
  return <Hero heroSection={section} sectionId={sectionId} fallbackBackdropSrc={fallbackBackdropSrc} />
}

export default HeroSection
