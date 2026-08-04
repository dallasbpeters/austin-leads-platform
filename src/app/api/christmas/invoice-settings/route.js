import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { ensureChristmasInvoiceTables } from '@/lib/christmas/invoice-db'
import { getChristmasInvoiceSettings, saveChristmasInvoiceSettings } from '@/lib/christmas/invoice-settings'

export const runtime = 'nodejs'
export const maxDuration = 30

async function requireSession() {
  const session = await safeAuth()
  if (!session?.user) {
    return null
  }
  return session
}

export async function GET() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureChristmasInvoiceTables()
    const settings = await getChristmasInvoiceSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[christmas/invoice-settings] load failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    await ensureChristmasInvoiceTables()
    const settings = await saveChristmasInvoiceSettings(body)
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[christmas/invoice-settings] save failed', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
