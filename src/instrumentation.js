/**
 * Next.js startup hook. Runs once per server process, before any request.
 *
 * The Node-only work sits inside the `NEXT_RUNTIME` branch (the pattern from
 * the Next.js instrumentation docs): the edge runtime compiles this file too,
 * and webpack drops the branch there, so the Node server and its imports stay
 * out of the edge bundle.
 *
 * @returns {Promise<void>} Resolves when startup checks have reported.
 */
export async function register() {
  /* Only the Node runtime can reach Sanity's auth endpoint, and only it serves
   * the designed pages whose `Vary` the hook completes. */
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const [{ checkSanityWriteToken }, { installVaryAcceptHook }] = await Promise.all([
      import('./sanity/write-token-health'),
      import('./lib/platform/vary-accept'),
      // Initializes only the dedicated PostHog workflow-log provider. Existing
      // console and application loggers remain outside this export.
      import('./lib/posthog-logs'),
    ])

    // Designed public pages must answer with `Accept` in `Vary`; see that module.
    await installVaryAcceptHook()

    await checkSanityWriteToken()
  }
}
