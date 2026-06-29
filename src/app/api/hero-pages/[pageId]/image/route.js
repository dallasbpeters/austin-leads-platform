import { groq } from 'next-sanity'
import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { isHeroSectionBlock } from '@/lib/platform/section-helpers'
import { registerUnsplashDownload } from '@/lib/platform/unsplash'
import { sanityWriteClient } from '@/sanity/client'

export const runtime = 'nodejs'

const IMAGE_URL_KEYS = ['raw', 'full', 'regular', 'small', 'thumb']

const pickString = (value, fallback) => {
  return value || fallback
}

const buildImageUrls = (urls) => {
  return Object.fromEntries(IMAGE_URL_KEYS.map((key) => [key, pickString(urls?.[key], '')]))
}

const buildHeroImage = (photo) => {
  return {
    source: 'unsplash',
    unsplashId: photo.id,
    alt: pickString(photo.alt, 'Unsplash photo'),
    description: pickString(photo.description, ''),
    color: pickString(photo.color, ''),
    blurHash: pickString(photo.blurHash, ''),
    width: pickString(photo.width, null),
    height: pickString(photo.height, null),
    creditName: pickString(photo.user?.name, ''),
    creditUsername: pickString(photo.user?.username, ''),
    creditUrl: pickString(photo.user?.html, ''),
    unsplashUrl: pickString(photo.links?.html, ''),
    downloadLocation: pickString(photo.links?.downloadLocation, ''),
    urls: buildImageUrls(photo.urls),
  }
}

export const POST = async (request, { params }) => {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

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
