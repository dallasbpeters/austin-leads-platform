import { groq } from 'next-sanity'
import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { clampHeroOverlayOpacity, normalizeHeroOverlayDirection } from '@/lib/platform/heroAppearance'
import { sanityWriteClient } from '@/sanity/client'

export const runtime = 'nodejs'

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  if (!sanityWriteClient) {
    return NextResponse.json({ error: 'Sanity write credentials are not configured.' }, { status: 503 })
  }

  const { pageId } = await params
  const body = await request.json()
  const heroTextColor = body?.heroTextColor?.trim() || '#ffffff'
  const heroOverlayStartColor =
    body?.heroOverlayStartColor?.trim() || body?.heroOverlayColor?.trim() || '#0f172a'
  const heroOverlayEndColor = body?.heroOverlayEndColor?.trim() || heroOverlayStartColor
  const heroOverlayDirection = normalizeHeroOverlayDirection(body?.heroOverlayDirection?.trim())
  const heroOverlayStartOpacity = clampHeroOverlayOpacity(Number(body?.heroOverlayStartOpacity), 0.15)
  const heroOverlayEndOpacity = clampHeroOverlayOpacity(Number(body?.heroOverlayEndOpacity), 0.6)
  const heroOverlayOpacity = clampHeroOverlayOpacity(
    Number(body?.heroOverlayOpacity),
    (heroOverlayStartOpacity + heroOverlayEndOpacity) / 2,
  )

  try {
    const page = await sanityWriteClient.fetch(
      groq`*[_id == $pageId][0]{
        _id,
        sections[]{
          _key,
          type
        }
      }`,
      { pageId },
    )

    if (!page) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    }

    const heroSectionIndex = page.sections?.findIndex((section) => section.type === 'hero') ?? -1

    if (heroSectionIndex < 0) {
      return NextResponse.json({ error: 'Page does not have a hero section.' }, { status: 400 })
    }

    const heroSection = page.sections[heroSectionIndex]
    const sectionPath = (field) =>
      heroSection?._key
        ? `sections[_key=="${heroSection._key}"].${field}`
        : `sections[${heroSectionIndex}].${field}`

    await sanityWriteClient
      .patch(pageId)
      .set({
        [sectionPath('heroTextColor')]: heroTextColor,
        [sectionPath('heroOverlayColor')]: heroOverlayStartColor,
        [sectionPath('heroOverlayStartColor')]: heroOverlayStartColor,
        [sectionPath('heroOverlayEndColor')]: heroOverlayEndColor,
        [sectionPath('heroOverlayDirection')]: heroOverlayDirection,
        [sectionPath('heroOverlayStartOpacity')]: heroOverlayStartOpacity,
        [sectionPath('heroOverlayEndOpacity')]: heroOverlayEndOpacity,
        [sectionPath('heroOverlayOpacity')]: heroOverlayOpacity,
      })
      .commit()

    return NextResponse.json({
      heroAppearance: {
        heroTextColor,
        heroOverlayColor: heroOverlayStartColor,
        heroOverlayStartColor,
        heroOverlayEndColor,
        heroOverlayDirection,
        heroOverlayStartOpacity,
        heroOverlayEndOpacity,
        heroOverlayOpacity,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save hero appearance.' },
      { status: 502 },
    )
  }
}
