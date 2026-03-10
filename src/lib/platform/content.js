import { headers } from "next/headers";
import { groq } from "next-sanity";

import { sanityClient, sanityWriteClient } from "@/sanity/client";
import { pages, sites } from "./fixtures";

function normalizeHost(host) {
  return (host || "").replace(/^https?:\/\//, "").replace(/:\d+$/, "").toLowerCase();
}

export function getAllSites() {
  return sites;
}

export function getAllRenderableSites() {
  return sites.filter((site) => site.tier !== "redirect");
}

export function getSiteBySlug(siteSlug) {
  return sites.find((site) => site.slug === siteSlug) ?? null;
}

export function getPageKey(slugParts = []) {
  if (!slugParts.length) {
    return "";
  }

  return slugParts.join("/");
}

export function getPagesForSite(siteSlug) {
  return pages.filter((page) => page.siteSlug === siteSlug);
}

export function getPageForSite(siteSlug, slugParts = []) {
  return (
    pages.find((page) => page.siteSlug === siteSlug && page.slug === getPageKey(slugParts)) ?? null
  );
}

export function getNavigationForSite(siteSlug) {
  return getPagesForSite(siteSlug)
    .filter((page) => page.slug !== "")
    .map((page) => ({
      label: page.title.replace(/^Austin Solar /, "").replace(/^Austin /, ""),
      href: page.slug.startsWith("blog/") ? `/${page.slug}` : `/${page.slug}`,
    }));
}

export async function resolveSiteByHost(host) {
  const normalizedHost = normalizeHost(host);

  const localSite =
    sites.find(
      (site) =>
        site.primaryDomain === normalizedHost ||
        site.aliases?.includes(normalizedHost) ||
        (normalizedHost.endsWith(".vercel.app") && site.slug === "austin-solar-pros"),
    ) ?? null;

  if (!sanityClient) {
    return localSite ?? getSiteBySlug("austin-solar-pros");
  }

  try {
    const site = await sanityClient.fetch(
      groq`*[_type == "site" && ($host == primaryDomain || $host in aliases)][0]{
        _id,
        "id": _id,
        slug,
        name,
        shortName,
        category,
        categoryLabel,
        tier,
        primaryDomain,
        aliases,
        redirectTarget,
        leadForm,
        seo,
        brand,
        organization
      }`,
      { host: normalizedHost },
      { next: { revalidate: 60 } },
    );

    return site ?? localSite ?? getSiteBySlug("austin-solar-pros");
  } catch {
    return localSite ?? getSiteBySlug("austin-solar-pros");
  }
}

export async function resolveCurrentSite() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  return resolveSiteByHost(host);
}

export async function getPageForRequest(site, slugParts = []) {
  const localPage = getPageForSite(site.slug, slugParts);

  if (!sanityClient) {
    return localPage;
  }

  try {
    const page = await sanityClient.fetch(
      groq`*[_type in ["page", "servicePage", "locationPage", "post"] && site->slug.current == $siteSlug && slug.current == $slug][0]{
        _id,
        "id": _id,
        title,
        description,
        pageType,
        templateLevel,
        "slug": slug.current,
        sections
      }`,
      { siteSlug: site.slug, slug: getPageKey(slugParts) || "/" },
      { next: { revalidate: 60 } },
    );

    if (page) {
      return {
        ...page,
        slug: page.slug === "/" ? "" : page.slug,
      };
    }
  } catch {}

  return localPage;
}

export function getPrimaryUrl(site, pathname = "/") {
  const safePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `https://${site.primaryDomain}${safePath}`;
}

export function createJsonLd(site, page, pathname = "/") {
  const base = {
    "@context": "https://schema.org",
    "@type": site.organization?.type || "LocalBusiness",
    name: site.organization?.name || site.name,
    url: getPrimaryUrl(site, pathname),
    telephone: site.organization?.phone,
    email: site.organization?.email,
    areaServed: site.organization?.serviceArea,
  };

  if (page?.pageType === "post") {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.description,
      about: site.categoryLabel,
      publisher: {
        "@type": "Organization",
        name: site.name,
      },
      mainEntityOfPage: getPrimaryUrl(site, pathname),
    };
  }

  const faqSection = page?.sections?.find((section) => section.type === "faq");

  if (faqSection) {
    return [
      base,
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqSection.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ];
  }

  return base;
}

export async function publishPageToSanity(job) {
  if (!sanityWriteClient) {
    return {
      ok: false,
      mode: "placeholder",
      message:
        "Sanity write credentials are not configured yet. The job was marked as published locally only.",
    };
  }

  const slug = job.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const document = {
    _type: job.contentType === "post" ? "post" : "page",
    title: job.title,
    description: job.prompt,
    pageType: job.contentType,
    templateLevel: job.siteSlug === "austin-solar-pros" ? "hero" : "landing",
    slug: {
      _type: "slug",
      current: job.contentType === "post" ? `blog/${slug}` : slug,
    },
    sections: [
      {
        _type: "object",
        type: "hero",
        eyebrow: "Published from queue",
        title: job.title,
        body: job.output || job.prompt,
      },
    ],
  };

  const result = await sanityWriteClient.create(document);

  return {
    ok: true,
    mode: "sanity",
    message: "Draft published to Sanity.",
    documentId: result._id,
  };
}
