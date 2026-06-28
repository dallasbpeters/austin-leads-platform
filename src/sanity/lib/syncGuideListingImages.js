import groq from 'groq'

import { isHeroSectionBlock } from '../../lib/platform/section-helpers'

function buildGuideItemKey(slug) {
  return `item-${String(slug || '')
    .replace(/^guides\//, '')
    .replaceAll(/[^a-z0-9-]+/gi, '-')
    .replaceAll(/-{2,}/g, '-')
    .replaceAll(/^-|-$/g, '')
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

function pickImageUrl(existingItem) {
  return existingItem.imageUrl ? { imageUrl: existingItem.imageUrl } : {}
}

function buildGuideGridItem({ guideDoc, href, existingItem, currentItems }) {
  const ex = existingItem || {}
  const len = currentItems.length
  const body =
    Array.isArray(ex.body) && ex.body.length ? ex.body : toPortableTextSimple(guideDoc?.description || '')
  const { heroImage, heroAsset } = getHeroMediaFromSections(guideDoc?.sections)
  return {
    _type: 'pageItem',
    _key: ex._key || buildGuideItemKey(guideDoc.slug),
    number: ex.number || String((len || 0) + 1).padStart(2, '0'),
    title: guideDoc?.title || ex.title || 'Guide',
    body,
    href,
    icon: ex.icon || '',
    color: ex.color || '',
    category: ex.category || '',
    ctaLabel: ex.ctaLabel || '',
    ...pickImageUrl(ex),
    ...(heroImage ? { image: heroImage } : {}),
    ...(heroAsset ? { imageAsset: heroAsset } : {}),
  }
}

/**
 * Copy guide post hero image → every guides listing page (draft + published) for this site.
 */
function resolveGuideSlug(guideDoc) {
  if (typeof guideDoc?.slug === 'string') {
    return guideDoc.slug.trim()
  }
  if (guideDoc?.slug?.current != null) {
    return String(guideDoc.slug.current).trim()
  }
  return ''
}

function patchGuidePage(client, pageDoc, href, guideDoc, guideSlug) {
  const sections = Array.isArray(pageDoc?.sections) ? pageDoc.sections : []
  const guideGridSectionIndex = sections.findIndex((section) => section?.type === 'guideGrid')
  if (guideGridSectionIndex === -1) {
    return
  }

  const guideGridSection = sections[guideGridSectionIndex]
  const currentItems = Array.isArray(guideGridSection?.items) ? guideGridSection.items : []
  const existingIndex = currentItems.findIndex((item) => String(item?.href || '').trim() === href)
  const existingItem = existingIndex !== -1 ? currentItems[existingIndex] : null

  const nextItem = buildGuideGridItem({
    guideDoc: { ...guideDoc, slug: guideSlug },
    href,
    existingItem,
    currentItems,
  })

  const nextItems =
    existingIndex !== -1
      ? currentItems.map((item, index) => (index === existingIndex ? nextItem : item))
      : [nextItem, ...currentItems]

  const nextSections = [...sections]
  nextSections[guideGridSectionIndex] = { ...guideGridSection, items: nextItems }

  return client.patch(pageDoc._id).set({ sections: nextSections }).commit()
}

export async function syncGuideHeroToGuideGridItems(client, guideDoc) {
  const guideSlug = resolveGuideSlug(guideDoc)
  if (!guideSlug.startsWith('guides/')) {
    return { ok: false, reason: 'not-a-guide-slug' }
  }

  const siteRef = guideDoc?.site?._ref || guideDoc?.site?._id
  if (!siteRef) {
    return { ok: false, reason: 'no-site' }
  }

  const href = `/${guideSlug}`

  const guidesPages = await client
    .withConfig({ perspective: 'raw' })
    .fetch(groq`*[_type == "page" && site._ref == $siteId && slug.current == "guides"]{_id,sections}`, {
      siteId: siteRef,
    })

  for (const pageDoc of guidesPages || []) {
    await patchGuidePage(client, pageDoc, href, guideDoc, guideSlug)
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
      if (heroIndex === -1) {
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
