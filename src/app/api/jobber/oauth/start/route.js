import { randomBytes } from 'node:crypto'

import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { buildJobberAuthorizeUrl, hasJobberCredentials } from '@/lib/jobber/auth'

export const runtime = 'nodejs'

const STATE_COOKIE = 'jobber_oauth_state'

export async function GET(request) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasJobberCredentials()) {
    return NextResponse.json(
      { error: 'Jobber is not configured. Set JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET.' },
      { status: 503 },
    )
  }

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/jobber/oauth/callback`
  const state = randomBytes(16).toString('hex')

  const authorizeUrl = buildJobberAuthorizeUrl({ redirectUri, state })
  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return response
}
