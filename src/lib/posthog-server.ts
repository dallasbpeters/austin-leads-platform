import { PostHog } from 'posthog-node'

/*
 * Server-side PostHog clients for the multi-tenant platform.
 *
 * The browser SDK in `src/app/providers.jsx` resolves a per-site project key
 * from `NEXT_PUBLIC_POSTHOG_KEYS` (a JSON map keyed by site slug) — we mirror
 * that here so server events (Stripe webhooks, sign-in audits, etc.) reach
 * the same project as the corresponding browser session.
 *
 * The original `getPostHogClient()` from the PostHog install wizard read
 * `NEXT_PUBLIC_POSTHOG_KEY`, which isn't set in this codebase — it caused
 * server events to silently capture against `undefined`. The new signature
 * accepts an optional `siteSlug`; callers must pass it to route events to
 * the right project. When omitted, we fall back to the legacy single-key
 * env var so any external integration that still uses it keeps working.
 */

const parsePostHogKeyMap = (): Record<string, string> => {
  const raw = process.env.NEXT_PUBLIC_POSTHOG_KEYS
  if (!raw) {
    return {}
  }
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

const KEY_MAP = parsePostHogKeyMap()

const resolveKey = (siteSlug?: string | null): string | null => {
  if (siteSlug && KEY_MAP[siteSlug]) {
    return KEY_MAP[siteSlug]
  }
  const legacy = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (legacy && legacy.trim()) {
    return legacy.trim()
  }
  return null
}

const clientCache = new Map<string, PostHog>()

/**
 * Returns a cached `posthog-node` client for the given site, or `null` when no
 * key is configured. Callers should null-check before capturing, e.g.:
 *
 *   const ph = getPostHogClient('txchristmaslights')
 *   ph?.capture({ distinctId, event, properties })
 *
 * Server-side calls hit PostHog directly (no Next /ingest proxy) so they
 * don't depend on the app being publicly routable.
 */
export const getPostHogClient = (siteSlug?: string | null): PostHog | null => {
  const key = resolveKey(siteSlug)
  if (!key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[posthog-server] no key for site "${siteSlug ?? '(default)'}". ` +
          'Set NEXT_PUBLIC_POSTHOG_KEYS (recommended) or NEXT_PUBLIC_POSTHOG_KEY.',
      )
    }
    return null
  }

  const host = process.env.POSTHOG_HOST?.trim()
  if (!host) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_HOST is configured',
      )
    }
    return null
  }

  if (!clientCache.has(key)) {
    clientCache.set(
      key,
      new PostHog(key, {
        host,
        privacyMode: false,
        flushAt: 1,
        flushInterval: 0,
      }),
    )
  }

  return clientCache.get(key) ?? null
}
