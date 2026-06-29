import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async () => {
  return buildMetadataForCurrentSite(['hail-damage'])
}

const HailDamagePage = async () => {
  return renderCurrentSitePage(['hail-damage'])
}

export default HailDamagePage
