import { groq } from 'next-sanity'
import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { isHeroSectionBlock } from '@/lib/platform/section-helpers'
import { registerUnsplashDownload } from '@/lib/platform/unsplash'
import { sanityWriteClient } from '@/sanity/client'

export const runtime = 'nodejs'

function buildHeroImage(photo) {
  return {
    source: 'unsplash',
    unsplashId: photo.id,
    alt: photo.alt || 'Unsplash photo',
    description: photo.description || '',
    color: photo.color || '',
    blurHash: photo.blurHash || '',
    width: photo.width || null,
    height: photo.height || null,
    creditName: photo.user?.name || '',
    creditUsername: photo.user?.username || '',
    creditUrl: photo.user?.html || '',
    unsplashUrl: photo.links?.html || '',
    downloadLocation: photo.links?.downloadLocation || '',
    urls: {
      raw: photo.urls?.raw || '',
      full: photo.urls?.full || '',
      regular: photo.urls?.regular || '',
      small: photo.urls?.small || '',
      thumb: photo.urls?.thumb || '',
    },
  }
}

export async function POST(request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  if (!sanityWriteClient) {
    return NextResponse.json({ error: 'Sanity write credentials are not configured.' }, { status: 503 })
  }

  const { pageId } = await params
  const body = await request.json()
  const photo = body?.photo

  if (!pageId || !photo?.id || !photo?.links?.downloadLocation) {
    return NextResponse.json({ error: 'Invalid image payload.' }, { status: 400 })
  }

  try {
    const page = await sanityWriteClient.fetch(
      groq`*[_id == $pageId][0]{
        _id,
        sections[]{
          _key,
          type,
          _type
        }
      }`,
      { pageId },
    )

    if (!page) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    }

    const heroSectionIndex = page.sections?.findIndex(isHeroSectionBlock) ?? -1

    if (heroSectionIndex < 0) {
      return NextResponse.json({ error: 'Page does not have a hero section.' }, { status: 400 })
    }

    const heroSection = page.sections[heroSectionIndex]
    const heroImage = buildHeroImage(photo)

    await registerUnsplashDownload(photo.links.downloadLocation)

    const patchPath = heroSection?._key
      ? `sections[_key=="${heroSection._key}"].heroImage`
      : `sections[${heroSectionIndex}].heroImage`

    await sanityWriteClient
      .patch(pageId)
      .set({ [patchPath]: heroImage })
      .commit()

    return NextResponse.json({ heroImage })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save hero image.' },
      { status: 502 },
    )
  }
}
