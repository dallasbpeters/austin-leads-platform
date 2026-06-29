import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async () => {
  return buildMetadataForCurrentSite(['solar'])
}

const SolarPage = async () => {
  return renderCurrentSitePage(['solar'])
}

export default SolarPage
