// oxlint-disable func-style sort-keys
import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import Footer from '@/components/footer'
import GuideShareBar from '@/components/guide-share-bar'
import Header from '@/components/header'
import { isPrimarySiteSlug } from '@/lib/platform/content'
import { isHeroSectionBlock, sectionSetting } from '@/lib/platform/section-helpers'
import { roofingServices } from '@/lib/platform/service-catalog'
import { buildRuntimeKey, cleanRuntimeString } from '@/lib/sanity/stega'
import { getSanityPageEditAttributes, getSanitySectionEditAttributes } from '@/lib/sanity/visualEditing'

import { ChristmasFaviconBlinker } from './christmas-favicon-blinker'
import { getSectionDomId, getSiteBrandStyleVars } from './public-site-utils'
import { CtaSection, RoofingLogoCloudSection, sectionRenderers } from './sections'
import SectionSurface from './sections/section-surface'
import { GenericFooter, GenericHeader } from './shell'

const EMPTY_REVIEWS = []

function computePublicSiteFlags(site, page, pathname) {
  const sections = page.sections || []
  const leadCaptureSectionTypes = new Set(['cta', 'ctaBanner'])
  const pageSlug = cleanRuntimeString(page.slug)
  const pathnameSegments = (pathname || '').split('/').filter(Boolean)
  const topLevelPath = cleanRuntimeString(pathnameSegments[0])
  const serviceSlug = pathnameSegments[0] === 'services' ? cleanRuntimeString(pathnameSegments[1]) : ''
  const roofingServiceSlugs = new Set(roofingServices.map((service) => service.slug))
  const useSolarShell = isPrimarySiteSlug(site.slug)
  const showRoofingLogoCloud =
    useSolarShell &&
    (topLevelPath === 'roofing' || (topLevelPath === 'services' && roofingServiceSlugs.has(serviceSlug)))
  const suppressedSlugs = new Set(['privacy-policy', 'terms', 'services/detach-and-reset', 'thank-you'])

  // The guide share bar sits at the end of the article content — after the last
  // non-CTA section, but above any trailing call-to-action section.
  const ctaSectionTypes = new Set(['cta', 'ctaBanner', 'bannerCta', 'secondaryCTA'])
  const guideShareAfterIndex = sections.reduce(
    (last, section, index) => (ctaSectionTypes.has(section.type) ? last : index),
    -1,
  )

  return {
    useSolarShell,
    sections,
    leadCaptureSectionTypes,
    hasLeadCaptureSection: sections.some((section) => leadCaptureSectionTypes.has(section.type)),
    hasLogosSection: sections.some((section) => sectionSetting(section.type) === 'logos'),
    heroSectionIndex: sections.findIndex(isHeroSectionBlock),
    pageSlug,
    firstLeadCaptureSectionIndex: sections.findIndex((section) => leadCaptureSectionTypes.has(section.type)),
    showRoofingLogoCloud,
    showFallbackRoofingLogoCloud:
      showRoofingLogoCloud && !sections.some((section) => sectionSetting(section.type) === 'logos'),
    suppressDefaultLeadCapture: suppressedSlugs.has(pageSlug),
    isGuidePost: page?.pageType === 'post' && pageSlug.startsWith('guides/'),
    guideShareAfterIndex,
    shareUrl:
      cleanRuntimeString(page?.seo?.canonicalUrl) ||
      (site?.primaryDomain ? `https://${site.primaryDomain}${pathname || '/'}` : ''),
  }
}

function renderSectionItem(section, index, flags, page, site, pathname, reviews, caseStudies) {
  const Component = sectionRenderers[section.type]
  if (!Component) {
    return null
  }

  const sectionId = getSectionDomId(section, index)
  const sectionEditAttrs = getSanitySectionEditAttributes(page, section)

  return (
    <div
      key={buildRuntimeKey('page-section', section._key, section.type, sectionId, index)}
      {...sectionEditAttrs}
    >
      {flags.showFallbackRoofingLogoCloud && index === flags.firstLeadCaptureSectionIndex ? (
        <RoofingLogoCloudSection sectionId="roofing-certifications" />
      ) : null}
      <SectionSurface section={section}>
        <Component
          page={page}
          section={section}
          site={site}
          pathname={pathname}
          reviews={reviews}
          caseStudies={caseStudies}
          sectionId={sectionId}
          editAttributes={sectionEditAttrs}
        />
      </SectionSurface>
      {flags.isGuidePost && index === flags.guideShareAfterIndex ? (
        <GuideShareBar url={flags.shareUrl} title={page.seo?.title || page.title || ''} />
      ) : null}
    </div>
  )
}

export default function PublicSite({
  site,
  page,
  pathname,
  navigation,
  jsonLd,
  reviews = EMPTY_REVIEWS,
  // No default: CaseStudyGridSection already falls back to an empty list, and an
  // extra default parameter here trips the complexity ceiling on this component.
  caseStudies,
}) {
  const flags = computePublicSiteFlags(site, page, pathname)
  const pageEditAttrs = getSanityPageEditAttributes(page, 'title')
  const pageSectionsEditAttrs = getSanityPageEditAttributes(page, 'sections')
  const brandStyle = getSiteBrandStyleVars(site)

  return (
    <div
      className="text-foreground bg-background min-h-screen"
      {...getDevSectionAttributes({
        id: 'public-site-root',
        markup: 'src/components/platform/public-site.jsx',
        content: `page "${page.title}" from ${page.source || 'fixture'}`,
        note: `route ${pathname || '/'} using ${flags.useSolarShell ? 'solar shell' : 'generic shell'}`,
      })}
      {...pageEditAttrs}
      style={{ ...brandStyle, backgroundColor: 'var(--background)' }}
    >
      <DevTrace
        markup="src/components/platform/public-site.jsx"
        content={`page "${page.title}" from ${page.source || 'fixture'}`}
        note={`route ${pathname || '/'} using ${flags.useSolarShell ? 'solar shell' : 'generic shell'}`}
      />

      {site.slug === 'txchristmaslights' && <ChristmasFaviconBlinker />}
      {flags.useSolarShell ? (
        <Header navigation={navigation} />
      ) : (
        <GenericHeader site={site} navigation={navigation} />
      )}

      <main
        id="main-content"
        {...getDevSectionAttributes({
          id: 'public-site-main',
          class: 'main',
          markup: 'src/components/platform/public-site.jsx',
          content: `rendered sections for "${page.title}"`,
        })}
        {...pageSectionsEditAttrs}
      >
        {flags.sections.map((section, index) =>
          renderSectionItem(section, index, flags, page, site, pathname, reviews, caseStudies),
        )}

        {/* Fallback share bar only when there were no content sections to anchor it to */}
        {flags.isGuidePost && flags.guideShareAfterIndex === -1 ? (
          <GuideShareBar url={flags.shareUrl} title={page.seo?.title || page.title || ''} />
        ) : null}

        {flags.showFallbackRoofingLogoCloud && flags.firstLeadCaptureSectionIndex === -1 ? (
          <div {...pageSectionsEditAttrs}>
            <RoofingLogoCloudSection sectionId="roofing-certifications" />
          </div>
        ) : null}

        {!flags.hasLeadCaptureSection && !flags.suppressDefaultLeadCapture ? (
          <CtaSection page={page} section={null} site={site} pathname={pathname} sectionId="cta-contact" />
        ) : null}
      </main>

      {flags.useSolarShell ? <Footer /> : <GenericFooter site={site} />}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  )
}
