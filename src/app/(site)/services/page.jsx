import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export async function generateMetadata() {
  return buildMetadataForCurrentSite(['services'])
}

export default async function ServicesPage() {
  return renderCurrentSitePage(['services'])
}
