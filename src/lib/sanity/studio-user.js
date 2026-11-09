import { projectId } from '@/sanity/env'

/*
 * For routes Studio calls from another origin (the hosted Studio cannot send our
 * session cookie): the editor's own Sanity login comes as a bearer token and is
 * checked with Sanity itself.
 */
export const SANITY_API = `https://${projectId}.api.sanity.io/v2021-06-07`

/** The bearer token from an Authorization header, or ''. */
export const bearerToken = (request) =>
  request.headers.get('authorization')?.replace(/^Bearer\s+/iu, '') || ''

/** The Sanity user behind a token, or null when the token is missing or not valid. */
export async function sanityUser(token) {
  if (!token) {
    return null
  }
  const response = await fetch(`${SANITY_API}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) {
    return null
  }
  const user = await response.json()
  return user?.id ? user : null
}
