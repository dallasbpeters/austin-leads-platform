import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { resolveRefreshToken } from '@/lib/platform/youtube-db'
import { getSanityServerClient, sanityWriteClient } from '@/sanity/client'

export const runtime = 'nodejs'

const PROJECTION = `{
  _id, title, "slug": slug.current, message, status, reviewUrl, renderUrl, youtube,
  "beatCount": count(beats)
}`

/* The admin page needs the projects AND whether a channel is connected, and one
   round trip is nicer than two. */
export async function GET() {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  const sanity = getSanityServerClient({ preview: false, stega: false })
  if (!sanity) {
    return NextResponse.json({ error: 'Sanity is not configured' }, { status: 503 })
  }

  const projects = await sanity.fetch(`*[_type == "videoProject"] | order(_createdAt desc) ${PROJECTION}`)

  let youtubeConnected = false
  let channelEmail = null
  try {
    const stored = await resolveRefreshToken()
    youtubeConnected = Boolean(stored)
    channelEmail = stored?.channelEmail ?? null
  } catch {
    /* No database yet is not an error here — it just means not connected. */
  }

  return NextResponse.json({ projects, youtubeConnected, channelEmail })
}

/* Status changes only. Copy is edited in Studio, not here — this page exists to
   watch the film and ship it, and a second editing surface would drift. */
export async function PATCH(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body' }, { status: 400 })
  }

  const { id, status } = body || {}
  const allowed = new Set(['draft', 'review', 'changes', 'approved', 'published'])
  if (!id || !allowed.has(status)) {
    return NextResponse.json({ error: 'id and a valid status are required' }, { status: 400 })
  }
  if (!sanityWriteClient) {
    return NextResponse.json({ error: 'SANITY_API_WRITE_TOKEN is not set' }, { status: 503 })
  }

  await sanityWriteClient.patch(id).set({ status }).commit()
  return NextResponse.json({ id, status })
}
