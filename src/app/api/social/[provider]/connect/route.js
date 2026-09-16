import { randomBytes } from 'node:crypto'

import { NextResponse } from 'next/server'

import { hasTokenKey } from '@/lib/social/accounts-db'
import { callbackPath } from '@/lib/social/providers'
import {
  backToSocialPage,
  redirectBase,
  requireSocialAdmin,
  resolveProvider,
  STATE_COOKIE,
} from '@/lib/social/request'

export const runtime = 'nodejs'

/** GET — send the admin to the platform's consent screen. */
export async function GET(request, { params }) {
  const auth = await requireSocialAdmin()
  if (auth.error) {
    return auth.error
  }
  const { provider, error } = await resolveProvider(params)
  if (error) {
    return error
  }
  if (!provider.configured()) {
    return backToSocialPage(request, { error: `${provider.label} is not configured yet.` })
  }
  if (!hasTokenKey()) {
    return backToSocialPage(request, { error: 'Set SOCIAL_TOKEN_KEY before connecting any account.' })
  }

  const state = `${provider.id}.${randomBytes(16).toString('hex')}`
  const redirectUri = `${redirectBase(request)}${callbackPath(provider.id)}`
  const response = NextResponse.redirect(provider.authorizeUrl({ redirectUri, state }))
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return response
}
