import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async () => {
  return buildMetadataForCurrentSite(['roofing'])
}

const RoofingPage = async () => {
  return renderCurrentSitePage(['roofing'])
}

export default RoofingPage
