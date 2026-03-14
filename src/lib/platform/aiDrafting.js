import { groq } from 'next-sanity'

import { sanityWriteClient } from '@/sanity/client'
import {
  buildDraftSkeleton,
  slugifyDraftValue,
  toDraftSchemaType,
  trimDraftLines,
} from '@/sanity/agent/draftHelpers'
import { buildSanityAgentPublishingInstruction } from '@/sanity/agent/publishingInstructions'

const SANITY_AGENT_SCHEMA_ID = process.env.SANITY_AGENT_SCHEMA_ID || ''

async function runSanityAgentGenerate({ documentId, schemaType, input }) {
  if (!sanityWriteClient?.agent?.action?.generate || !SANITY_AGENT_SCHEMA_ID) {
    throw new Error('Sanity Agent Generate is not configured.')
  }

  await sanityWriteClient.agent.action.generate({
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
        query:
          '*[_type == $schemaType && site._ref == $siteId][0...12].title',
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

  const schemaType = toDraftSchemaType(input.contentType)
  const normalizedSlug =
    slugifyDraftValue(input.slug || input.title) || `draft-${Date.now().toString(36)}`

  const existing = await sanityWriteClient.fetch(
    groq`*[_type == $schemaType && site._ref == $siteId && slug.current == $slug][0]{_id}`,
    {
      schemaType,
      siteId: input.siteId,
      slug: normalizedSlug,
    },
  )

  const baseDocumentId = String(existing?._id || `${schemaType}-${normalizedSlug}`)
    .replace(/^drafts\./, '')
    .slice(0, 120)
  const draftId = `drafts.${baseDocumentId}`

  const { skeleton } = buildDraftSkeleton(input)
  skeleton._id = draftId

  await sanityWriteClient.createOrReplace(skeleton)

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
