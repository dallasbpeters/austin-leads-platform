import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export async function generateMetadata() {
  return buildMetadataForCurrentSite(['roofing'])
}

export default async function RoofingPage() {
  return renderCurrentSitePage(['roofing'])
}
