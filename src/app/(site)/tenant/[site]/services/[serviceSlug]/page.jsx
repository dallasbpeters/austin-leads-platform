import { buildMetadataForSite, renderSitePage } from '@/lib/platform/site-page'

/** Rendered on first visit, then cached. */
export const generateStaticParams = async () => []

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async ({ params }) => {
  const { site, serviceSlug } = await params

  return buildMetadataForSite(site, ['services', serviceSlug])
}

const ServiceDetailPage = async ({ params }) => {
  const { site, serviceSlug } = await params

  return renderSitePage(site, ['services', serviceSlug])
}

export default ServiceDetailPage
