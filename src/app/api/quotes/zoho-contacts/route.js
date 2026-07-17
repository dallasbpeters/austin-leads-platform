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
        error:
          zoho?.error ||
          'Connect Zoho and approve Contacts access to search. Sign out/in with Zoho if you connected earlier without CRM scopes.',
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
    const message = String(error.message || '')
    const scopeMismatch =
      error.status === 401 || /invalid oauth scope|OAUTH_SCOPE_MISMATCH|INVALID_TOKEN/i.test(message)
    return NextResponse.json(
      {
        error: scopeMismatch
          ? 'Zoho denied Contacts access (missing OAuth scope). Click Connect Zoho and approve CRM Contacts + Search.'
          : message || 'Zoho contact search failed',
        needsZohoAuth: scopeMismatch,
        contacts: [],
      },
      { status: scopeMismatch ? 401 : 502 },
    )
  }
}
