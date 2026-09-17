import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { hasRenderer, previewAudio } from '@/lib/reels/renderer'

export const runtime = 'nodejs'

const MAX_SCENES = 20

/** POST { scenes } — the voice, music and effects for the studio preview, as URLs. */
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
  if (scenes.length > MAX_SCENES) {
    return NextResponse.json({ error: `A reel can have up to ${MAX_SCENES} scenes.` }, { status: 400 })
  }

  try {
    return NextResponse.json({ plan: await previewAudio(scenes) })
  } catch (error) {
    console.error('[reels] preview audio failed', error)
    return NextResponse.json({ error: error.message }, { status: 502 })
  }
}
