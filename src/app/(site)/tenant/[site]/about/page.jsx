import { buildMetadataForSite, renderSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async ({ params }) => {
  const { site } = await params
  return buildMetadataForSite(site, ['about'])
}

const AboutPage = async ({ params }) => {
  const { site } = await params
  return renderSitePage(site, ['about'])
}

export default AboutPage
