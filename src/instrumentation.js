/**
 * Next.js startup hook. Runs once per server process, before any request.
 *
 * @returns {Promise<void>} Resolves when startup checks have reported.
 */
export async function register() {
  /* Only the Node runtime can reach Sanity's auth endpoint, and the edge
   * runtime re-runs this file for its own bundle. */
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return
  }

  const [{ checkSanityWriteToken }, { installVaryAcceptHook }] = await Promise.all([
    import('./sanity/write-token-health'),
    import('./lib/platform/vary-accept'),
    // Initializes only the dedicated PostHog workflow-log provider. Existing
    // console and application loggers remain outside this export.
    import('./lib/posthog-logs'),
  ])

  // Designed public pages must answer with `Accept` in `Vary`; see that module.
  installVaryAcceptHook()

  await checkSanityWriteToken()
}
