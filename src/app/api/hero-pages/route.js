import { groq } from 'next-sanity'
import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { getHeroPages, getHeroSitesForAdmin, getSiteById } from '@/lib/platform/content'
import { isUnsplashConfigured } from '@/lib/platform/unsplash'
import { withSectionKeys } from '@/lib/sanity/keys'
import { sanityWriteClient } from '@/sanity/client'

export const runtime = 'nodejs'

export async function GET() {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  const pages = await getHeroPages()
  const sites = await getHeroSitesForAdmin()

  return NextResponse.json({
    pages,
    sites,
    unsplashEnabled: isUnsplashConfigured(),
    canCreatePages: Boolean(sanityWriteClient),
  })
}

function createSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  if (!sanityWriteClient) {
    return NextResponse.json({ error: 'Sanity write credentials are not configured.' }, { status: 503 })
  }

  const body = await request.json()
  const title = body?.title?.trim()
  const siteId = body?.siteId?.trim()
  const pageType = body?.pageType?.trim() || 'home'
  const description = body?.description?.trim() || ''

  if (!title || !siteId) {
    return NextResponse.json({ error: 'Title and hero site are required.' }, { status: 400 })
  }

  let site = await sanityWriteClient.fetch(
    groq`*[_type == "site" && _id == $siteId && tier == "hero"][0]{
      _id,
      "id": _id,
      "slug": slug.current,
      name,
      primaryDomain,
      tier
    }`,
    { siteId },
  )

  if (!site) {
    const fixtureSite = getSiteById(siteId)

    if (!fixtureSite || fixtureSite.tier !== 'hero') {
      return NextResponse.json({ error: 'That hero site does not exist in Sanity yet.' }, { status: 400 })
    }

    await sanityWriteClient.createIfNotExists({
      _id: fixtureSite.id,
      _type: 'site',
      name: fixtureSite.name,
      shortName: fixtureSite.shortName,
      category: fixtureSite.category,
      categoryLabel: fixtureSite.categoryLabel,
      tier: fixtureSite.tier,
      slug: {
        _type: 'slug',
        current: fixtureSite.slug,
      },
      primaryDomain: fixtureSite.primaryDomain,
      aliases: fixtureSite.aliases || [],
      redirectTarget: fixtureSite.redirectTarget || '',
      brand: fixtureSite.brand || {},
      seo: fixtureSite.seo || {},
      leadForm: fixtureSite.leadForm || {},
      organization: fixtureSite.organization || {},
    })

    site = {
      id: fixtureSite.id,
      slug: fixtureSite.slug,
      name: fixtureSite.name,
      primaryDomain: fixtureSite.primaryDomain,
      tier: fixtureSite.tier,
    }
  }

  const slug = pageType === 'home' ? '/' : createSlug(body?.slug?.trim() || title)

  const existingPage = await sanityWriteClient.fetch(
    groq`*[
      _type in ["page", "servicePage", "locationPage"] &&
      site._ref == $siteId &&
      slug.current == $slug
    ][0]{
      _id
    }`,
    { siteId, slug },
  )

  if (existingPage?._id) {
    return NextResponse.json(
      { error: 'A page with that slug already exists for this site.' },
      { status: 409 },
    )
  }

  const documentType =
    pageType === 'service' ? 'servicePage' : pageType === 'location' ? 'locationPage' : 'page'

  const sections = withSectionKeys([
    {
      _type: 'heroSection',
      type: 'hero',
      eyebrow: site.name,
      title,
      body: description || `Add hero copy for ${title}.`,
      heroTextColor: '#ffffff',
      heroOverlayColor: '#0f172a',
      heroOverlayStartColor: '#0f172a',
      heroOverlayEndColor: '#0f172a',
      heroOverlayDirection: 'to bottom',
      heroOverlayStartOpacity: 0.6,
      heroOverlayEndOpacity: 0.15,
      heroOverlayOpacity: 0.42,
      metrics: [],
      items: [],
    },
  ])

  const created = await sanityWriteClient.create({
    _type: documentType,
    title,
    description,
    pageType,
    templateLevel: 'hero',
    site: {
      _type: 'reference',
      _ref: site.id,
    },
    slug: {
      _type: 'slug',
      current: slug,
    },
    sections,
  })

  return NextResponse.json(
    {
      page: {
        id: created._id,
        title,
        slug: slug === '/' ? '' : slug,
        pageType,
        templateLevel: 'hero',
        site,
        heroSection: sections[0],
      },
    },
    { status: 201 },
  )
}
