import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async () => {
  return buildMetadataForCurrentSite(['about'])
}

const AboutPage = async () => {
  return renderCurrentSitePage(['about'])
}

export default AboutPage
