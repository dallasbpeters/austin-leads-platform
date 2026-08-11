import { notFound } from 'next/navigation'

import CaseStudyArticle from '@/components/case-study-article'
import Footer from '@/components/footer'
import Header from '@/components/header'
import { getSectionDomId } from '@/components/platform/public-site-utils'
import { sectionRenderers } from '@/components/platform/sections'
import SectionSurface from '@/components/platform/sections/section-surface'
import { resolveCurrentSite, resolveNavigationForSite } from '@/lib/platform/content'
import { getImageUrl } from '@/lib/platform/imageSource'
import { getCaseStudyBySlug } from '@/sanity/lib/caseStudies'

export const dynamic = 'force-dynamic'

export const generateMetadata = async ({ params }) => {
  const { slug } = await params
  const site = await resolveCurrentSite()
  if (!site) {
    return {}
  }

  const caseStudy = await getCaseStudyBySlug(site.slug, slug)
  if (!caseStudy) {
    return {}
  }

  const place = [caseStudy.location?.city, caseStudy.location?.neighborhood].filter(Boolean).join(', ')
  // The cover is gallery position 1 — the same photo used on the projects card.
  const cover = Array.isArray(caseStudy.gallery) ? caseStudy.gallery[0] : null
  const image = getImageUrl(cover, null, { width: 1200 })

  return {
    title: caseStudy.title,
    description: caseStudy.dek,
    openGraph: {
      type: 'article',
      title: caseStudy.title,
      description: caseStudy.dek,
      publishedTime: caseStudy.publishedAt,
      ...(place ? { locale: place } : {}),
      ...(image ? { images: [{ url: image, alt: cover?.altText ?? caseStudy.title }] } : {}),
    },
  }
}

const CaseStudyPage = async ({ params }) => {
  const { slug } = await params
  const site = await resolveCurrentSite()
  if (!site) {
    notFound()
  }

  const caseStudy = await getCaseStudyBySlug(site.slug, slug)
  if (!caseStudy) {
    notFound()
  }

  const sections = Array.isArray(caseStudy.sections) ? caseStudy.sections : []

  // The (site) layout supplies only the background shell, so every page mounts
  // its own header and footer — same as /hail-map, /guides and the rest.
  return (
    <main className="bg-background min-h-screen">
      <Header navigation={resolveNavigationForSite(site)} />
      <CaseStudyArticle caseStudy={caseStudy} site={site} />

      {/* Editor-added page-builder blocks, appended below the structured story. */}
      {sections.map((section, index) => {
        const Component = sectionRenderers[section.type]
        if (!Component) {
          return null
        }

        const sectionId = getSectionDomId(section, index)

        return (
          <SectionSurface key={section._key || `${section.type}-${index}`} section={section}>
            <Component page={caseStudy} section={section} site={site} sectionId={sectionId} />
          </SectionSurface>
        )
      })}

      <Footer />
    </main>
  )
}

export default CaseStudyPage
