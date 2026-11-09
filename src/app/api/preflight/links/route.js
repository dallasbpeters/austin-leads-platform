import { NextResponse } from 'next/server'

import { bearerToken, sanityUser } from '@/lib/sanity/studio-user'
import { overLimit } from '@/lib/solar-fit/rate-limit'

/*
 * Studio's Preflight view: is each outside link still reachable? Only for
 * signed-in Studio editors (their Sanity login is checked), at most 40 links per
 * request, each with a short timeout. Studio cannot check these itself because
 * most sites refuse cross-origin requests.
 */

const MAX_LINKS = 40
const TIMEOUT_MS = 8000

const corsHeaders = (request) => ({
  'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
})

const reply = (request, body, status = 200) =>
  NextResponse.json(body, { status, headers: corsHeaders(request) })

export function OPTIONS(request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) })
}

/** One link: HEAD first (cheap), then GET for sites that refuse HEAD. */
async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'User-Agent': 'TexasSolarRoofingPros-Preflight/1.0 (+link check)' },
        cache: 'no-store',
      })
      if (method === 'HEAD' && [403, 405, 501].includes(response.status)) {
        continue
      }
      return { url, status: response.status, ok: response.ok }
    } catch (error) {
      if (method === 'GET') {
        return { url, status: 0, ok: false, error: error instanceof Error ? error.name : 'Failed' }
      }
    }
  }
  return { url, status: 0, ok: false }
}

export async function POST(request) {
  if (overLimit(request, { name: 'preflight-links', perMinute: 20 })) {
    return reply(request, { error: 'Too many checks. Wait a minute and try again.' }, 429)
  }
  if (!(await sanityUser(bearerToken(request)))) {
    return reply(request, { error: 'Sign in to Studio to check links.' }, 401)
  }
  const { urls } = await request.json().catch(() => ({}))
  const list = [
    ...new Set((Array.isArray(urls) ? urls : []).filter((url) => /^https?:\/\//iu.test(url))),
  ].slice(0, MAX_LINKS)
  const results = await Promise.all(list.map(check))
  return reply(request, { results })
}
