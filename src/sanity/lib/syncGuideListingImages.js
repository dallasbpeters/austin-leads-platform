import groq from 'groq'

import { isHeroSectionBlock } from '../../lib/platform/section-helpers'

function buildGuideItemKey(slug) {
  return `item-${String(slug || '')
    .replace(/^guides\//, '')
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()}`.slice(0, 64)
}

function toPortableTextSimple(value) {
  const text = String(value || '').trim()
  if (!text) {
    return []
  }
  const blockKey = `pt-${Math.random().toString(36).slice(2, 10)}`
  const spanKey = `sp-${Math.random().toString(36).slice(2, 10)}`
  return [
    {
      _type: 'block',
      _key: blockKey,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: spanKey, text, marks: [] }],
    },
  ]
}

function getHeroMediaFromSections(sections) {
  const hero = Array.isArray(sections) ? sections.find(isHeroSectionBlock) : null
  return {
    heroImage: hero?.heroImage || null,
    heroAsset: hero?.heroAsset || null,
  }
}

/**
 * Copy guide post hero image → every guides listing page (draft + published) for this site.
 */
export async function syncGuideHeroToGuideGridItems(client, guideDoc) {
  const slugRaw =
    typeof guideDoc?.slug === 'string'
      ? guideDoc.slug
      : guideDoc?.slug?.current != null
        ? String(guideDoc.slug.current)
        : ''
  const guideSlug = slugRaw.trim()
  if (!guideSlug.startsWith('guides/')) {
    return { ok: false, reason: 'not-a-guide-slug' }
  }

  const siteRef = guideDoc?.site?._ref || guideDoc?.site?._id
  if (!siteRef) {
    return { ok: false, reason: 'no-site' }
  }

  const href = `/${guideSlug}`
  const { heroImage, heroAsset } = getHeroMediaFromSections(guideDoc?.sections)

  const guidesPages = await client
    .withConfig({ perspective: 'raw' })
    .fetch(groq`*[_type == "page" && site._ref == $siteId && slug.current == "guides"]{_id,sections}`, {
      siteId: siteRef,
    })

  for (const pageDoc of guidesPages || []) {
    const sections = Array.isArray(pageDoc?.sections) ? pageDoc.sections : []
    const guideGridSectionIndex = sections.findIndex((section) => section?.type === 'guideGrid')
    if (guideGridSectionIndex < 0) {
      continue
    }

    const guideGridSection = sections[guideGridSectionIndex]
    const currentItems = Array.isArray(guideGridSection?.items) ? guideGridSection.items : []
    const existingIndex = currentItems.findIndex((item) => String(item?.href || '').trim() === href)
    const existingItem = existingIndex >= 0 ? currentItems[existingIndex] : null

    const nextItem = {
      _type: 'pageItem',
      _key: existingItem?._key || buildGuideItemKey(guideSlug),
      number: existingItem?.number || String((currentItems.length || 0) + 1).padStart(2, '0'),
      title: guideDoc?.title || existingItem?.title || 'Guide',
      body:
        Array.isArray(existingItem?.body) && existingItem.body.length
          ? existingItem.body
          : toPortableTextSimple(guideDoc?.description || ''),
      href,
      icon: existingItem?.icon || '',
      color: existingItem?.color || '',
      category: existingItem?.category || '',
      ctaLabel: existingItem?.ctaLabel || '',
      ...(existingItem?.imageUrl ? { imageUrl: existingItem.imageUrl } : {}),
    }
    if (heroImage) {
      nextItem.image = heroImage
    }
    if (heroAsset) {
      nextItem.imageAsset = heroAsset
    }

    const nextItems =
      existingIndex >= 0
        ? currentItems.map((item, index) => (index === existingIndex ? nextItem : item))
        : [nextItem, ...currentItems]

    const nextSections = [...sections]
    nextSections[guideGridSectionIndex] = {
      ...guideGridSection,
      items: nextItems,
    }

    await client.patch(pageDoc._id).set({ sections: nextSections }).commit()
  }

  return { ok: true }
}

/**
 * Copy each guides listing card image → matching guide post hero (drafts included).
 */
export async function syncGuideGridCardImagesToHeroes(client, { siteRef, guidesPageDoc }) {
  if (!siteRef || !guidesPageDoc?.sections) {
    return { ok: false, reason: 'invalid-input' }
  }

  const sections = Array.isArray(guidesPageDoc.sections) ? guidesPageDoc.sections : []
  const guideGrid = sections.find((s) => s?.type === 'guideGrid')
  const items = Array.isArray(guideGrid?.items) ? guideGrid.items : []
  const guideItems = items.filter((item) => {
    const h = String(item?.href || '').trim()
    return h.startsWith('/guides/') && h.split('/').filter(Boolean).length === 2
  })

  for (const item of guideItems) {
    const slugPath = String(item.href || '')
      .trim()
      .replace(/^\/+/, '')
    if (!slugPath.startsWith('guides/')) {
      continue
    }

    const cardImage = item.image || null
    const cardAsset = item.imageAsset || null
    if (!cardImage && !cardAsset) {
      continue
    }

    const posts = await client
      .withConfig({ perspective: 'raw' })
      .fetch(groq`*[_type == "post" && site._ref == $siteId && slug.current == $slug]{_id,sections}`, {
        siteId: siteRef,
        slug: slugPath,
      })

    for (const post of posts || []) {
      const postSections = Array.isArray(post.sections) ? [...post.sections] : []
      const heroIndex = postSections.findIndex(isHeroSectionBlock)
      if (heroIndex < 0) {
        continue
      }

      const hero = { ...postSections[heroIndex] }
      if (cardImage) {
        hero.heroImage = cardImage
      }
      if (cardAsset) {
        hero.heroAsset = cardAsset
      }
      postSections[heroIndex] = hero
      await client.patch(post._id).set({ sections: postSections }).commit()
    }
  }

  return { ok: true, count: guideItems.length }
}

/**
 * Refresh every guides listing card image from each guide post's hero.
 */
export async function refreshAllGuideGridImagesFromPosts(client, siteRef) {
  if (!siteRef) {
    return { ok: false }
  }

  const posts = await client.withConfig({ perspective: 'raw' }).fetch(
    groq`*[_type == "post" && site._ref == $siteId && slug.current match "guides/*"]{
        title,
        description,
        "slug": slug.current,
        sections
      }`,
    { siteId: siteRef },
  )

  for (const guideDoc of posts || []) {
    await syncGuideHeroToGuideGridItems(client, {
      ...guideDoc,
      slug: guideDoc.slug,
      site: { _ref: siteRef },
    })
  }

  return { ok: true, count: (posts || []).length }
}
