import { NextResponse } from 'next/server'

import { getMockup, updateMockup } from '@/lib/christmas/mockup-db'
import { ensureMockupSchema, hasSession, jsonError, readMockupForm } from '@/lib/christmas/mockup-request'

export const runtime = 'nodejs'

export async function GET(_request, { params }) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  const { mockupId } = await params
  try {
    await ensureMockupSchema()
    const mockup = await getMockup(mockupId)
    return mockup ? NextResponse.json({ mockup }) : jsonError('Not found', 404)
  } catch (error) {
    console.error('[christmas/mockups] get failed', error)
    return jsonError(error.message, 500)
  }
}

/** PUT — replace a saved mockup's photo, lights, and picture. */
export async function PUT(request, { params }) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  const { mockupId } = await params
  const body = await readMockupForm(request)
  if (body.error) {
    return jsonError(body.error, 400)
  }
  try {
    await ensureMockupSchema()
    const mockup = await updateMockup(mockupId, body)
    return mockup ? NextResponse.json({ mockup }) : jsonError('Not found', 404)
  } catch (error) {
    console.error('[christmas/mockups] update failed', error)
    return jsonError(error.message, 500)
  }
}
