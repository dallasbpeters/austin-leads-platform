import { freshAccount } from './tokens.js'

/*
 * Posting a finished reel.
 *
 * Instagram takes a Reel in three steps, and the middle one takes a while:
 *   1. create a media container from the public video URL,
 *   2. wait while Instagram downloads and processes it (status_code FINISHED),
 *   3. publish the container.
 * Each step is its own request so no single serverless call waits minutes.
 */

const GRAPH = 'https://graph.instagram.com/v23.0'

/* Finished reels live on Vercel Blob; Instagram fetches them from there. */
export const isPostableVideoUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}

async function graph(pathname, { method = 'GET', params = {} } = {}) {
  const url = new URL(`${GRAPH}/${pathname}`)
  const body = new URLSearchParams(params)
  if (method === 'GET') {
    url.search = body.toString()
  }
  const response = await fetch(url, {
    method,
    cache: 'no-store',
    ...(method === 'GET' ? {} : { body }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.error) {
    throw new Error(
      `Instagram: ${payload.error?.error_user_msg || payload.error?.message || response.status}`,
    )
  }
  return payload
}

async function instagramAccount() {
  const account = await freshAccount('instagram')
  if (!account) {
    throw new Error('Instagram is not connected. An admin can connect it on the Social accounts page.')
  }
  return account
}

/** Step 1: hands Instagram the video. Returns the container id. */
export async function startInstagramReel({ videoUrl, caption }) {
  const account = await instagramAccount()
  const { id } = await graph(`${account.accountId || 'me'}/media`, {
    method: 'POST',
    params: {
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption || '',
      share_to_feed: 'true',
      access_token: account.accessToken,
    },
  })
  return id
}

/** Step 2: 'IN_PROGRESS', 'FINISHED', 'ERROR', 'EXPIRED' or 'PUBLISHED'. */
export async function instagramReelStatus(containerId) {
  const account = await instagramAccount()
  const payload = await graph(containerId, {
    params: { fields: 'status_code,status', access_token: account.accessToken },
  })
  return { status: payload.status_code, detail: payload.status || '' }
}

/** Step 3: publishes a FINISHED container. Returns the post id and link. */
export async function publishInstagramReel(containerId) {
  const account = await instagramAccount()
  const { id } = await graph(`${account.accountId || 'me'}/media_publish`, {
    method: 'POST',
    params: { creation_id: containerId, access_token: account.accessToken },
  })
  const { permalink } = await graph(id, {
    params: { fields: 'permalink', access_token: account.accessToken },
  }).catch(() => ({ permalink: null }))
  return { id, permalink }
}
