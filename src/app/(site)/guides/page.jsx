import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async () => {
  return buildMetadataForCurrentSite(['guides'])
}

const GuidesPage = async () => {
  return renderCurrentSitePage(['guides'])
}

export default GuidesPage
