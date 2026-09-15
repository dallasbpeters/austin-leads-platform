import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { accessTokenFromRefresh, resolveRefreshToken } from '@/lib/platform/youtube-db'
import { getSanityServerClient } from '@/sanity/client'

export const runtime = 'nodejs'
/*
 * A 64s 1080p render is roughly 50-120 MB. Streaming that to YouTube takes
 * longer than the 60s most routes here use. 300 is the Vercel Pro ceiling; if a
 * render is bigger than this window allows, upload it from a machine with
 * `npm run video:yt:push` instead — same script, no timeout.
 */
export const maxDuration = 300

/*
 * Upload an already-rendered film to YouTube.
 *
 * Vercel cannot RENDER the video — that needs headless Chrome and ffmpeg for
 * minutes, which is what HyperFrames' cloud/Lambda/Cloud Run targets are for.
 * What Vercel can do is take a render that already exists at a URL and push it,
 * which is the step that actually needs the channel's credentials.
 *
 * POST { slug }  — reads videoProject.renderUrl, uploads, writes the id back.
 */
/* Everything that can refuse the request, in one place, so POST stays readable.
   Returns either { response } to send back, or { sanity, doc } to proceed. */
async function loadApprovedProject(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return { response: NextResponse.json({ error: 'Expected a JSON body' }, { status: 400 }) }
  }

  const slug = body?.slug?.trim()
  if (!slug) {
    return { response: NextResponse.json({ error: 'slug is required' }, { status: 400 }) }
  }

  const sanity = getSanityServerClient({ preview: false, stega: false })
  if (!sanity) {
    return { response: NextResponse.json({ error: 'Sanity is not configured' }, { status: 503 }) }
  }

  const doc = await sanity.fetch(
    `*[_type == "videoProject" && slug.current == $slug][0]{ _id, title, status, renderUrl, youtube }`,
    { slug },
  )
  if (!doc) {
    return { response: NextResponse.json({ error: `No videoProject with slug "${slug}"` }, { status: 404 }) }
  }
  if (doc.status !== 'approved') {
    return {
      response: NextResponse.json(
        { error: `Status is "${doc.status || 'draft'}". Set it to "approved" before uploading.` },
        { status: 409 },
      ),
    }
  }
  if (!doc.renderUrl) {
    return {
      response: NextResponse.json(
        { error: 'videoProject.renderUrl is empty. Render the film and put its URL there first.' },
        { status: 409 },
      ),
    }
  }
  return { sanity, doc }
}

function listingFor(doc) {
  return {
    snippet: {
      title: doc.title,
      description: doc.youtube?.description || '',
      tags: doc.youtube?.tags || [],
      categoryId: '26',
    },
    status: { privacyStatus: doc.youtube?.privacy || 'unlisted', selfDeclaredMadeForKids: false },
  }
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  const loaded = await loadApprovedProject(request)
  if (loaded.response) {
    return loaded.response
  }
  const { sanity, doc } = loaded

  const stored = await resolveRefreshToken()
  if (!stored) {
    return NextResponse.json(
      { error: 'YouTube is not connected. Open /api/youtube/auth as the channel owner.' },
      { status: 503 },
    )
  }

  let accessToken
  try {
    accessToken = await accessTokenFromRefresh(stored.refreshToken)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }

  /* Pull the render. HEAD first so the length is known before a session opens —
     YouTube's resumable endpoint wants it up front. */
  const head = await fetch(doc.renderUrl, { method: 'HEAD' })
  const size = Number(head.headers.get('content-length') || 0)
  if (!head.ok || !size) {
    return NextResponse.json(
      { error: `Could not read ${doc.renderUrl} (${head.status}, length ${size || 'unknown'})` },
      { status: 502 },
    )
  }

  const meta = listingFor(doc)
  const privacy = meta.status.privacyStatus

  const start = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': String(size),
        'X-Upload-Content-Type': 'video/mp4',
      },
      body: JSON.stringify(meta),
    },
  )
  const session = start.headers.get('location')
  if (!session) {
    return NextResponse.json(
      { error: `Could not open an upload session: ${start.status} ${await start.text()}` },
      { status: 502 },
    )
  }

  /* Stream the render straight through — never buffer it, a function has far
     less memory than the file is large. */
  const source = await fetch(doc.renderUrl)
  if (!source.ok || !source.body) {
    return NextResponse.json({ error: `Could not fetch ${doc.renderUrl}` }, { status: 502 })
  }

  const put = await fetch(session, {
    method: 'PUT',
    headers: { 'Content-Length': String(size), 'Content-Type': 'video/mp4' },
    body: source.body,
    duplex: 'half',
  })
  const result = await put.json().catch(() => ({}))
  if (!result.id) {
    return NextResponse.json({ error: `Upload failed: ${put.status}`, detail: result }, { status: 502 })
  }

  const url = `https://www.youtube.com/watch?v=${result.id}`
  await sanity
    .patch(doc._id)
    .set({ 'youtube.videoId': result.id, 'youtube.url': url, status: 'published' })
    .commit()

  return NextResponse.json({ videoId: result.id, url, privacy, bytes: size })
}
