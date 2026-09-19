import { buildMetadataForSite, renderSitePage } from '@/lib/platform/site-page'

/** Rendered on first visit, then cached. */
export const generateStaticParams = async () => []

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async ({ params }) => {
  const { site, guideSlug } = await params
  return buildMetadataForSite(site, ['guides', guideSlug])
}

const GuideDetailPage = async ({ params }) => {
  const { site, guideSlug } = await params
  return renderSitePage(site, ['guides', guideSlug])
}

export default GuideDetailPage
