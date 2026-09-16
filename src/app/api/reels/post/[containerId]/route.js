import { NextResponse } from 'next/server'

import { jsonError, reelUser } from '@/lib/reels/reel-request'
import { instagramReelStatus, publishInstagramReel } from '@/lib/social/publish'

export const runtime = 'nodejs'

const containerFrom = async (params) => {
  const { containerId } = await params
  return /^\d+$/.test(containerId) ? containerId : null
}

/** GET — is Instagram done processing the video? */
export async function GET(_request, { params }) {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  const containerId = await containerFrom(params)
  if (!containerId) {
    return jsonError('Unknown post.', 400)
  }
  try {
    return NextResponse.json(await instagramReelStatus(containerId))
  } catch (error) {
    return jsonError(error.message, 502)
  }
}

/** POST — publish the processed video. */
export async function POST(_request, { params }) {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  const containerId = await containerFrom(params)
  if (!containerId) {
    return jsonError('Unknown post.', 400)
  }
  try {
    return NextResponse.json(await publishInstagramReel(containerId))
  } catch (error) {
    return jsonError(error.message, 502)
  }
}
