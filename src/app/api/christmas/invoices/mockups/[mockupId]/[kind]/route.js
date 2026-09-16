import { getMockupImage } from '@/lib/christmas/mockup-db'
import { ensureMockupSchema, hasSession, imageResponse, jsonError } from '@/lib/christmas/mockup-request'

export const runtime = 'nodejs'

/** GET /api/christmas/invoices/mockups/[mockupId]/photo | rendered */
export async function GET(_request, { params }) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  const { mockupId, kind } = await params
  if (kind !== 'photo' && kind !== 'rendered') {
    return jsonError('Not found', 404)
  }
  try {
    await ensureMockupSchema()
    return imageResponse(await getMockupImage(mockupId, kind))
  } catch (error) {
    console.error('[christmas/mockups] image failed', error)
    return jsonError(error.message, 500)
  }
}
