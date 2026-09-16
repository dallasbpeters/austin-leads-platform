import { NextResponse } from 'next/server'

import { CHRISTMAS_SERVICE_TYPES } from '@/lib/christmas/invoice-calc'
import { getMockupRates, saveMockupRates } from '@/lib/christmas/mockup-db'
import { ensureMockupSchema, hasSession, jsonError } from '@/lib/christmas/mockup-request'

export const runtime = 'nodejs'

/** GET — estimator prices (cents per unit, by service). */
export async function GET() {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  try {
    await ensureMockupSchema()
    return NextResponse.json({ rates: await getMockupRates() })
  } catch (error) {
    console.error('[christmas/mockups/rates] load failed', error)
    return jsonError(error.message, 500)
  }
}

/** PUT — { rates: { [service]: cents } }. Unknown services and bad numbers are dropped. */
export async function PUT(request) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  let body
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }
  const rates = Object.fromEntries(
    CHRISTMAS_SERVICE_TYPES.map((service) => [
      service,
      Math.max(0, Math.round(Number(body?.rates?.[service]) || 0)),
    ]),
  )
  try {
    await ensureMockupSchema()
    return NextResponse.json({ rates: await saveMockupRates(rates) })
  } catch (error) {
    console.error('[christmas/mockups/rates] save failed', error)
    return jsonError(error.message, 500)
  }
}
