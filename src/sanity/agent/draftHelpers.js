import { withSectionKeys } from '../../lib/sanity/keys'

export function slugifyDraftValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/^-+|-+$/g, '')
    .replace(/^\/+|\/+$/g, '')
}

export function trimDraftLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }

  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function toDraftSchemaType(contentType) {
  if (contentType === 'servicePage' || contentType === 'locationPage' || contentType === 'post') {
    return contentType
  }

  return 'page'
}

export function buildFallbackDraftContent(input) {
  const contentLabel =
    input.contentType === 'post'
      ? 'Guide draft'
      : input.contentType === 'servicePage'
        ? 'Service page draft'
        : input.contentType === 'locationPage'
          ? 'Location page draft'
          : 'Page draft'

  const sourceLines = trimDraftLines(input.sources)

  return {
    heroEyebrow: contentLabel,
    heroTitle: input.title,
    heroBody:
      input.brief ||
      'This draft was created from the Sanity drafting workflow and needs editorial refinement before publishing.',
    storyTitle: 'What this draft should help the reader understand',
    storyBody: input.brief || 'Use this section to turn the brief into a clearer story before publishing.',
    highlights: (
      sourceLines.length
        ? sourceLines
        : ['Clarify the homeowner problem', 'Explain the decision path', 'Define the next step']
    )
      .slice(0, 3)
      .map((item, index) => ({
        title: `Point ${index + 1}`,
        body: item,
      })),
    faq: [
      {
        question: 'What should this page help the reader decide?',
        answer: input.brief || 'Use the brief and sources to answer the real decision the homeowner is facing.',
      },
      {
        question: 'What evidence or examples should be added?',
        answer: sourceLines[0] || 'Add specific details, examples, and proof so the page does not stay generic.',
      },
      {
        question: 'What should happen before this is published?',
        answer: 'Review the copy, tighten the structure, and verify all claims against the cited sources.',
      },
    ],
  }
}

export function buildFallbackDraftSections(draft) {
  return withSectionKeys([
    {
      type: 'hero',
      eyebrow: draft.heroEyebrow,
      title: draft.heroTitle,
      body: draft.heroBody,
    },
    {
      type: 'story',
      eyebrow: 'Overview',
      title: draft.storyTitle,
      body: draft.storyBody,
    },
    {
      type: 'highlights',
      title: 'Key points',
      items: draft.highlights,
    },
    {
      type: 'faq',
      title: 'Questions',
      items: draft.faq,
    },
  ])
}

export function buildDraftSkeleton(input) {
  const schemaType = toDraftSchemaType(input.contentType)
  const normalizedSlug =
    slugifyDraftValue(input.slug || input.title) || `draft-${Date.now().toString(36)}`
  const baseDocumentId = `${schemaType}-${normalizedSlug}`.slice(0, 120)
  const draftId = `drafts.${baseDocumentId}`
  const fallbackDraft = buildFallbackDraftContent(input)

  return {
    baseDocumentId,
    draftId,
    normalizedSlug,
    schemaType,
    skeleton: {
      _id: draftId,
      _type: schemaType,
      title: input.title,
      description: input.brief,
      pageType: input.contentType,
      templateLevel: 'hero',
      slug: {
        _type: 'slug',
        current: normalizedSlug,
      },
      site: {
        _type: 'reference',
        _ref: input.siteId,
      },
      sections: buildFallbackDraftSections(fallbackDraft),
    },
  }
}
