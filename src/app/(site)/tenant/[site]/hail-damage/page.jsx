import { buildMetadataForSite, renderSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export const generateMetadata = async ({ params }) => {
  const { site } = await params
  return buildMetadataForSite(site, ['hail-damage'])
}

const HailDamagePage = async ({ params }) => {
  const { site } = await params
  return renderSitePage(site, ['hail-damage'])
}

export default HailDamagePage
