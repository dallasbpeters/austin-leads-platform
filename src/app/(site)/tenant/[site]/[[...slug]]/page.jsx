import { buildMetadataForSite, renderSitePage } from '@/lib/platform/site-page'

/** Rendered on first visit, then cached. */
export const generateStaticParams = async () => []

export const generateMetadata = async ({ params }) => {
  const { site, slug = [] } = await params
  return buildMetadataForSite(site, slug)
}

const PublicCatchAllPage = async ({ params }) => {
  const { site, slug = [] } = await params
  return renderSitePage(site, slug)
}

export default PublicCatchAllPage
