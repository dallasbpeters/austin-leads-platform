import { headers } from "next/headers";

import {
  getPrimaryUrl,
  getSitemapEntriesForSite,
  resolveSiteByHost,
} from "@/lib/platform/content";

export const dynamic = "force-dynamic";

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const site = await resolveSiteByHost(host);
  const pages = await getSitemapEntriesForSite(site);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((page) => {
    const url = getPrimaryUrl(site, page.slug ? `/${page.slug}` : "/");
    const lastmod = page.updatedAt ? `<lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>` : "";
    return `  <url><loc>${escapeXml(url)}</loc>${lastmod}</url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
