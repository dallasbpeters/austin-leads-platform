import { NextResponse } from 'next/server'

import { overLimit } from '@/lib/solar-fit/rate-limit'
import { dataset, projectId } from '@/sanity/env'

/*
 * Studio's "Remove background" image source. Runs BiRefNet on fal.ai, then
 * uploads the transparent PNG to Sanity as a new image asset and answers with
 * its id, so a big PNG never has to come back through this route.
 *
 * The caller sends their own Sanity login (Authorization: Bearer <token>).
 * It is checked with Sanity before any fal credit is spent, and the upload
 * runs as that editor, with their permissions. FAL_API_KEY stays on the server.
 */

const FAL_ENDPOINT = 'https://fal.run/fal-ai/birefnet/v2'
const SANITY_API = `https://${projectId}.api.sanity.io/v2021-06-07`

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

/** The Sanity user behind a token, or null when the token is missing or not valid. */
async function sanityUser(token) {
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

/* Only images already in this project's CDN, or an image the editor picked from their computer. */
const isAllowedSource = (value) =>
  typeof value === 'string' &&
  (value.startsWith(`https://cdn.sanity.io/images/${projectId}/`) ||
    /^data:image\/(png|jpe?g|webp);base64,/u.test(value))

export async function POST(request) {
  if (overLimit(request, { name: 'remove-background', perMinute: 10 })) {
    return reply(request, { error: 'Too many requests. Wait a minute and try again.' }, 429)
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/iu, '')
  if (!(await sanityUser(token))) {
    return reply(request, { error: 'Sign in to Studio to remove backgrounds.' }, 401)
  }

  const falKey = (process.env.FAL_API_KEY || process.env.FAL_KEY)?.trim()
  if (!falKey) {
    return reply(
      request,
      { error: 'Background removal is not set up yet: add FAL_API_KEY to the server environment.' },
      503,
    )
  }

  const { image, filename } = await request.json().catch(() => ({}))
  if (!isAllowedSource(image)) {
    return reply(request, { error: 'That image cannot be used here.' }, 400)
  }

  const cut = await fetch(FAL_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: image,
      model: 'General Use (Heavy)',
      operating_resolution: '2048x2048',
      refine_foreground: true,
      output_format: 'png',
    }),
    cache: 'no-store',
  })
  if (!cut.ok) {
    console.error('[remove-background] fal', cut.status, await cut.text().catch(() => ''))
    return reply(request, { error: `The background service failed (${cut.status}). Try again.` }, 502)
  }
  const result = await cut.json()
  const resultUrl = result?.image?.url
  if (!resultUrl) {
    return reply(request, { error: 'The background service sent no image back.' }, 502)
  }

  const png = await fetch(resultUrl, { cache: 'no-store' })
  if (!png.ok) {
    return reply(request, { error: 'Could not download the cut-out.' }, 502)
  }

  const name = `${String(filename || 'image').replace(/\.[^.]+$/u, '')}-no-background.png`
  const upload = await fetch(`${SANITY_API}/assets/images/${dataset}?filename=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/png' },
    body: await png.arrayBuffer(),
    cache: 'no-store',
  })
  if (!upload.ok) {
    console.error('[remove-background] sanity upload', upload.status, await upload.text().catch(() => ''))
    return reply(request, { error: 'Could not save the cut-out to Sanity.' }, 502)
  }
  const uploaded = await upload.json()
  const asset = uploaded?.document
  return reply(request, { assetId: asset?._id, url: asset?.url })
}
