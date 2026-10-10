import { createMarkdownResponse } from '@/lib/platform/agent-page'

/*
 * Markdown body of a public page. Internal: `src/proxy.js` rewrites here when a
 * request prefers `text/markdown`; a direct `/agent/markdown/…` request is a
 * tenant page path and 404s.
 */
export const GET = async (_request, { params }) => {
  const { site, slug = [] } = await params
  return createMarkdownResponse(site, slug)
}
