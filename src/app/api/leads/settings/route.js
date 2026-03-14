import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { getLeadRoutingSettings, saveLeadRoutingSettings } from '@/lib/leads/settings'

export const runtime = 'nodejs'

function badRequest(message, status = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}

export async function GET() {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  const settings = await getLeadRoutingSettings()
  return NextResponse.json(
    { settings },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return badRequest('Invalid request body.')
  }

  try {
    const settings = await saveLeadRoutingSettings(payload)
    return NextResponse.json(
      { ok: true, settings },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    )
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Unable to save lead settings.', 422)
  }
}
