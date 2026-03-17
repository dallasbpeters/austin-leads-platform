import { groq } from 'next-sanity'

import { sanityAgentWriteClient, sanityWriteClient } from '@/sanity/client'
import { withSectionKeys } from '@/lib/sanity/keys'
import {
  buildDraftSkeleton,
  inferDraftSchemaType,
  normalizeDraftSlugForContentType,
  sanitizeDraftDocumentIdPart,
  trimDraftLines,
} from '@/sanity/agent/draftHelpers'
import { buildSanityAgentPublishingInstruction } from '@/sanity/agent/publishingInstructions'

const SANITY_AGENT_SCHEMA_ID = process.env.SANITY_AGENT_SCHEMA_ID || ''

function toPortableTextSimple(value) {
  const text = String(value || '').trim()
  if (!text) return []
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

function buildGuideItemKey(slug) {
  return `item-${String(slug || '')
    .replace(/^guides\//, '')
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()}`
    .slice(0, 64)
}

async function syncGuideCardIntoGuidesSection({ siteId, guideDoc }) {
  const guideSlug = String(guideDoc?.slug || '').trim()
  if (!guideSlug.startsWith('guides/')) {
    return
  }

  const href = `/${guideSlug}`
  const heroSection = Array.isArray(guideDoc?.sections)
    ? guideDoc.sections.find((section) => section?.type === 'hero')
    : null
  const heroImage = heroSection?.heroImage || null
  const heroAsset = heroSection?.heroAsset || null

  const guidesPages = await sanityWriteClient
    .withConfig({ perspective: 'raw' })
    .fetch(groq`*[_type == "page" && site._ref == $siteId && slug.current == "guides"]{_id,sections}`, { siteId })

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
      number: existingItem?.number || String(currentItems.length + 1).padStart(2, '0'),
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
      ...(heroImage || existingItem?.image ? { image: heroImage || existingItem?.image } : {}),
      ...(heroAsset || existingItem?.imageAsset ? { imageAsset: heroAsset || existingItem?.imageAsset } : {}),
      ...(existingItem?.imageUrl ? { imageUrl: existingItem.imageUrl } : {}),
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

    await sanityWriteClient.patch(pageDoc._id).set({ sections: nextSections }).commit()
  }
}

async function normalizeDraftSections(documentId) {
  const draft = await sanityWriteClient.fetch(groq`*[_id == $documentId][0]{_id,sections}`, { documentId })

  if (!draft?._id || !Array.isArray(draft.sections)) {
    return false
  }

  const toPortableTextSimple = (value) => {
    if (Array.isArray(value)) {
      return value
    }

    const text = String(value || '').trim()
    if (!text) {
      return []
    }

    return [
      {
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            text,
            marks: [],
          },
        ],
      },
    ]
  }

  const normalizeItems = (items, fieldName) => {
    if (!Array.isArray(items)) return items
    return items.map((item) => {
      if (!item || typeof item !== 'object') return item
      if (!(fieldName in item)) return item
      return {
        ...item,
        [fieldName]: toPortableTextSimple(item[fieldName]),
      }
    })
  }

  const normalizedSections = withSectionKeys(
    draft.sections.map((section) => {
      if (!section || typeof section !== 'object') return section

      const nextSection = { ...section }
      if ('body' in nextSection) {
        nextSection.body = toPortableTextSimple(nextSection.body)
      }

      if (nextSection.type === 'highlights' || nextSection.type === 'steps') {
        nextSection.items = normalizeItems(nextSection.items, 'body')
      }

      if (nextSection.type === 'faq') {
        nextSection.items = normalizeItems(nextSection.items, 'answer')
      }

      return nextSection
    }),
  )

  if (JSON.stringify(normalizedSections) === JSON.stringify(draft.sections)) {
    return false
  }

  await sanityWriteClient.patch(draft._id).set({ sections: normalizedSections }).commit()
  return true
}

