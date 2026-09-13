import { createGroq } from '@ai-sdk/groq'
import { sanityInsightsIntegration } from '@sanity/context/ai-sdk'
import { generateText } from 'ai'

import { sanityContextClient } from '@/sanity/client'

/*
 * Draft generation for publish jobs.
 *
 * This replaces createDraftOutput(), which returned a fixed placeholder string
 * ("Placeholder draft for <title>...") -- the `provider` and `model` fields
 * stored on every job were never read by anything.
 *
 * Runs on Groq through the Vercel AI SDK rather than groq-sdk directly. The
 * SDK is what makes Sanity Insights possible: sanityInsightsIntegration is an
 * AI SDK telemetry integration, so it can only observe calls made through
 * generateText/streamText. A raw provider SDK call is invisible to it, which
 * is why the Insights dashboard reported "No conversations yet".
 */

const resolveApiKey = () => (process.env.GROQ_API_KEY || '').trim()

export const PUBLISH_PROVIDER = 'groq'
export const PUBLISH_MODEL = 'openai/gpt-oss-20b'

/** Groups these conversations in the Sanity Insights dashboard. */
export const PUBLISH_AGENT_ID = 'publish-content-drafts'

export function hasPublishGenerator() {
  return Boolean(resolveApiKey())
}

/*
 * House rules the draft has to follow. The expired-credit line matters most:
 * it is the single fact a general-purpose model is most likely to get wrong
 * about Texas solar, and it is called out in the repo's own CLAUDE.md.
 */
const SYSTEM_RULES = `You write for Texas Solar and Roofing Pros, a roofing and solar contractor serving Austin and Central Texas.

Voice:
- Direct and calm. No urgency, no countdown language, no "act now".
- Specific over adjectives: "Class 4 impact-rated shingles", not "premium materials".
- Lead with the homeowner's situation, not the product.
- Honest about limits. If solar does not pencil out, say so.
- Headlines describe what is below them; they are chapter titles, not billboards.

Facts you must respect:
- The federal residential solar tax credit expired on 31 December 2025. Never present it as available.
- Austin Energy offers a $2,500 rebate plus Value of Solar bill credits at 9.91 cents/kWh.
- Texas has no statewide net metering mandate; export credit is set by each utility, and Austin Energy, Oncor, CenterPoint and the co-ops differ.
- Texas has a property-tax exemption for residential solar.
- Cost figures are Central Texas ranges, never quotes.

Output plain prose with short paragraphs and clear section headings. No markdown code fences.`

const buildPrompt = (job) => {
  const sources = (job.sources || []).filter(Boolean)

  return [
    `Write a ${job.contentType === 'post' ? 'blog post' : 'landing page'} titled "${job.title}".`,
    '',
    'Brief:',
    job.prompt || '(no additional brief)',
    sources.length ? `\nReference material:\n${sources.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

/*
 * Insights records each conversation against the organization, so it needs the
 * org-scoped Context client. Without SANITY_CONTEXT_ORG_TOKEN that client is
 * null and telemetry is simply left off -- drafting still works, it is just not
 * recorded.
 */
function buildTelemetry(job) {
  if (!sanityContextClient) {
    return null
  }

  return {
    isEnabled: true,
    integrations: [
      sanityInsightsIntegration({
        client: sanityContextClient,
        metadata: { mcpEndpoints: PUBLISH_AGENT_ID },
        // One publish job is one conversation: regenerating the same job
        // continues its thread rather than starting a new one.
        threadId: job.id,
      }),
    ],
  }
}

/**
 * Generates draft copy for a publish job.
 *
 * @param {object} job Publish job record (title, prompt, sources, contentType)
 * @returns {Promise<object>} `{ok: true, output, provider, model}` on success,
 *   otherwise `{ok: false, reason}` when unconfigured or `{ok: false, error}`
 *   when the model call fails. Never throws, so a failed draft leaves the job
 *   intact rather than losing it.
 */
export async function generatePublishDraft(job) {
  const apiKey = resolveApiKey()
  if (!apiKey) {
    return {
      ok: false,
      reason: 'Draft generation is not configured. Set GROQ_API_KEY.',
    }
  }

  const telemetry = buildTelemetry(job)

  try {
    const groq = createGroq({ apiKey })
    const { text } = await generateText({
      model: groq(PUBLISH_MODEL),
      system: SYSTEM_RULES,
      prompt: buildPrompt(job),
      temperature: 0.6,
      maxOutputTokens: 4096,
      /*
       * gpt-oss is a reasoning model; the default effort spends tokens on
       * deliberation this task does not need, and the reasoning is not part of
       * the draft we keep.
       */
      providerOptions: { groq: { reasoningEffort: 'low' } },
      // Spread so the option is absent (not undefined) when telemetry is off.
      ...(telemetry ? { experimental_telemetry: telemetry } : {}),
    })

    const output = (text || '').trim()
    if (!output) {
      return { ok: false, error: 'The model returned an empty draft.' }
    }

    return { ok: true, output, provider: PUBLISH_PROVIDER, model: PUBLISH_MODEL }
  } catch (error) {
    console.error('[publish] draft generation failed', error)
    return { ok: false, error: error.message || 'Draft generation failed.' }
  }
}
