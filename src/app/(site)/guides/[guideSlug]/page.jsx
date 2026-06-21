import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export async function generateMetadata({ params }) {
  const { guideSlug } = await params
  return buildMetadataForCurrentSite(['guides', guideSlug])
}

export default async function GuideDetailPage({ params }) {
  const { guideSlug } = await params
  return renderCurrentSitePage(['guides', guideSlug])
}
