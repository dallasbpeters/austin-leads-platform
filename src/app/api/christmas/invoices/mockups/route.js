import { NextResponse } from 'next/server'

import { createMockup, listMockups } from '@/lib/christmas/mockup-db'
import { ensureMockupSchema, hasSession, jsonError, readMockupForm } from '@/lib/christmas/mockup-request'

export const runtime = 'nodejs'

/** GET — saved mockups, newest first. */
export async function GET() {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  try {
    await ensureMockupSchema()
    return NextResponse.json({ mockups: await listMockups() })
  } catch (error) {
    console.error('[christmas/mockups] list failed', error)
    return jsonError(error.message, 500)
  }
}

/** POST — save a new mockup that isn't tied to an invoice. */
export async function POST(request) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  const body = await readMockupForm(request)
  if (body.error) {
    return jsonError(body.error, 400)
  }
  if (!body.title) {
    return jsonError('Give the mockup a name (customer or address)', 400)
  }
  try {
    await ensureMockupSchema()
    return NextResponse.json({ mockup: await createMockup(body) })
  } catch (error) {
    console.error('[christmas/mockups] create failed', error)
    return jsonError(error.message, 500)
  }
}
