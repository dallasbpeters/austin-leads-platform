export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xuhfhjna'

/**
 * Sanity-hosted Studio application id (see sanity.io/manage → this project → Studio).
 * Shared with `deployment.appId` in sanity.cli.js. Override via SANITY_STUDIO_APP_ID for forks or multi-app setups.
 */
export const studioDeploymentAppId =
  (process.env.SANITY_STUDIO_APP_ID || '').trim() || 'jncwj3gejnhx6pspao78c6wp'
export const studioUrl = '/studio'
export const canonicalStudioUrl =
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://austin-leads-platform.sanity.studio'
export const localStudioUrl = process.env.NEXT_PUBLIC_LOCAL_SANITY_STUDIO_URL || 'http://localhost:3334'
export const runtimeStudioUrl = process.env.NODE_ENV === 'development' ? localStudioUrl : canonicalStudioUrl
export const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://texassolarandroofingpros.com'
export const localFrontendUrl = process.env.NEXT_PUBLIC_LOCAL_SITE_URL || 'http://localhost:3000'
const productionFrontendUrl = 'https://www.texassolarandroofingpros.com'

function normalizeStudioFrontendOrigin(value) {
  const raw = String(value || '').replace(/\/$/, '')
  if (raw === 'https://texassolarandroofingpros.com') {
    return productionFrontendUrl
  }
  return raw
}

/**
 * Next.js origin for the Sanity Presentation preview iframe.
 *
 * ⚠️  MUST use the `www.` subdomain in production because Vercel has a platform-level
 *     301 redirect from the apex domain → www. If the iframe loads from the apex domain
 *     and Presentation enables draft mode, the cookie lands on www while the iframe is on
 *     apex — the proxy then rejects the `/_site/` rewrite and the preview is broken.
 *
 * Override via SANITY_STUDIO_PREVIEW_ORIGIN for forks or different domain setups.
 */
export const studioPreviewOrigin = normalizeStudioFrontendOrigin(
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
    (process.env.NODE_ENV !== 'production' ? localFrontendUrl : productionFrontendUrl),
)
/**
 * Separate API origin for tool-level fetch calls (PageSpeed, Gemini drafting, etc.).
 * Needs the `www.` subdomain by default to bypass Vercel's apex→www redirect
 * which breaks CORS preflight from the hosted Studio. Override via env when
 * a different custom-domain setup is in use.
 */
export const toolApiOrigin = normalizeStudioFrontendOrigin(
  process.env.SANITY_STUDIO_TOOL_API_ORIGIN || studioPreviewOrigin || productionFrontendUrl,
)

/**
 * Absolute endpoint for Gemini image generation.
 *
 * Must be absolute, not the plugin's relative `/api/gemini/generate-image` default:
 * the deployed Studio runs on a different origin (*.sanity.studio) than the Next.js
 * app, so a relative path would resolve against the Studio host and 404. The route
 * sends permissive CORS headers so the Studio origin can call it.
 */
export const geminiImageApiEndpoint = `${toolApiOrigin}/api/gemini/generate-image`

/**
 * Optional shared secret for the Gemini image route. Only needed when the server
 * sets GEMINI_PLUGIN_API_KEY — without a match the route answers 401.
 */
export const geminiPluginApiKey =
  process.env.SANITY_STUDIO_GEMINI_PLUGIN_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_PLUGIN_API_KEY ||
  undefined

export const frontendOriginAllowlist = [
  ...new Set([
    frontendUrl,
    'https://texassolarandroofingpros.com',
    'https://www.texassolarandroofingpros.com',
  ]),
]
export const useCdn = process.env.NODE_ENV === 'production'

export function isSanityConfigured() {
  return Boolean(projectId && dataset)
}

/**
 * Sanity Context (v2) lives at the ORGANIZATION level, not the project level.
 * The MCP endpoint and its sources are configured in the Context app
 * (Sanity Dashboard -> Apps -> Sanity Labs), and the endpoint URL it shows is
 * what belongs in SANITY_CONTEXT_MCP_URL.
 */
export const contextOrganizationId = (process.env.SANITY_ORGANIZATION_ID || 'oa7bfdwFH').trim()

/** API version for the org-scoped client that records Insights conversations. */
export const contextApiVersion = (process.env.SANITY_CONTEXT_API_VERSION || 'v2025-11-27').trim()

/** API version in the hosted MCP endpoint path. */
export const contextMcpApiVersion = (process.env.SANITY_CONTEXT_MCP_API_VERSION || 'v2026-09-01').trim()

/** Endpoint name as it appears in the Context app. */
export const contextMcpName = (process.env.SANITY_CONTEXT_MCP_NAME || 'texas-solar-and-roofing').trim()
