import Hero from '@/components/Hero'

/**
 * Multi-tenant section renderer for `_type: 'heroSection'`.
 *
 * This is intentionally a thin forwarder over the canonical Hero component so
 * the platform pages stay in sync with the homepage hero (split headline,
 * video backdrop, slides, overlays, etc.). Per-tenant theming flows through
 * the active `<slug>-theme` CSS class on the document root, not through
 * duplicated component logic.
 */
export function HeroSection({ section, sectionId }) {
  return <Hero heroSection={section} sectionId={sectionId} />
}

export default HeroSection
