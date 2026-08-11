import { NextResponse } from 'next/server'

import { describeGoogleBusinessCredentialGap, hasGoogleBusinessCredentials } from '@/lib/googleBusiness/auth'
import { listGoogleBusinessAccounts, listGoogleBusinessLocations } from '@/lib/googleBusiness/reviews'
import { syncGoogleReviews } from '@/lib/googleBusiness/syncReviews'

export const dynamic = 'force-dynamic'

/*
 * GET  → discovery. Lists the accounts and locations this token can see, which is
 *        how you find the ids to paste into Site settings → Google Business Profile.
 * POST → runs the review sync.
 *
 * Guarded by CRON_SECRET in production, which is also the header Vercel Cron sends
 * automatically. Left open in development so it is testable locally.
 */
function isAuthorised(request) {
  const secret = (process.env.CRON_SECRET || '').trim()

  if (process.env.NODE_ENV !== 'production') {
    return true
  }

  if (!secret) {
    return false
  }

  return request.headers.get('authorization') === `Bearer ${secret}`
}

export const GET = async (request) => {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  if (!hasGoogleBusinessCredentials()) {
    return NextResponse.json({ ready: false, reason: describeGoogleBusinessCredentialGap() }, { status: 200 })
  }

  try {
    const accounts = await listGoogleBusinessAccounts()
    const locations = []

    for (const account of accounts) {
      const found = await listGoogleBusinessLocations(account.name)
      locations.push(...found.map((location) => ({ ...location, account: account.name })))
    }

    return NextResponse.json({ ready: true, accounts, locations })
  } catch (error) {
    return NextResponse.json(
      { ready: false, error: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    )
  }
}

export const POST = async (request) => {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const result = await syncGoogleReviews()
    return NextResponse.json(result, { status: result.ok ? 200 : 200 })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
