import { NextResponse } from 'next/server'

import { createReel, ensureReelTables, listReels } from '@/lib/reels/reel-db'
import { jsonError, readReelBody, reelUser } from '@/lib/reels/reel-request'

export const runtime = 'nodejs'

/** GET — saved reels, newest first. */
export async function GET() {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  try {
    await ensureReelTables()
    return NextResponse.json({ reels: await listReels() })
  } catch (error) {
    console.error('[reels] list failed', error)
    return jsonError(error.message, 500)
  }
}

/** POST { title, scenes } — save a new reel. */
export async function POST(request) {
  const user = await reelUser()
  if (!user) {
    return jsonError('Unauthorized', 401)
  }
  const body = await readReelBody(request)
  if (body.error) {
    return jsonError(body.error, 400)
  }
  try {
    await ensureReelTables()
    const reel = await createReel({ ...body, createdBy: user.email || user.name || null })
    return NextResponse.json({ reel })
  } catch (error) {
    console.error('[reels] save failed', error)
    return jsonError(error.message, 500)
  }
}
