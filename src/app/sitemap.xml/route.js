import { headers } from "next/headers";

import { getPageForSite, getPagesForSite, getPrimaryUrl, resolveSiteByHost } from "@/lib/platform/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const site = await resolveSiteByHost(host);
  const pages = getPagesForSite(site.slug).filter((page) => page.slug !== "404");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((page) => {
    const url = getPrimaryUrl(site, page.slug ? `/${page.slug}` : "/");
    return `  <url><loc>${url}</loc></url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
