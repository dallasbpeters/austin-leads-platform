import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import GuideCardGrid from '@/components/guide-card'
import PortableTextContent from '@/components/portable-text-content'
import { AutoFillGrid } from '@/components/ui/grid-container'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { getSanityEditAttributes } from '@/lib/sanity/visualEditing'

/**
 * Pinned case studies first, in the order the editor pinned them, then everything
 * else newest-first. Pinning reorders rather than filters, so a job can never be
 * hidden by being left off the list.
 */
function orderByPinned(all, pinnedIds) {
  const pinned = pinnedIds.map((id) => all.find((caseStudy) => caseStudy._id === id)).filter(Boolean)
  const pinnedSet = new Set(pinned.map((caseStudy) => caseStudy._id))

  return [...pinned, ...all.filter((caseStudy) => !pinnedSet.has(caseStudy._id))]
}

/** Newest case study first, capped by the section's "Maximum shown" when set. */
function resolveCaseStudies(section, caseStudies) {
  const all = Array.isArray(caseStudies) ? caseStudies.filter(Boolean) : []
  const pinnedIds = Array.isArray(section?.featuredIds) ? section.featuredIds.filter(Boolean) : []
  // Reorder before capping, so "Maximum shown" can never slice off a pinned job.
  const ordered = pinnedIds.length ? orderByPinned(all, pinnedIds) : all
  const max = Number(section?.maxItems)

  return Number.isFinite(max) && max > 0 ? ordered.slice(0, max) : ordered
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
    image: getImageUrl(caseStudy.cover, null, { width: featured ? 1400 : 700 }),
    imageAlt: getImageAlt(caseStudy.cover, null, caseStudy.title),
    // Renders as the pill under the headline — the proof point for this job.
    category: caseStudy.keyStat?.value || undefined,
    ctaLabel: 'Read the write-up',
    // Makes each card its own click-to-edit target in Presentation, opening that
    // case study rather than the page holding the section. GuideCardGrid spreads
    // this onto the card wrapper. The `drafts` perspective normalises `_id` to the
    // published id, so this points at the right document either way.
    editAttributes: getSanityEditAttributes({
      documentId: caseStudy._id,
      documentType: 'caseStudy',
      path: 'title',
    }),
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

  // Honour the layout choice at any count. Requiring two or more case studies made
  // the radio look broken while only one was published.
  const useFeaturedLead = section?.layout !== 'grid'
  const [lead, ...rest] = resolved

  // The featured lead is its own single-column grid rather than a bare GuideCard:
  // GuideCardGrid is what turns a card's colour into a tone class and wraps each
  // card in the hover/in-view animation, so going through it keeps both.
  const leadCards = useFeaturedLead ? [toGuideCard(lead, { featured: true })] : []
  const gridCards = (useFeaturedLead ? rest : resolved).map((caseStudy) => toGuideCard(caseStudy))

  return (
    <section
      className="case-study-grid section-shell"
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
      <div className="section-shell__inner">
        {section?.title || section?.body ? (
          <div className="section-shell__intro">
            {section?.title ? (
              <h2 className="section-shell__title case-study-grid__title text-fluid-500">{section.title}</h2>
            ) : null}
            {section?.body ? (
              <PortableTextContent
                as="div"
                value={section.body}
                className="section-shell__body text-size-100"
              />
            ) : null}
          </div>
        ) : null}
        <AutoFillGrid>
          {leadCards.length ? <GuideCardGrid cards={leadCards} className="case-study-grid__lead" /> : null}
        </AutoFillGrid>
        {/* Skipped entirely when the featured lead is the only case study, so the
            grid does not render an empty animated container below it. */}
        {gridCards.length ? <GuideCardGrid cards={gridCards} columnsClassName="md:grid-cols-3" /> : null}
      </div>
    </section>
  )
}

export default CaseStudyGridSection
