import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} */
export async function generateMetadata() {
  return buildMetadataForCurrentSite(['hail-damage'])
}

export default async function HailDamagePage() {
  return renderCurrentSitePage(['hail-damage'])
}
