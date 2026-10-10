import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getProvider } from '@/lib/social/providers'

describe('social providers', () => {
  beforeEach(() => {
    vi.stubEnv('TIKTOK_CLIENT_KEY', 'tt-key')
    vi.stubEnv('TIKTOK_CLIENT_SECRET', 'tt-secret')
    vi.stubEnv('INSTAGRAM_APP_ID', 'ig-app')
    vi.stubEnv('INSTAGRAM_APP_SECRET', 'ig-secret')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('builds the TikTok consent link with every scope posting needs', () => {
    const url = new URL(
      getProvider('tiktok').authorizeUrl({ redirectUri: 'https://x.test/cb', state: 'tiktok.abc' }),
    )
    expect(url.origin + url.pathname).toBe('https://www.tiktok.com/v2/auth/authorize/')
    expect(url.searchParams.get('client_key')).toBe('tt-key')
    expect(url.searchParams.get('scope')).toBe('user.info.basic,video.upload,video.publish')
    expect(url.searchParams.get('redirect_uri')).toBe('https://x.test/cb')
    expect(url.searchParams.get('state')).toBe('tiktok.abc')
  })

  it('builds the Instagram consent link for Instagram Login', () => {
    const url = new URL(
      getProvider('instagram').authorizeUrl({ redirectUri: 'https://x.test/cb', state: 's' }),
    )
    expect(url.origin + url.pathname).toBe('https://www.instagram.com/oauth/authorize')
    expect(url.searchParams.get('client_id')).toBe('ig-app')
    expect(url.searchParams.get('scope')).toBe('instagram_business_basic,instagram_business_content_publish')
  })

  it('reports whether the app keys are set', () => {
    expect(getProvider('tiktok').configured()).toBeTruthy()
    vi.stubEnv('TIKTOK_CLIENT_SECRET', '')
    expect(getProvider('tiktok').configured()).toBeFalsy()
    expect(getProvider('facebook')).toBeNull()
  })
})

describe('social token storage', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('never writes a token in the clear, and reads it back', async () => {
    vi.stubEnv('SOCIAL_TOKEN_KEY', 'a-long-test-secret')
    const writes = []
    let stored = null
    vi.doMock(import('../lib/db/pool.js'), () => ({
      getSql:
        () =>
        (strings, ...values) => {
          writes.push(values)
          if (strings[0].includes('INSERT')) {
            // provider, account_id, username, avatar_url, access_token, refresh_token, …
            stored = { provider: values[0], access_token: values[4], refresh_token: values[5], scopes: [] }
          }
          return Promise.resolve(stored ? [stored] : [])
        },
    }))
    const db = await import('@/lib/social/accounts-db')
    await db.saveSocialAccount('tiktok', { accessToken: 'secret-access', refreshToken: 'secret-refresh' })
    const flat = JSON.stringify(writes)
    expect(flat).not.toContain('secret-access')
    expect(flat).not.toContain('secret-refresh')

    const account = await db.getSocialAccountWithTokens('tiktok')
    expect(account.accessToken).toBe('secret-access')
    expect(account.refreshToken).toBe('secret-refresh')
  })

  it('refuses to store tokens without a key', async () => {
    vi.stubEnv('SOCIAL_TOKEN_KEY', '')
    vi.doMock(import('../lib/db/pool.js'), () => ({ getSql: () => () => Promise.resolve([]) }))
    const db = await import('@/lib/social/accounts-db')
    expect(db.hasTokenKey()).toBeFalsy()
    await expect(db.saveSocialAccount('tiktok', { accessToken: 'x' })).rejects.toThrow('SOCIAL_TOKEN_KEY')
  })
})
