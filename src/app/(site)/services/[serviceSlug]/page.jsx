import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async ({ params }) => {
  const { serviceSlug } = await params

  return buildMetadataForCurrentSite(['services', serviceSlug])
}

const ServiceDetailPage = async ({ params }) => {
  const { serviceSlug } = await params

  return renderCurrentSitePage(['services', serviceSlug])
}

export default ServiceDetailPage
