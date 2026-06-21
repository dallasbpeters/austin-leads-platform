import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export async function generateMetadata() {
  return buildMetadataForCurrentSite(['guides'])
}

export default async function GuidesPage() {
  return renderCurrentSitePage(['guides'])
}
