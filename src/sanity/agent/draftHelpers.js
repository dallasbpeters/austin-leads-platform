import { withSectionKeys } from '../../lib/sanity/keys'

export function slugifyDraftValue(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9/]+/g, '-')
    .replaceAll(/-{2,}/g, '-')
    .replaceAll(/\/{2,}/g, '/')
    .replaceAll(/^-+|-+$/g, '')
    .replaceAll(/^\/+|\/+$/g, '')
}

export function sanitizeDraftDocumentIdPart(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]+/g, '-')
    .replaceAll(/-{2,}/g, '-')
    .replaceAll(/^-+|-+$/g, '')
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

export function buildDraftHeroImage(input) {
  const imageUrl = String(input.heroImageUrl || '').trim()
  const alt = String(input.heroImageAlt || '').trim()

  if (!imageUrl) {
    return null
  }

  return {
    _type: 'heroImage',
    source: 'external',
    alt: alt || input.title || 'Draft hero image',
    description: alt || '',
    urls: {
      _type: 'heroImageUrls',
      raw: imageUrl,
      full: imageUrl,
      regular: imageUrl,
      small: imageUrl,
      thumb: imageUrl,
    },
  }
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
      children: [
        {
          _type: 'span',
          _key: spanKey,
          text,
          marks: [],
        },
      ],
    },
  ]
}

