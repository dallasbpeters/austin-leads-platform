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
export const studioPreviewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
  (process.env.NODE_ENV !== 'production' ? localFrontendUrl : 'https://www.texassolarandroofingpros.com')
/**
 * Separate API origin for tool-level fetch calls (PageSpeed, Gemini drafting, etc.).
 * Needs the `www.` subdomain by default to bypass Vercel's apex→www redirect
 * which breaks CORS preflight from the hosted Studio. Override via env when
 * a different custom-domain setup is in use.
 */
export const toolApiOrigin =
  process.env.SANITY_STUDIO_TOOL_API_ORIGIN || 'https://www.texassolarandroofingpros.com'

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
