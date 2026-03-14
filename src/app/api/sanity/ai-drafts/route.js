import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { createAiDraftDocument } from '@/lib/platform/aiDrafting'
import { canonicalStudioUrl, localStudioUrl } from '@/sanity/env'

export const runtime = 'nodejs'

function getAllowedStudioOrigins() {
  return [canonicalStudioUrl, localStudioUrl]
    .map((value) => {
      try {
        return new URL(value).origin
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function buildCorsHeaders(request) {
  const requestOrigin = request.headers.get('origin')
  const allowedOrigins = getAllowedStudioOrigins()
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0] || '*'

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-AI-Draft-Token',
    Vary: 'Origin',
  }
}

async function isAuthorizedRequest(request) {
  const configuredToken = process.env.SANITY_STUDIO_AI_DRAFT_TOKEN
  const requestToken = request.headers.get('x-ai-draft-token')

  if (configuredToken && requestToken === configuredToken) {
    return true
  }

  const session = await safeAuth()
  return Boolean(session?.user)
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  })
}

export async function POST(request) {
  const headers = buildCorsHeaders(request)

  if (!(await isAuthorizedRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  const body = await request.json()

  if (!body?.siteId || !body?.title || !body?.brief || !body?.contentType) {
    return NextResponse.json(
      { error: 'siteId, title, brief, and contentType are required.' },
      { status: 400, headers },
    )
  }

  try {
    const result = await createAiDraftDocument({
      siteId: body.siteId,
      siteName: body.siteName,
      contentType: body.contentType,
      title: body.title,
      slug: body.slug,
      brief: body.brief,
      sources: body.sources,
    })

    return NextResponse.json(result, { status: 201, headers })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create draft.' },
      { status: 500, headers },
    )
  }
}
