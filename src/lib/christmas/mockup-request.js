import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { ensureChristmasInvoiceTables } from '@/lib/christmas/invoice-db'
import { ensureChristmasMockupTables } from '@/lib/christmas/mockup-db'

/*
 * Shared plumbing for the mockup API routes: auth, schema, and reading the
 * multipart save body (state JSON + photo + rendered JPEG).
 */

/* Vercel caps request bodies at 4.5 MB; the client downscales well under this. */
const MAX_IMAGE_BYTES = 2_000_000
const MAX_TITLE_LENGTH = 120

export const jsonError = (error, status) => NextResponse.json({ error }, { status })

export async function hasSession() {
  const session = await safeAuth()
  return Boolean(session?.user)
}

export async function ensureMockupSchema() {
  await ensureChristmasInvoiceTables()
  await ensureChristmasMockupTables()
}

async function readImage(form, field) {
  const file = form.get(field)
  if (!file || typeof file.arrayBuffer !== 'function') {
    return { error: `Missing ${field} image` }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `The ${field} image is too large` }
  }
  return { buffer: Buffer.from(await file.arrayBuffer()) }
}

/** Parses a mockup save body. Returns `{ error }` or `{ title, state, photo, rendered }`. */
export async function readMockupForm(request) {
  let form
  try {
    form = await request.formData()
  } catch {
    return { error: 'Expected form data' }
  }

  let state
  try {
    state = JSON.parse(String(form.get('state') || ''))
  } catch {
    return { error: 'Invalid mockup state' }
  }

  const photo = await readImage(form, 'photo')
  const rendered = await readImage(form, 'rendered')
  const imageError = photo.error || rendered.error
  if (imageError) {
    return { error: imageError }
  }

  const title = String(form.get('title') || '')
    .trim()
    .slice(0, MAX_TITLE_LENGTH)
  return { title, state, photo: photo.buffer, rendered: rendered.buffer }
}

/** Streams one stored image, or a 404. */
export function imageResponse(image) {
  if (!image) {
    return jsonError('Not found', 404)
  }
  return new NextResponse(image.bytes, {
    headers: { 'Content-Type': image.type, 'Cache-Control': 'private, no-cache' },
  })
}
