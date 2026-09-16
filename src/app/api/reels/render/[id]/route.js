import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { hasRenderer, renderStatus } from '@/lib/reels/renderer'

export const runtime = 'nodejs'

/** GET — how far along a render is, and its public URL once it's finished. */
export async function GET(_request, { params }) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasRenderer()) {
    return NextResponse.json({ error: 'The renderer is not connected yet.' }, { status: 503 })
  }

  const { id } = await params
  try {
    return NextResponse.json({ job: await renderStatus(id) })
  } catch (error) {
    console.error('[reels] render status failed', error)
    return NextResponse.json({ error: error.message }, { status: 502 })
  }
}
