/*
 * The browser SDK's project token and API host.
 *
 * A token comes from the per-site map `NEXT_PUBLIC_POSTHOG_KEYS` first, then
 * `NEXT_PUBLIC_POSTHOG_KEY`. When neither is set, the browser still reports to
 * the Texas Solar and Roofing project through the `/ingest` proxy. Without this
 * fallback, a deploy that is missing a variable sends no events and reports no
 * error. The token is public: every visitor's browser receives it.
 */
export const DEFAULT_POSTHOG_KEY = 'phc_adMRNqeoByZifxH3nDyCgZfjnMFIUIDnjKbytwTRNIk'
export const DEFAULT_POSTHOG_HOST = '/ingest'

const parseKeyMap = (raw) => {
  if (!raw) {
    return {}
  }
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * @param {object} env
 * @param {string | null | undefined} env.siteSlug - The tenant from `data-analytics-site`.
 * @param {string | undefined} env.keyMap - `NEXT_PUBLIC_POSTHOG_KEYS`.
 * @param {string | undefined} env.key - `NEXT_PUBLIC_POSTHOG_KEY`.
 * @param {string | undefined} env.host - `NEXT_PUBLIC_POSTHOG_HOST`.
 * @returns {{ token: string, apiHost: string, missing: string[] }} `missing` names each variable that fell back.
 */
export const resolveBrowserPostHogConfig = ({ siteSlug, keyMap, key, host }) => {
  const mappedToken = siteSlug ? parseKeyMap(keyMap)[siteSlug] : undefined
  const token = (typeof mappedToken === 'string' && mappedToken.trim()) || key?.trim()
  const apiHost = host?.trim()

  const missing = []
  if (!token) {
    missing.push('NEXT_PUBLIC_POSTHOG_KEY')
  }
  if (!apiHost) {
    missing.push('NEXT_PUBLIC_POSTHOG_HOST')
  }

  return {
    token: token || DEFAULT_POSTHOG_KEY,
    apiHost: apiHost || DEFAULT_POSTHOG_HOST,
    missing,
  }
}
