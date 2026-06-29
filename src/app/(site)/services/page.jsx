import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async () => {
  return buildMetadataForCurrentSite(['services'])
}

const ServicesPage = async () => {
  return renderCurrentSitePage(['services'])
}

export default ServicesPage
