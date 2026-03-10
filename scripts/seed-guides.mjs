import { createClient } from "next-sanity";

import { pages, sites } from "../src/lib/platform/fixtures.js";
import { withSectionKeys } from "../src/lib/sanity/keys.js";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-21";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity env. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const siteSlug = "austin-solar-pros";
const siteFixture = sites.find((site) => site.slug === siteSlug);

if (!siteFixture) {
  console.error(`Could not find fixture site for ${siteSlug}.`);
  process.exit(1);
}

async function ensureSite() {
  const existing = await client.fetch(
    `*[_type == "site" && slug.current == $siteSlug][0]{_id}`,
    { siteSlug },
  );

  if (existing?._id) {
    return existing._id;
  }

  const created = await client.createIfNotExists({
    _id: siteFixture.id,
    _type: "site",
    name: siteFixture.name,
    shortName: siteFixture.shortName,
    category: siteFixture.category,
    categoryLabel: siteFixture.categoryLabel,
    tier: siteFixture.tier,
    slug: {
      _type: "slug",
      current: siteFixture.slug,
    },
    primaryDomain: siteFixture.primaryDomain,
    aliases: siteFixture.aliases,
    redirectTarget: siteFixture.redirectTarget,
    leadForm: siteFixture.leadForm,
    seo: siteFixture.seo,
    brand: siteFixture.brand,
    organization: siteFixture.organization,
  });

  return created._id;
}

function toSanityDocument(page, siteId, existingId) {
  return {
    _id: existingId || page.id,
    _type: page.pageType === "post" ? "post" : "page",
    title: page.title,
    description: page.description,
    site: {
      _type: "reference",
      _ref: siteId,
    },
    pageType: page.pageType,
    templateLevel: page.templateLevel,
    slug: {
      _type: "slug",
      current: page.slug || "/",
    },
    sections: withSectionKeys(page.sections),
  };
}

function mergeSeedSections(seedSections, existingSections = []) {
  const keyedExistingSections = new Map(
    (existingSections || []).map((section) => [section.type, section]),
  );

  return withSectionKeys(
    (seedSections || []).map((section) => {
      const existingSection = keyedExistingSections.get(section.type);

      if (!existingSection) {
        return section;
      }

      const mergedSection = {
        ...section,
        heroAsset: existingSection.heroAsset || section.heroAsset,
        heroImage: existingSection.heroImage || section.heroImage,
        heroTextColor: existingSection.heroTextColor || section.heroTextColor,
        heroOverlayColor: existingSection.heroOverlayColor || section.heroOverlayColor,
        heroOverlayStartColor:
          existingSection.heroOverlayStartColor || section.heroOverlayStartColor,
        heroOverlayEndColor:
          existingSection.heroOverlayEndColor || section.heroOverlayEndColor,
        heroOverlayDirection:
          existingSection.heroOverlayDirection || section.heroOverlayDirection,
        heroOverlayStartOpacity:
          existingSection.heroOverlayStartOpacity ?? section.heroOverlayStartOpacity,
        heroOverlayEndOpacity:
          existingSection.heroOverlayEndOpacity ?? section.heroOverlayEndOpacity,
        heroOverlayOpacity:
          existingSection.heroOverlayOpacity ?? section.heroOverlayOpacity,
      };

      if (!Array.isArray(section.items) || !Array.isArray(existingSection.items)) {
        return mergedSection;
      }

      const existingItemsByTitle = new Map(
        existingSection.items.map((item) => [item.title || item.question, item]),
      );

      return {
        ...mergedSection,
        items: section.items.map((item) => {
          const existingItem = existingItemsByTitle.get(item.title || item.question);

          if (!existingItem) {
            return item;
          }

          return {
            ...item,
            imageAsset: existingItem.imageAsset || item.imageAsset,
            image: existingItem.image || item.image,
          };
        }),
      };
    }),
  );
}

async function upsertPage(page, siteId) {
  const existing = await client.fetch(
    `*[_type in ["page", "post"] && site->slug.current == $siteSlug && slug.current == $slug][0]{
      _id,
      sections[]{
        type,
        heroAsset,
        heroImage,
        heroTextColor,
        heroOverlayColor,
        heroOverlayStartColor,
        heroOverlayEndColor,
        heroOverlayDirection,
        heroOverlayStartOpacity,
        heroOverlayEndOpacity,
        heroOverlayOpacity,
        items[]{
          title,
          question,
          image,
          imageAsset
        }
      }
    }`,
    { siteSlug, slug: page.slug || "/" },
  );

  const document = toSanityDocument(
    {
      ...page,
      sections: mergeSeedSections(page.sections, existing?.sections),
    },
    siteId,
    existing?._id,
  );
  await client.createOrReplace(document);
}

async function main() {
  const siteId = await ensureSite();
  const guidePages = pages.filter(
    (page) =>
      page.siteSlug === siteSlug &&
      (page.slug === "guides" || page.slug.startsWith("guides/")),
  );

  for (const page of guidePages) {
    await upsertPage(page, siteId);
  }

  console.log(`Seeded ${guidePages.length} guide documents for ${siteSlug}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
