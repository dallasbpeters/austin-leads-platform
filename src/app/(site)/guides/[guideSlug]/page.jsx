import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async ({ params }) => {
  const { guideSlug } = await params
  return buildMetadataForCurrentSite(['guides', guideSlug])
}

const GuideDetailPage = async ({ params }) => {
  const { guideSlug } = await params
  return renderCurrentSitePage(['guides', guideSlug])
}

export default GuideDetailPage
