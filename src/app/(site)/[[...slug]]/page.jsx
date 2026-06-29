import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

export const generateMetadata = async ({ params, searchParams }) => {
  const { slug = [] } = await params
  const sp = await searchParams
  return buildMetadataForCurrentSite(slug, sp)
}

const PublicCatchAllPage = async ({ params, searchParams }) => {
  const { slug = [] } = await params
  const sp = await searchParams
  return renderCurrentSitePage(slug, sp)
}

export default PublicCatchAllPage
