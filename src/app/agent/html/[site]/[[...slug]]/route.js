import { createLightweightHtmlResponse } from '@/lib/platform/agent-page'

/*
 * Lightweight, script-free HTML body of a public page for non-browser HTML
 * clients. Internal: `src/proxy.js` rewrites here; browsers never land on it.
 */
export const GET = async (_request, { params }) => {
  const { site, slug = [] } = await params
  return createLightweightHtmlResponse(site, slug)
}
