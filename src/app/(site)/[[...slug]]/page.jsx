import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export async function generateMetadata({ params, searchParams }) {
  const { slug = [] } = await params
  const sp = await searchParams
  return buildMetadataForCurrentSite(slug, sp)
}

export default async function PublicCatchAllPage({ params, searchParams }) {
  const { slug = [] } = await params
  const sp = await searchParams
  return renderCurrentSitePage(slug, sp)
}
