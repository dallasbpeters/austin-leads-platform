import { describe, expect, it } from 'vitest'

import {
  DEFAULT_POSTHOG_HOST,
  DEFAULT_POSTHOG_KEY,
  resolveBrowserPostHogConfig,
} from '@/lib/analytics/posthog-browser-config'

describe('browser PostHog config', () => {
  it('falls back to the default project and /ingest when no variable is set', () => {
    expect(resolveBrowserPostHogConfig({ siteSlug: 'texas-solar-and-roofing-pros' })).toStrictEqual({
      token: DEFAULT_POSTHOG_KEY,
      apiHost: DEFAULT_POSTHOG_HOST,
      missing: ['NEXT_PUBLIC_POSTHOG_KEY', 'NEXT_PUBLIC_POSTHOG_HOST'],
    })
  })

  it('uses the per-site key before the single key', () => {
    const config = resolveBrowserPostHogConfig({
      siteSlug: 'txchristmaslights',
      keyMap: '{"txchristmaslights":"phc_site"}',
      key: 'phc_single',
      host: '/ingest',
    })
    expect(config).toStrictEqual({ token: 'phc_site', apiHost: '/ingest', missing: [] })
  })

  it('uses the single key when the site has no entry in the map', () => {
    const config = resolveBrowserPostHogConfig({
      siteSlug: 'other-site',
      keyMap: '{"txchristmaslights":"phc_site"}',
      key: ' phc_single ',
      host: '/ingest',
    })
    expect(config.token).toBe('phc_single')
    expect(config.missing).toStrictEqual([])
  })

  it('ignores a map that is not valid JSON', () => {
    const config = resolveBrowserPostHogConfig({
      siteSlug: 'txchristmaslights',
      keyMap: 'not json',
      host: '/ingest',
    })
    expect(config.token).toBe(DEFAULT_POSTHOG_KEY)
    expect(config.missing).toStrictEqual(['NEXT_PUBLIC_POSTHOG_KEY'])
  })

  it('reports a missing host when only the key is set', () => {
    const config = resolveBrowserPostHogConfig({ key: 'phc_single', host: '  ' })
    expect(config.apiHost).toBe(DEFAULT_POSTHOG_HOST)
    expect(config.missing).toStrictEqual(['NEXT_PUBLIC_POSTHOG_HOST'])
  })
})
