/*
 * TikTok and Instagram, described once.
 *
 * Everything the Social accounts page and the OAuth routes need per platform
 * lives here: which env vars turn it on, the setup steps shown before it is
 * configured, the consent URL, the code exchange, token refresh, and who the
 * connected account is.
 *
 * Instagram uses "Instagram API with Instagram Login" (graph.instagram.com):
 * a professional Instagram account, no Facebook Page. TikTok uses Login Kit
 * plus the Content Posting API; until TikTok audits the app, posts can only go
 * to the creator's drafts (video.upload) — `video.publish` is requested too so
 * the same connection works once the audit clears.
 */

const env = (name) => (process.env[name] || '').trim()

const formBody = (fields) =>
  new URLSearchParams(Object.entries(fields).filter(([, value]) => value !== null && value !== undefined))

async function readJson(response, label) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.error) {
    const detail =
      payload.error_description ||
      payload.error?.message ||
      payload.message ||
      payload.error ||
      response.status
    throw new Error(`${label}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
  }
  return payload
}

const inSeconds = (seconds) => (seconds ? new Date(Date.now() + Number(seconds) * 1000).toISOString() : null)

// ─── TikTok ──────────────────────────────────────────────────────────────────

const tiktok = {
  id: 'tiktok',
  label: 'TikTok',
  envVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
  scopes: ['user.info.basic', 'video.upload', 'video.publish'],
  setup: [
    'Create a TikTok account for Texas Christmas Lights (a Business account is fine).',
    'At developers.tiktok.com, create an app and add the Login Kit and Content Posting API products.',
    'Request the scopes user.info.basic, video.upload and video.publish.',
    'Add this redirect URI to the app: {redirectUri}',
    'Under Content Posting API, verify the domain the videos are served from (your Vercel Blob host).',
    'Copy the Client key and Client secret into TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET (Vercel and .env.local).',
    'Until TikTok audits the app, reels go to your TikTok drafts and you tap Post in the app. After the audit they post directly.',
  ],
  configured: () => Boolean(env('TIKTOK_CLIENT_KEY') && env('TIKTOK_CLIENT_SECRET')),

  authorizeUrl({ redirectUri, state }) {
    const url = new URL('https://www.tiktok.com/v2/auth/authorize/')
    url.search = formBody({
      client_key: env('TIKTOK_CLIENT_KEY'),
      response_type: 'code',
      scope: tiktok.scopes.join(','),
      redirect_uri: redirectUri,
      state,
    }).toString()
    return url.toString()
  },

  async exchangeCode({ code, redirectUri }) {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody({
        client_key: env('TIKTOK_CLIENT_KEY'),
        client_secret: env('TIKTOK_CLIENT_SECRET'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })
    const token = await readJson(response, 'TikTok token exchange')
    return {
      accountId: token.open_id,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: inSeconds(token.expires_in),
      refreshExpiresAt: inSeconds(token.refresh_expires_in),
      scopes: String(token.scope || '')
        .split(',')
        .filter(Boolean),
    }
  },

  /* TikTok access tokens last 24 hours; the refresh may hand back a new refresh token. */
  async refresh(account) {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody({
        client_key: env('TIKTOK_CLIENT_KEY'),
        client_secret: env('TIKTOK_CLIENT_SECRET'),
        grant_type: 'refresh_token',
        refresh_token: account.refreshToken,
      }),
    })
    const token = await readJson(response, 'TikTok token refresh')
    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token || account.refreshToken,
      expiresAt: inSeconds(token.expires_in),
      refreshExpiresAt: inSeconds(token.refresh_expires_in) || account.refreshExpiresAt,
    }
  },

  async profile(accessToken) {
    const response = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || (payload.error && payload.error.code !== 'ok')) {
      throw new Error(`TikTok profile: ${payload.error?.message || response.status}`)
    }
    const user = payload.data?.user || {}
    return { username: user.display_name || '', avatarUrl: user.avatar_url || '' }
  },
}

// ─── Instagram ───────────────────────────────────────────────────────────────

const instagram = {
  id: 'instagram',
  label: 'Instagram',
  envVars: ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET'],
  scopes: ['instagram_business_basic', 'instagram_business_content_publish'],
  setup: [
    'Create the Texas Christmas Lights Instagram account and switch it to a Professional (Business or Creator) account in the Instagram app.',
    'At developers.facebook.com, create an app (type Business) and add the Instagram product, "API setup with Instagram login".',
    'Add this redirect URI under Business login settings: {redirectUri}',
    'Add the Instagram account as an Instagram Tester on the app, and accept the invite in Instagram (Settings → Apps and websites).',
    'Copy the Instagram app ID and app secret into INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET (Vercel and .env.local).',
    'Posting to your own account works without Meta App Review.',
  ],
  configured: () => Boolean(env('INSTAGRAM_APP_ID') && env('INSTAGRAM_APP_SECRET')),

  authorizeUrl({ redirectUri, state }) {
    const url = new URL('https://www.instagram.com/oauth/authorize')
    url.search = formBody({
      client_id: env('INSTAGRAM_APP_ID'),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: instagram.scopes.join(','),
      state,
    }).toString()
    return url.toString()
  },

  /* Code → short-lived token → 60-day long-lived token. */
  async exchangeCode({ code, redirectUri }) {
    const shortResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody({
        client_id: env('INSTAGRAM_APP_ID'),
        client_secret: env('INSTAGRAM_APP_SECRET'),
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    })
    const short = await readJson(shortResponse, 'Instagram code exchange')

    const longUrl = new URL('https://graph.instagram.com/access_token')
    longUrl.search = formBody({
      grant_type: 'ig_exchange_token',
      client_secret: env('INSTAGRAM_APP_SECRET'),
      access_token: short.access_token,
    }).toString()
    const long = await readJson(await fetch(longUrl), 'Instagram long-lived token')

    return {
      accountId: String(short.user_id || ''),
      accessToken: long.access_token,
      refreshToken: null,
      expiresAt: inSeconds(long.expires_in),
      refreshExpiresAt: null,
      scopes: Array.isArray(short.permissions) ? short.permissions : instagram.scopes,
    }
  },

  /* Long-lived tokens refresh themselves (another 60 days) once they're a day old. */
  async refresh(account) {
    const url = new URL('https://graph.instagram.com/refresh_access_token')
    url.search = formBody({ grant_type: 'ig_refresh_token', access_token: account.accessToken }).toString()
    const token = await readJson(await fetch(url), 'Instagram token refresh')
    return { accessToken: token.access_token, expiresAt: inSeconds(token.expires_in) }
  },

  async profile(accessToken) {
    const url = new URL('https://graph.instagram.com/me')
    url.search = formBody({
      fields: 'user_id,username,profile_picture_url',
      access_token: accessToken,
    }).toString()
    const me = await readJson(await fetch(url), 'Instagram profile')
    return { username: me.username || '', avatarUrl: me.profile_picture_url || '', accountId: me.user_id }
  },
}

export const SOCIAL_PROVIDERS = { tiktok, instagram }

export const getProvider = (id) => SOCIAL_PROVIDERS[id] || null

export const callbackPath = (id) => `/api/social/${id}/callback`
