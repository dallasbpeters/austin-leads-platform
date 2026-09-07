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

  const { checkSanityWriteToken } = await import('./sanity/write-token-health')

  await checkSanityWriteToken()
}
