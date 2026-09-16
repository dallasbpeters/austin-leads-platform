import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { hasRenderer, startRender } from '@/lib/reels/renderer'

export const runtime = 'nodejs'

/** POST { scenes } — queue a render on the worker and hand back its job id. */
export async function POST(request) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasRenderer()) {
    return NextResponse.json(
      { error: 'The renderer is not connected yet. Set REEL_RENDERER_URL and RENDER_SHARED_SECRET.' },
      { status: 503 },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const scenes = Array.isArray(body?.scenes) ? body.scenes : []
  if (!scenes.length) {
    return NextResponse.json({ error: 'Add at least one scene first.' }, { status: 400 })
  }

  try {
    const job = await startRender({ scenes, quality: body?.quality })
    return NextResponse.json({ job })
  } catch (error) {
    console.error('[reels] render failed to queue', error)
    return NextResponse.json({ error: error.message }, { status: 502 })
  }
}
