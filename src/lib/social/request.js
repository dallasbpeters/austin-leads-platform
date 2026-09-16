import { NextResponse } from 'next/server'

import { isFullAdminRole } from '@/lib/auth/roles'
import { safeAuth } from '@/lib/auth/session'

import { getProvider } from './providers'

export const SOCIAL_PAGE = '/social'
export const STATE_COOKIE = 'social_oauth_state'

/*
 * Social accounts post under the company's name, so only full admins can
 * connect or disconnect them.
 */
export async function requireSocialAdmin() {
  const session = await safeAuth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!isFullAdminRole(session.user.role)) {
    return { error: NextResponse.json({ error: 'Only admins can manage social accounts.' }, { status: 403 }) }
  }
  return { user: session.user }
}

export async function resolveProvider(params) {
  const { provider: id } = await params
  const provider = getProvider(id)
  return provider
    ? { provider }
    : { error: NextResponse.json({ error: `Unknown platform: ${id}` }, { status: 404 }) }
}

/*
 * The redirect URI has to match the app settings exactly. Behind Vercel the
 * request origin is right; SOCIAL_REDIRECT_BASE pins it when it isn't (both
 * platforms refuse plain-http localhost, so local testing needs a tunnel).
 */
export function redirectBase(request) {
  const pinned = (process.env.SOCIAL_REDIRECT_BASE || '').trim().replace(/\/$/, '')
  return pinned || new URL(request.url).origin
}

export function backToSocialPage(request, params) {
  const target = new URL(SOCIAL_PAGE, new URL(request.url).origin)
  for (const [key, value] of Object.entries(params)) {
    target.searchParams.set(key, value)
  }
  const response = NextResponse.redirect(target)
  response.cookies.delete(STATE_COOKIE)
  return response
}
