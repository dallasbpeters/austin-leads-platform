import { NextResponse } from 'next/server'

import { jsonError, reelUser } from '@/lib/reels/reel-request'
import { ensureSocialTables, listSocialAccounts } from '@/lib/social/accounts-db'
import { isPostableVideoUrl, startInstagramReel } from '@/lib/social/publish'

export const runtime = 'nodejs'

/** GET — which platforms are connected, so the studio knows which Post buttons to show. */
export async function GET() {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  try {
    await ensureSocialTables()
    const accounts = await listSocialAccounts()
    return NextResponse.json({
      platforms: accounts.map((account) => ({ id: account.provider, username: account.username })),
    })
  } catch (error) {
    return jsonError(error.message, 500)
  }
}

/** POST { platform, videoUrl, caption } — hands the video to the platform. Returns a container id to poll. */
export async function POST(request) {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  const body = await request.json().catch(() => ({}))
  if (body.platform !== 'instagram') {
    return jsonError('Only Instagram posting is set up so far.', 400)
  }
  if (!isPostableVideoUrl(body.videoUrl)) {
    return jsonError('Render the reel first.', 400)
  }
  const caption = String(body.caption || '').slice(0, 2200)
  try {
    const containerId = await startInstagramReel({ videoUrl: body.videoUrl, caption })
    return NextResponse.json({ containerId })
  } catch (error) {
    return jsonError(error.message, 502)
  }
}