async function runSanityAgentGenerate({ documentId, schemaType, input }) {
  if (!sanityAgentWriteClient?.agent?.action?.generate || !SANITY_AGENT_SCHEMA_ID) {
    throw new Error('Sanity Agent Generate is not configured.')
  }

  await sanityAgentWriteClient.agent.action.generate({
    schemaId: SANITY_AGENT_SCHEMA_ID,
    documentId,
    instruction: buildSanityAgentPublishingInstruction({
      contentType: input.contentType,
      title: input.title,
      siteName: input.siteName,
    }),
    instructionParams: {
      title: {
        type: 'constant',
        value: input.title,
      },
      siteName: {
        type: 'constant',
        value: input.siteName || '',
      },
      brief: {
        type: 'constant',
        value: input.brief,
      },
      sources: {
        type: 'constant',
        value: trimDraftLines(input.sources).join('\n'),
      },
      neighboringTitles: {
        type: 'groq',
        query: '*[_type == $schemaType && site._ref == $siteId][0...12].title',
        params: {
          schemaType,
          siteId: input.siteId,
        },
      },
    },
  })

  return {
    mode: 'sanity-agent',
    provider: 'sanity-agent',
  }
}

export async function createAiDraftDocument(input) {
  if (!sanityWriteClient) {
    throw new Error('Sanity write credentials are not configured.')
  }

  const normalizedSlug =
    normalizeDraftSlugForContentType(input.contentType, input.slug || input.title) ||
    `draft-${Date.now().toString(36)}`
  const schemaType = inferDraftSchemaType(input.contentType, normalizedSlug)
  const normalizedContentType = schemaType

  const existing = await sanityWriteClient.fetch(
    groq`*[_type == $schemaType && site._ref == $siteId && slug.current == $slug][0]{_id}`,
    {
      schemaType,
      siteId: input.siteId,
      slug: normalizedSlug,
    },
  )

  const fallbackDocumentId = `${schemaType}-${sanitizeDraftDocumentIdPart(normalizedSlug)}`.slice(0, 120)
  const baseDocumentId = String(existing?._id || fallbackDocumentId)
    .replace(/^drafts\./, '')
    .slice(0, 120)
  const draftId = `drafts.${baseDocumentId}`

  const { skeleton } = buildDraftSkeleton({
    ...input,
    contentType: normalizedContentType,
    slug: normalizedSlug,
  })
  skeleton._id = draftId
  skeleton.pageType = normalizedContentType
  skeleton.slug = {
    _type: 'slug',
    current: normalizedSlug,
  }

  await sanityWriteClient.createOrReplace(skeleton)
  await normalizeDraftSections(draftId)

  let generateResult = {
    mode: 'fallback',
    provider: 'placeholder',
    warning: SANITY_AGENT_SCHEMA_ID
      ? null
      : 'SANITY_AGENT_SCHEMA_ID is missing, so the tool created a structured starter draft instead of running Sanity Agent.',
  }

  if (SANITY_AGENT_SCHEMA_ID) {
    try {
      generateResult = await runSanityAgentGenerate({
        documentId: draftId,
        schemaType,
        input,
      })
    } catch (error) {
      generateResult = {
        mode: 'fallback',
        provider: 'placeholder',
        warning: error instanceof Error ? error.message : 'Sanity Agent draft generation failed.',
      }
    }
  }

  await normalizeDraftSections(draftId)

  if (normalizedContentType === 'post' && normalizedSlug.startsWith('guides/')) {
    const guideDraft = await sanityWriteClient.fetch(
      groq`*[_id == $documentId][0]{title,description,"slug":slug.current,sections[]{type,heroImage,heroAsset}}`,
      { documentId: draftId },
    )

    await syncGuideCardIntoGuidesSection({
      siteId: input.siteId,
      guideDoc: guideDraft,
    })
  }

  return {
    ok: true,
    documentId: baseDocumentId,
    draftId,
    schemaType,
    slug: normalizedSlug,
    mode: generateResult.mode,
    provider: generateResult.provider,
    warning: generateResult.warning || null,
  }
}
