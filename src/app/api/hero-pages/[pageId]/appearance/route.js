import { groq } from 'next-sanity'
import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { clampHeroOverlayOpacity, normalizeHeroOverlayDirection } from '@/lib/platform/heroAppearance'
import { isHeroSectionBlock } from '@/lib/platform/section-helpers'
import { sanityWriteClient } from '@/sanity/client'

export const runtime = 'nodejs'

function extractHeroAppearance(body) {
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

  return {
    heroTextColor,
    heroOverlayStartColor,
    heroOverlayEndColor,
    heroOverlayDirection,
    heroOverlayStartOpacity,
    heroOverlayEndOpacity,
    heroOverlayOpacity,
  }
}

async function saveHeroAppearanceToSanity(pageId, heroAppearance) {
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
    return { error: 'Page not found.', status: 404 }
  }

  const heroSectionIndex = page.sections?.findIndex(isHeroSectionBlock) ?? -1
  if (heroSectionIndex < 0) {
    return { error: 'Page does not have a hero section.', status: 400 }
  }

  const heroSection = page.sections[heroSectionIndex]
  const sectionPath = (field) =>
    heroSection?._key
      ? `sections[_key=="${heroSection._key}"].${field}`
      : `sections[${heroSectionIndex}].${field}`

  const {
    heroTextColor,
    heroOverlayStartColor,
    heroOverlayEndColor,
    heroOverlayDirection,
    heroOverlayStartOpacity,
    heroOverlayEndOpacity,
    heroOverlayOpacity,
  } = heroAppearance

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

  return { heroAppearance }
}

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  if (!sanityWriteClient) {
    return NextResponse.json({ error: 'Sanity write credentials are not configured.' }, { status: 503 })
  }

  const { pageId } = await params
  const body = await request.json()
  const heroAppearance = extractHeroAppearance(body)

  try {
    const result = await saveHeroAppearanceToSanity(pageId, heroAppearance)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save hero appearance.' },
      { status: 502 },
    )
  }
}
