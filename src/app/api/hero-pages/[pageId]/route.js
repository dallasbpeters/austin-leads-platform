import { groq } from 'next-sanity'
import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { sanityWriteClient } from '@/sanity/client'

export const runtime = 'nodejs'

export const DELETE = async (_request, context) => {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!sanityWriteClient) {
    return NextResponse.json({ error: 'Sanity write credentials are not configured.' }, { status: 503 })
  }

  const resolvedParams = await context?.params
  const rawPageId = Array.isArray(resolvedParams?.pageId) ? resolvedParams.pageId[0] : resolvedParams?.pageId
  const pageId = rawPageId?.trim()

  if (!pageId) {
    return NextResponse.json({ error: 'Page id is required.' }, { status: 400 })
  }

  const page = await sanityWriteClient.fetch(
    groq`*[
      _id == $pageId &&
      _type in ["page", "servicePage", "locationPage"] &&
      templateLevel == "hero"
    ][0]{
      _id,
      title
    }`,
    { pageId },
  )

  if (!page?._id) {
    return NextResponse.json({ error: 'Hero page not found.' }, { status: 404 })
  }

  await sanityWriteClient.delete(page._id)

  return NextResponse.json({
    deletedId: page._id,
    title: page.title,
  })
}
