import { NextResponse } from 'next/server'

import { deleteReel, ensureReelTables, getReel, recordRender, updateReel } from '@/lib/reels/reel-db'
import { jsonError, readReelBody, reelUser } from '@/lib/reels/reel-request'

export const runtime = 'nodejs'

export async function GET(_request, { params }) {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  const { id } = await params
  try {
    await ensureReelTables()
    const reel = await getReel(id)
    return reel ? NextResponse.json({ reel }) : jsonError('Not found', 404)
  } catch (error) {
    console.error('[reels] load failed', error)
    return jsonError(error.message, 500)
  }
}

/** PUT { title, scenes } — save changes. */
export async function PUT(request, { params }) {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  const { id } = await params
  const body = await readReelBody(request)
  if (body.error) {
    return jsonError(body.error, 400)
  }
  try {
    await ensureReelTables()
    const reel = await updateReel(id, body)
    return reel ? NextResponse.json({ reel }) : jsonError('Not found', 404)
  } catch (error) {
    console.error('[reels] update failed', error)
    return jsonError(error.message, 500)
  }
}

/** PATCH { renderJobId, renderUrl } — remember the latest finished render. */
export async function PATCH(request, { params }) {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }
  const url = typeof body?.renderUrl === 'string' ? body.renderUrl : ''
  // Only renders the worker put in Vercel Blob are worth remembering.
  if (url && !/^https:\/\/[\w.-]+\.public\.blob\.vercel-storage\.com\//.test(url)) {
    return jsonError('That is not a reel render URL.', 400)
  }
  try {
    await ensureReelTables()
    const reel = await recordRender(id, { jobId: body?.renderJobId, url })
    return reel ? NextResponse.json({ reel }) : jsonError('Not found', 404)
  } catch (error) {
    console.error('[reels] record render failed', error)
    return jsonError(error.message, 500)
  }
}

export async function DELETE(_request, { params }) {
  if (!(await reelUser())) {
    return jsonError('Unauthorized', 401)
  }
  const { id } = await params
  try {
    await ensureReelTables()
    await deleteReel(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[reels] delete failed', error)
    return jsonError(error.message, 500)
  }
}
