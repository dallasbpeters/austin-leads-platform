import {
  buildMetadataForCurrentSite,
  renderCurrentSitePage,
} from "@/lib/platform/site-page";

export async function generateMetadata() {
  return buildMetadataForCurrentSite(["about"]);
}

export default async function AboutPage() {
  return renderCurrentSitePage(["about"]);
}
