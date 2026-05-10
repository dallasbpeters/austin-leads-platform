import Footer from '@/components/Footer'
import Header from '@/components/Header'
import GuideShareBar from '@/components/GuideShareBar'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { isPrimarySiteSlug } from '@/lib/platform/content'
import { isHeroSectionBlock } from '@/lib/platform/section-helpers'
import { getSanityPageEditAttributes, getSanitySectionEditAttributes } from '@/lib/sanity/visualEditing'
import { buildRuntimeKey, cleanRuntimeString } from '@/lib/sanity/stega'
import { roofingServices } from '@/lib/platform/service-catalog'
import { getSectionDomId, getSiteBrandStyleVars, getThemeClassForSite } from './PublicSiteUtils'
import { GenericFooter, GenericHeader } from './shell'
import { sectionRenderers, RoofingLogoCloudSection, CtaSection } from './sections'

export default function PublicSite({ site, page, pathname, navigation, jsonLd, reviews = [] }) {
  const useSolarShell = isPrimarySiteSlug(site.slug)
  const sections = page.sections || []
  const leadCaptureSectionTypes = new Set(['cta', 'ctaBanner'])
  const hasLeadCaptureSection = sections.some((section) => leadCaptureSectionTypes.has(section.type))
  const hasLogosSection = sections.some((section) => section.type === 'logos')
  const heroSectionIndex = sections.findIndex(isHeroSectionBlock)
  const pageSlug = cleanRuntimeString(page.slug)
  const firstLeadCaptureSectionIndex = sections.findIndex((section) =>
    leadCaptureSectionTypes.has(section.type),
  )
  const pathnameSegments = (pathname || '').split('/').filter(Boolean)
  const topLevelPath = cleanRuntimeString(pathnameSegments[0])
  const serviceSlug = pathnameSegments[0] === 'services' ? cleanRuntimeString(pathnameSegments[1]) : ''
  const roofingServiceSlugs = new Set(roofingServices.map((service) => service.slug))
  const showRoofingLogoCloud =
    useSolarShell &&
    (topLevelPath === 'roofing' || (topLevelPath === 'services' && roofingServiceSlugs.has(serviceSlug)))
  const showFallbackRoofingLogoCloud = showRoofingLogoCloud && !hasLogosSection
  const suppressDefaultLeadCapture =
    pageSlug === 'privacy-policy' || pageSlug === 'terms' || pageSlug === 'services/detach-and-reset'
  const isGuidePost = page.pageType === 'post' && pageSlug.startsWith('guides/')
  const shareUrl =
    cleanRuntimeString(page?.seo?.canonicalUrl) ||
    (site?.primaryDomain ? `https://${site.primaryDomain}${pathname || '/'}` : '')
  const pageEditAttrs = getSanityPageEditAttributes(page, 'title')
  const pageSectionsEditAttrs = getSanityPageEditAttributes(page, 'sections')

  const themeClass = getThemeClassForSite(site)
  const brandStyle = getSiteBrandStyleVars(site)

  return (
    <div
      className={`${themeClass} text-foreground bg-background min-h-screen`}
      {...getDevSectionAttributes({
        id: 'public-site-root',
        markup: 'src/components/platform/PublicSite.jsx',
        content: `page "${page.title}" from ${page.source || 'fixture'}`,
        note: `route ${pathname || '/'} using ${useSolarShell ? 'solar shell' : 'generic shell'}`,
      })}
      {...pageEditAttrs}
      style={{ ...brandStyle, backgroundColor: 'var(--site-surface, var(--background))' }}
    >
      <DevTrace
        markup="src/components/platform/PublicSite.jsx"
        content={`page "${page.title}" from ${page.source || 'fixture'}`}
        note={`route ${pathname || '/'} using ${useSolarShell ? 'solar shell' : 'generic shell'}`}
      />

      {useSolarShell ? <Header /> : <GenericHeader site={site} navigation={navigation} />}

      <main
        {...getDevSectionAttributes({
          id: 'public-site-main',
          markup: 'src/components/platform/PublicSite.jsx',
          content: `rendered sections for "${page.title}"`,
        })}
        {...pageSectionsEditAttrs}
      >
        {sections.map((section, index) => {
          const Component = sectionRenderers[section.type]
          if (!Component) return null

          const sectionId = getSectionDomId(section, index)
          const sectionEditAttrs = getSanitySectionEditAttributes(page, section)

          return (
            <div
              key={buildRuntimeKey('page-section', section._key, section.type, sectionId, index)}
              {...sectionEditAttrs}
            >
              {showFallbackRoofingLogoCloud && index === firstLeadCaptureSectionIndex ? (
                <RoofingLogoCloudSection sectionId="roofing-certifications" />
              ) : null}
              <Component
                page={page}
                section={section}
                site={site}
                pathname={pathname}
                reviews={reviews}
                sectionId={sectionId}
                editAttributes={sectionEditAttrs}
              />
              {isGuidePost && index === heroSectionIndex ? (
                <GuideShareBar url={shareUrl} title={page.seo?.title || page.title || ''} />
              ) : null}
            </div>
          )
        })}

        {isGuidePost && heroSectionIndex === -1 ? (
          <GuideShareBar url={shareUrl} title={page.seo?.title || page.title || ''} />
        ) : null}

        {showFallbackRoofingLogoCloud && firstLeadCaptureSectionIndex === -1 ? (
          <div {...pageSectionsEditAttrs}>
            <RoofingLogoCloudSection sectionId="roofing-certifications" />
          </div>
        ) : null}

        {!hasLeadCaptureSection && !suppressDefaultLeadCapture ? (
          <CtaSection page={page} section={null} site={site} pathname={pathname} sectionId="cta-contact" />
        ) : null}
      </main>

      {useSolarShell ? <Footer /> : <GenericFooter site={site} />}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  )
}
