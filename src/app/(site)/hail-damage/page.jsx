import {
  buildMetadataForCurrentSite,
  renderCurrentSitePage,
} from "@/lib/platform/site-page";

export async function generateMetadata() {
  return buildMetadataForCurrentSite(["hail-damage"]);
}

export default async function HailDamagePage() {
  return renderCurrentSitePage(["hail-damage"]);
}
