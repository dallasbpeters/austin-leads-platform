import HeroPagesClient from "@/components/admin/HeroPagesClient";
import { getHeroPages, getHeroSitesForAdmin } from "@/lib/platform/content";
import { isUnsplashConfigured } from "@/lib/platform/unsplash";
import { sanityWriteClient } from "@/sanity/client";

export default async function HeroPagesPage() {
  return (
    <HeroPagesClient
      initialPages={await getHeroPages()}
      heroSites={await getHeroSitesForAdmin()}
      unsplashEnabled={isUnsplashConfigured()}
      canCreatePages={Boolean(sanityWriteClient)}
    />
  );
}
