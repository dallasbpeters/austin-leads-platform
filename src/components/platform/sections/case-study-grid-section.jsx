import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import GuideCardGrid from '@/components/guide-card'
import PortableTextContent from '@/components/portable-text-content'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

/** Newest case study first, capped by the section's "Maximum shown" when set. */
function resolveCaseStudies(section, caseStudies) {
  const all = Array.isArray(caseStudies) ? caseStudies.filter(Boolean) : []
  const max = Number(section?.maxItems)
  return Number.isFinite(max) && max > 0 ? all.slice(0, max) : all
}

function formatPlace(location) {
  return [location?.city, location?.neighborhood].filter(Boolean).join(' · ')
}

function formatPublished(publishedAt) {
  if (!publishedAt) {
    return ''
  }
  // Fixed locale + UTC so the server and client never disagree on the rendered date.
  return new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Shape a case study into the card contract `GuideCardGrid` reads.
 *
 * `image` must be a URL string, not an object — GuideCardBody passes it straight to
 * next/image as `src`. `color` is deliberately omitted so the grid rotates its own
 * palette; passing a tone key here would do nothing, because only the grid resolves
 * keys to classes (`resolveGuideCardToneClass`) and that helper is not exported.
 */
function toGuideCard(caseStudy, { featured = false } = {}) {
  const place = formatPlace(caseStudy.location)
  const published = formatPublished(caseStudy.publishedAt)

  return {
    title: caseStudy.title,
    eyebrow: [place, published].filter(Boolean).join(' · '),
    copy: caseStudy.dek,
    href: `/projects/${caseStudy.slug}`,
    image: getImageUrl(caseStudy.heroImage, null, { width: featured ? 1400 : 700 }),
    imageAlt: getImageAlt(caseStudy.heroImage, null, caseStudy.title),
    // Renders as the pill under the headline — the proof point for this job.
    category: caseStudy.keyStat?.value || undefined,
    ctaLabel: 'Read the write-up',
  }
}

/**
 * Showcase of every `caseStudy` document for this site, newest first.
 *
 * Case studies are fetched once per request alongside the page (see
 * `resolvePageSectionData` in lib/platform/site-page.js) and passed in, matching
 * how reviews reach the testimonials section.
 */
export function CaseStudyGridSection({ section = null, sectionId = 'case-studies', caseStudies = [] }) {
  const resolved = resolveCaseStudies(section, caseStudies)

  // Nothing published yet — render nothing rather than an empty heading.
  if (resolved.length === 0) {
    return null
  }

  const useFeaturedLead = section?.layout !== 'grid' && resolved.length > 1
  const [lead, ...rest] = resolved

  // The featured lead is its own single-column grid rather than a bare GuideCard:
  // GuideCardGrid is what turns a card's colour into a tone class and wraps each
  // card in the hover/in-view animation, so going through it keeps both.
  const leadCards = useFeaturedLead ? [toGuideCard(lead, { featured: true })] : []
  const gridCards = (useFeaturedLead ? rest : resolved).map((caseStudy) => toGuideCard(caseStudy))

  return (
    <section
      className="border-border/60 border-b pt-24"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/case-study-grid-section.jsx',
        content: `${resolved.length} case studies from Sanity (${section?.layout === 'grid' ? 'even grid' : 'featured lead'})`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/case-study-grid-section.jsx"
        content={`${resolved.length} case studies from Sanity`}
      />
      <div className="mx-auto max-w-7xl px-3 py-20 md:px-6 lg:px-10">
        {section?.title || section?.body ? (
          <div className="mb-10 max-w-3xl">
            {section?.title ? (
              <h2 className="text-foreground mb-4 text-3xl font-medium tracking-normal md:text-4xl">
                {section.title}
              </h2>
            ) : null}
            {section?.body ? (
              <PortableTextContent
                as="div"
                value={section.body}
                className="text-muted-foreground text-lg leading-8"
              />
            ) : null}
          </div>
        ) : null}

        {leadCards.length ? (
          <GuideCardGrid cards={leadCards} className="mb-6" columnsClassName="md:grid-cols-1" />
        ) : null}
        <GuideCardGrid cards={gridCards} columnsClassName="md:grid-cols-3" />
      </div>
    </section>
  )
}

export default CaseStudyGridSection
