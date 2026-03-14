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

export function sanitizeDraftDocumentIdPart(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
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

function splitDraftSentences(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function humanizeDraftTitle(value) {
  return String(value || '')
    .replace(/[-/]+/g, ' ')
    .replace(/\s+/g, ' ')
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
            ? `What the scope should cover`
            : `Key point ${index + 1}`,
      body: item,
    }))
  }

  return [
    {
      title: contentType === 'post' ? 'What this guide helps clarify' : 'What the homeowner is trying to solve',
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
      body:
        third ||
        `Give the reader a clearer next step so the page does not stop at explanation alone.`,
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
            title: 'Show what a good scope should include',
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

  const heroBodyByType =
    input.contentType === 'post'
      ? firstBriefSentence ||
        `This guide should help Texas homeowners understand how ${cleanTitle || 'this topic'} works in real life before they make a decision.`
      : input.contentType === 'servicePage'
        ? firstBriefSentence ||
          `This page should explain when ${cleanTitle || 'this service'} makes sense, what a good scope includes, and what the homeowner should do next.`
        : input.contentType === 'locationPage'
          ? firstBriefSentence ||
            `This page should explain what homeowners in this market need to know about ${cleanTitle || 'the issue'} before they commit to a next step.`
          : firstBriefSentence ||
            `This draft should help the reader understand ${cleanTitle || 'the topic'} clearly and know what to do next.`

  const storyTitleByType =
    input.contentType === 'post'
      ? `What Texas homeowners should understand about ${cleanTitle || 'this topic'}`
      : input.contentType === 'servicePage'
        ? `When ${cleanTitle || 'this service'} is the right next step`
        : input.contentType === 'locationPage'
          ? `What matters locally before a homeowner decides`
          : 'What this page should help the reader understand'

  const storyBodyByType =
    secondBriefSentence ||
    thirdBriefSentence ||
    sourceLines[0] ||
    (input.contentType === 'post'
      ? `Use this section to explain the process, the decision points, and the common misunderstandings around ${cleanTitle || 'the topic'}.`
      : `Use this section to explain the homeowner problem, the tradeoffs involved, and how to evaluate the right next step.`)

  const faqIntro =
    input.contentType === 'post'
      ? `This guide should answer the practical questions homeowners ask before they move forward with ${cleanTitle || 'the topic'}.`
      : `This page should answer the practical questions a homeowner asks before they commit to ${cleanTitle || 'the next step'}.`

  return {
    heroEyebrow: contentLabel,
    heroTitle: input.title,
    heroBody: heroBodyByType,
    storyTitle: storyTitleByType,
    storyBody: storyBodyByType,
    highlights,
    steps,
    faq: [
      {
        question: 'What should this page help the reader decide?',
        answer:
          firstBriefSentence ||
          faqIntro,
      },
      {
        question: input.contentType === 'post' ? 'What details should be clarified in the body?' : 'What details should be clarified before publishing?',
        answer:
          sourceLines[0] ||
          secondBriefSentence ||
          `Add specific conditions, examples, and decision criteria so the draft does not stay generic.`,
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

export function buildFallbackDraftSections(draft) {
  const heroImage = buildDraftHeroImage(draft)

  return withSectionKeys([
    {
      type: 'hero',
      eyebrow: draft.heroEyebrow,
      title: draft.heroTitle,
      body: draft.heroBody,
      ...(heroImage ? { heroImage } : {}),
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
      type: 'steps',
      title: 'How to approach it',
      items: draft.steps,
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
      pageType: input.contentType,
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
      sections: buildFallbackDraftSections(fallbackDraft),
    },
  }
}
