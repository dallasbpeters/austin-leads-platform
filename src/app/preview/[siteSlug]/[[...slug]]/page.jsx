import { notFound } from 'next/navigation'

import App from '@/App'
import PublicSite from '@/components/platform/PublicSite'
import {
  createJsonLd,
  getHeroHomepageForSite,
  getHomepageReviewsForSite,
  getNavigationForSite,
  getPageForRequest,
  isPrimarySiteSlug,
  resolveSiteBySlug,
} from '@/lib/platform/content'

export default async function PreviewSitePage({ params }) {
  const { siteSlug, slug = [] } = await params
  const site = await resolveSiteBySlug(siteSlug)

  if (!site) {
    notFound()
  }

  if (isPrimarySiteSlug(site.slug) && slug.length === 0) {
    const heroHomepage = await getHeroHomepageForSite(site.slug)
    const heroSection = heroHomepage?.heroSection ?? null
    const reviews = await getHomepageReviewsForSite(site.slug)

    return <App heroSection={heroSection} reviews={reviews} site={site} />
  }

  const page = await getPageForRequest(site, slug)

  if (!page) {
    notFound()
  }

  const pathname = slug.length ? `/${slug.join('/')}` : '/'
  const hasTestimonialsSection = Array.isArray(page.sections)
    ? page.sections.some((section) => section.type === 'testimonials')
    : false
  const reviews = hasTestimonialsSection ? await getHomepageReviewsForSite(site.slug) : []

  return (
    <PublicSite
      site={site}
      page={page}
      pathname={pathname}
      navigation={getNavigationForSite(site.slug)}
      jsonLd={createJsonLd(site, page, pathname)}
      reviews={reviews}
    />
  )
}
