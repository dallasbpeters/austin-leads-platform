import { getMockupForInvoice, getMockupImage } from '@/lib/christmas/mockup-db'
import { ensureMockupSchema, hasSession, imageResponse, jsonError } from '@/lib/christmas/mockup-request'

export const runtime = 'nodejs'

/** GET /api/christmas/invoices/[id]/mockup/photo | rendered — the invoice mockup's saved image. */
export async function GET(_request, { params }) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  const { id, kind } = await params
  if (kind !== 'photo' && kind !== 'rendered') {
    return jsonError('Not found', 404)
  }
  try {
    await ensureMockupSchema()
    const mockup = await getMockupForInvoice(id)
    return imageResponse(mockup ? await getMockupImage(mockup.id, kind) : null)
  } catch (error) {
    console.error('[christmas/mockup] image failed', error)
    return jsonError(error.message, 500)
  }
}
