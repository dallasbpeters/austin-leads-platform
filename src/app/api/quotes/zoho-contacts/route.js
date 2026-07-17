import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { searchZohoContacts } from '@/lib/zoho/contacts'
import { getZohoUserAccessFromRequest } from '@/lib/zoho/user-auth'

export const runtime = 'nodejs'

/**
 * Live Zoho CRM Contacts typeahead using the signed-in user's Zoho OAuth token.
 * Does not store contacts.
 */
export async function GET(request) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  if (q.length < 2) {
    return NextResponse.json({ contacts: [], zohoConnected: Boolean(session.user.zohoConnected) })
  }

  const zoho = await getZohoUserAccessFromRequest(request)
  if (!zoho?.accessToken) {
    return NextResponse.json(
      {
        error: 'Connect Zoho to search contacts.',
        needsZohoAuth: true,
        zohoConnected: false,
        contacts: [],
      },
      { status: 401 },
    )
  }

  try {
    const contacts = await searchZohoContacts({
      accessToken: zoho.accessToken,
      apiDomain: zoho.apiDomain,
      query: q,
      limit: 8,
    })
    return NextResponse.json({ contacts, zohoConnected: true })
  } catch (error) {
    console.error('[quotes/zoho-contacts] search failed', error)
    const status = error.status === 401 ? 401 : 502
    return NextResponse.json(
      {
        error: error.message || 'Zoho contact search failed',
        needsZohoAuth: status === 401,
        contacts: [],
      },
      { status },
    )
  }
}