function splitDraftSentences(value) {
  return String(value || '')
    .replaceAll(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function humanizeDraftTitle(value) {
  return String(value || '')
    .replaceAll(/[-/]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
}

function buildDerivedFallbackPoints({ title, brief, sources, contentType }) {
  const cleanTitle = humanizeDraftTitle(title)
  const briefSentences = splitDraftSentences(brief)
  const first = briefSentences[0]
  const second = briefSentences[1]
  const third = briefSentences[2]

  if (sources.length) {
    return sources.slice(0, 3).map((item, index) => ({
      title:
        contentType === 'post'
          ? `What to understand first`
          : contentType === 'servicePage'
            ? `What the plan should cover`
            : `Key point ${index + 1}`,
      body: item,
    }))
  }

  return [
    {
      title:
        contentType === 'post' ? 'What this guide helps clarify' : 'What the homeowner is trying to solve',
      body:
        first ||
        `Use this draft to explain the real homeowner decision around ${cleanTitle || 'the topic'} in plain language.`,
    },
    {
      title: contentType === 'post' ? 'What affects the decision' : 'What can change the recommendation',
      body:
        second ||
        `Show the conditions, tradeoffs, and practical factors that change what makes sense for ${cleanTitle || 'this project'}.`,
    },
    {
      title: contentType === 'post' ? 'What should happen next' : 'What the next step should be',
      body: third || `Give the reader a clearer next step so the page does not stop at explanation alone.`,
    },
  ]
}

function buildDerivedFallbackSteps({ title, brief, sources, contentType }) {
  const cleanTitle = humanizeDraftTitle(title)
  const briefSentences = splitDraftSentences(brief)
  const sourceHints = sources.slice(0, 3)

  const baseSteps =
    contentType === 'post'
      ? [
          {
            title: 'Start with the real homeowner question',
            body:
              briefSentences[0] ||
              `Open by explaining what a homeowner is usually trying to figure out about ${cleanTitle || 'this topic'}.`,
          },
          {
            title: 'Break down the factors that change the answer',
            body:
              sourceHints[0] ||
              briefSentences[1] ||
              'Cover the conditions, tradeoffs, and common misconceptions that can change what makes sense.',
          },
          {
            title: 'Close with the practical next step',
            body:
              sourceHints[1] ||
              briefSentences[2] ||
              'End with what the homeowner should check, compare, or ask before moving forward.',
          },
        ]
      : [
          {
            title: 'Define the homeowner problem clearly',
            body:
              briefSentences[0] ||
              `Start with the real problem that leads someone to look into ${cleanTitle || 'this service'}.`,
          },
          {
            title: 'Show what a good plan should include',
            body:
              sourceHints[0] ||
              briefSentences[1] ||
              'Explain the work, conditions, or evaluation points that should be part of a credible recommendation.',
          },
          {
            title: 'Set the right next step',
            body:
              sourceHints[1] ||
              briefSentences[2] ||
              'Tell the reader what should happen next so the page leads to a decision, not just more confusion.',
          },
        ]

  return baseSteps
}

export function toDraftSchemaType(contentType) {
  if (contentType === 'servicePage' || contentType === 'locationPage' || contentType === 'post') {
    return contentType
  }

  return 'page'
}

export function normalizeDraftSlugForContentType(contentType, value) {
  const normalized = slugifyDraftValue(value)

  if (!normalized) {
    return ''
  }

  if (contentType === 'post') {
    return normalized.startsWith('guides/') ? normalized : `guides/${normalized}`
  }

  if (contentType === 'servicePage') {
    return normalized.startsWith('services/') ? normalized : `services/${normalized}`
  }

  return normalized
}

export function inferDraftSchemaType(contentType, normalizedSlug) {
  if (normalizedSlug?.startsWith('guides/')) {
    return 'post'
  }

  if (normalizedSlug?.startsWith('services/') && contentType === 'page') {
    return 'servicePage'
  }

  return toDraftSchemaType(contentType)
}

const DRAFT_CONTENT_LABELS = {
  post: 'Guide draft',
  servicePage: 'Service page draft',
  locationPage: 'Location page draft',
  page: 'Page draft',
}

const DRAFT_HERO_BODY_TEMPLATES = {
  post: (t) =>
    `This guide should help Texas homeowners understand how ${t || 'this topic'} works in real life before they make a decision.`,
  servicePage: (t) =>
    `This page should explain when ${t || 'this service'} makes sense, what a good plan includes, and what the homeowner should do next.`,
  locationPage: (t) =>
    `This page should explain what homeowners in this market need to know about ${t || 'the issue'} before they commit to a next step.`,
}

const DRAFT_HERO_BODY_DEFAULT = (t) =>
  `This draft should help the reader understand ${t || 'the topic'} clearly and know what to do next.`

const DRAFT_STORY_TITLE_TEMPLATES = {
  post: (t) => `What Texas homeowners should understand about ${t || 'this topic'}`,
  servicePage: (t) => `When ${t || 'this service'} is the right next step`,
  locationPage: () => 'What matters locally before a homeowner decides',
  page: () => 'What this page should help the reader understand',
}

const DRAFT_STORY_BODY_POST = () =>
  'Use this section to explain the process, the decision points, and the common misunderstandings around the topic.'

const DRAFT_STORY_BODY_DEFAULT = () =>
  'Use this section to explain the homeowner problem, the tradeoffs involved, and how to evaluate the right next step.'

const DRAFT_FAQ_INTRO_TEMPLATES = {
  post: (t) =>
    `This guide should answer the practical questions homeowners ask before they move forward with ${t || 'the topic'}.`,
  page: (t) =>
    `This page should answer the practical questions a homeowner asks before they commit to ${t || 'the next step'}.`,
}

function buildHeroBody(contentType, firstSentence, cleanTitle) {
  const template = DRAFT_HERO_BODY_TEMPLATES[contentType]
  return firstSentence || (template ? template(cleanTitle) : DRAFT_HERO_BODY_DEFAULT(cleanTitle))
}

function buildStoryTitle(contentType, cleanTitle) {
  const template = DRAFT_STORY_TITLE_TEMPLATES[contentType]
  return template ? template(cleanTitle) : DRAFT_STORY_TITLE_TEMPLATES.page()
}

function buildStoryBody(contentType, secondSentence, thirdSentence, firstSource) {
  const resolved = secondSentence || thirdSentence || firstSource
  if (resolved) {
    return resolved
  }
  return contentType === 'post' ? DRAFT_STORY_BODY_POST() : DRAFT_STORY_BODY_DEFAULT()
}

function buildFaqIntro(contentType, cleanTitle) {
  const template = DRAFT_FAQ_INTRO_TEMPLATES[contentType]
  return template ? template(cleanTitle) : DRAFT_FAQ_INTRO_TEMPLATES.page(cleanTitle)
}

export function buildFallbackDraftContent(input) {
  const contentLabel = DRAFT_CONTENT_LABELS[input.contentType] || DRAFT_CONTENT_LABELS.page
  const sourceLines = trimDraftLines(input.sources)
  const briefSentences = splitDraftSentences(input.brief)
  const cleanTitle = humanizeDraftTitle(input.title)
  const [firstBriefSentence, secondBriefSentence, thirdBriefSentence] = briefSentences
  const highlights = buildDerivedFallbackPoints({
    title: input.title,
    brief: input.brief,
    sources: sourceLines,
    contentType: input.contentType,
  })
  const steps = buildDerivedFallbackSteps({
    title: input.title,
    brief: input.brief,
    sources: sourceLines,
    contentType: input.contentType,
  })
  const heroBody = buildHeroBody(input.contentType, firstBriefSentence, cleanTitle)
  const storyTitle = buildStoryTitle(input.contentType, cleanTitle)
  const storyBody = buildStoryBody(input.contentType, secondBriefSentence, thirdBriefSentence, sourceLines[0])

  return {
    heroEyebrow: contentLabel,
    heroTitle: input.title,
    heroBody,
    storyTitle,
    storyBody,
    highlights,
    steps,
    faq: [
      {
        question: 'What should this page help the reader decide?',
        answer: firstBriefSentence || buildFaqIntro(input.contentType, cleanTitle),
      },
      {
        question:
          input.contentType === 'post'
            ? 'What details should be clarified in the body?'
            : 'What details should be clarified before publishing?',
        answer:
          sourceLines[0] ||
          secondBriefSentence ||
          'Add specific conditions, examples, and decision criteria so the draft does not stay generic.',
      },
      {
        question: 'What should happen before this is published?',
        answer:
          thirdBriefSentence ||
          'Review the copy, tighten the structure, and verify all claims against the cited sources before publishing.',
      },
    ],
  }
}

export function buildFallbackDraftSections(draft, heroImage = null) {
  return withSectionKeys([
    {
      type: 'hero',
      eyebrow: draft.heroEyebrow,
      title: draft.heroTitle,
      body: toPortableTextSimple(draft.heroBody),
      ...(heroImage ? { heroImage } : {}),
    },
    {
      type: 'story',
      eyebrow: 'Overview',
      title: draft.storyTitle,
      body: toPortableTextSimple(draft.storyBody),
    },
    {
      type: 'highlights',
      title: 'Key points',
      items: draft.highlights.map((item) => ({
        ...item,
        body: toPortableTextSimple(item.body),
      })),
    },
    {
      type: 'steps',
      title: 'How to approach it',
      items: draft.steps.map((item) => ({
        ...item,
        body: toPortableTextSimple(item.body),
      })),
    },
    {
      type: 'faq',
      title: 'Questions',
      items: draft.faq.map((item) => ({
        ...item,
        answer: toPortableTextSimple(item.answer),
      })),
    },
  ])
}

export function buildDraftSkeleton(input) {
  const normalizedSlug =
    normalizeDraftSlugForContentType(input.contentType, input.slug || input.title) ||
    `draft-${Date.now().toString(36)}`
  const schemaType = inferDraftSchemaType(input.contentType, normalizedSlug)
  const normalizedDocumentIdPart =
    sanitizeDraftDocumentIdPart(normalizedSlug) || `draft-${Date.now().toString(36)}`
  const baseDocumentId = `${schemaType}-${normalizedDocumentIdPart}`.slice(0, 120)
  const draftId = `drafts.${baseDocumentId}`
  const fallbackDraft = buildFallbackDraftContent(input)
  const heroImage = buildDraftHeroImage(input)

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
      // Keep pageType aligned with schema type so guides remain discoverable.
      pageType: schemaType,
      templateLevel: 'hero',
      ...(heroImage ? { heroImage } : {}),
      slug: {
        _type: 'slug',
        current: normalizedSlug,
      },
      site: {
        _type: 'reference',
        _ref: input.siteId,
      },
      sections: buildFallbackDraftSections(fallbackDraft, heroImage),
    },
  }
}
