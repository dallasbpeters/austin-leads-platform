// oxlint-disable unicorn/no-useless-undefined
import { sanityInsightsIntegration } from '@sanity/context/ai-sdk'

import { anthropic } from '@ai-sdk/anthropic'
import { createGroq } from '@ai-sdk/groq'
import { createMCPClient } from '@ai-sdk/mcp'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'

import { safeAuth } from '@/lib/auth/session'
import { sanityContextClient } from '@/sanity/client'
import { contextMcpApiVersion, contextMcpName, contextOrganizationId, dataset, projectId } from '@/sanity/env'

export const runtime = 'nodejs'

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-5'
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'
/* Groups this agent's conversations in the Context app. In v2 this rides on
 * the well-known `mcpEndpoints` metadata key instead of the old `agentId`. */
const INSIGHTS_ENDPOINT_NAME = 'austin-leads-studio-agent'

const MAX_STEPS = 20

const BASE_SYSTEM_PROMPT = `You are a **Sanity CMS assistant** for the Austin Leads Platform (Texas Solar and Roofing Pros). You help **editors and operators** work with **documents and structure** in the dataset—not end-site visitors.

## Domain facts (when interpreting or summarizing public content)
- The federal residential solar tax credit is **not** available; it expired December 31, 2025. Do not recommend it in savings or eligibility copy.
- Austin Energy: **$2,500** one-time rebate and **Value of Solar** bill credits at **9.91¢/kWh** (confirm against current CMS fields when relevant).

## Tools (Agent Context)
- **initial_context** — schema overview, types, counts. Use when exploring the model or starting a task.
- **groq_query** — run **Sanity GROQ** (the query language). This is **not** the Groq Cloud LLM. Always include **_id** in projections when the user might open or patch documents.
- **schema_explorer** — field-level detail for a document type.

## Behaviors
- Prefer accurate, structured answers: cite document types, key fields, and query patterns.
- When suggesting edits, describe what to change in Studio; you only have **read** access via this stack unless the user’s workflow says otherwise.
- Stay concise; use markdown for lists and code blocks for GROQ examples.
`

const resolveLanguageModel = () => {
  const groqKey = process.env.GROQ_API_KEY?.trim()
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()
  const prefer = process.env.CHAT_LLM_PROVIDER?.trim().toLowerCase()

  if (prefer === 'anthropic' && anthropicKey) {
    const id = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL
    return anthropic(id)
  }
  if (prefer === 'groq' && groqKey) {
    const id = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL
    return createGroq({ apiKey: groqKey })(id)
  }
  if (groqKey) {
    const id = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL
    return createGroq({ apiKey: groqKey })(id)
  }
  if (anthropicKey) {
    const id = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL
    return anthropic(id)
  }
  return null
}

/**
 * @param {{ extra?: string; documentFocus?: Record<string, string>; legacyContext?: Record<string, string> }} props
 */
const buildSystemPrompt = (props) => {
  const { extra = '', documentFocus = {}, legacyContext = {} } = props
  const ctx = { ...legacyContext, ...documentFocus }
  const id = ctx.documentId || ctx._id || ''
  const type = ctx._type || ctx.documentType || ''
  const title = ctx.title || ''
  const studioPath = ctx.studioPath || ctx.pathname || ''
  const note = ctx.note || ctx.description || ''

  return `${BASE_SYSTEM_PROMPT}
${extra ? `\n## Additional instructions\n${extra}\n` : ''}
## Optional document focus (from the client)
- Document ID: ${id || '(none)'}
- Type: ${type || '(none)'}
- Title: ${title || '(none)'}
- Studio path / URL fragment: ${studioPath || '(none)'}
- Note: ${note || '(none)'}
`
}

/**
 * Resolves which Context MCP endpoint to talk to, and the token for it.
 *
 * Sanity Context v2 moved endpoints to the organization: they are created in
 * the Context app (Dashboard -> Apps -> Sanity Labs) and addressed as
 * `/<apiVersion>/context/organizations/<orgId>/mcp/<name>`. Those require an
 * ORGANIZATION token with Context permission.
 *
 * The older dataset-addressed `agent-context` endpoint still answers to a
 * project read token, so it stays as a fallback: if the org token is missing or
 * wrong, chat keeps working against the dataset instead of going dark.
 *
 * @returns {{url: string, token: string, scope: 'organization' | 'dataset'} | null}
 */
const resolveContextEndpoint = () => {
  const orgToken = process.env.SANITY_CONTEXT_ORG_TOKEN?.trim()
  if (orgToken) {
    const url =
      process.env.SANITY_CONTEXT_MCP_URL?.trim() ||
      (contextOrganizationId && contextMcpName
        ? `https://api.sanity.io/${contextMcpApiVersion}/context/organizations/${contextOrganizationId}/mcp/${contextMcpName}`
        : '')
    if (url) {
      return { url, token: orgToken, scope: 'organization' }
    }
  }

  const projectToken =
    process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_VIEWER_TOKEN?.trim()
  if (projectToken && projectId && dataset) {
    return {
      url: `https://api.sanity.io/v2026-03-03/agent-context/${projectId}/${dataset}`,
      token: projectToken,
      scope: 'dataset',
    }
  }

  return null
}

const validateChatEnvironment = async (request) => {
  const session = await safeAuth()
  if (!session?.user) {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const endpoint = resolveContextEndpoint()

  if (!endpoint) {
    return {
      error: Response.json(
        {
          error:
            'No Sanity Context endpoint available. Set SANITY_CONTEXT_ORG_TOKEN (plus SANITY_CONTEXT_MCP_URL) for the org endpoint, or SANITY_API_READ_TOKEN for the dataset endpoint.',
        },
        { status: 500 },
      ),
    }
  }

  const model = resolveLanguageModel()
  if (!model) {
    return {
      error: Response.json(
        {
          error:
            'No LLM configured. Set GROQ_API_KEY and/or ANTHROPIC_API_KEY (optional CHAT_LLM_PROVIDER=groq|anthropic).',
        },
        { status: 500 },
      ),
    }
  }

  let body
  try {
    body = await request.json()
  } catch {
    return { error: Response.json({ error: 'Invalid JSON body.' }, { status: 400 }) }
  }

  const { messages, documentFocus, documentContext, systemPromptExtra, threadId } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      error: Response.json({ error: 'Request must include a non-empty messages array.' }, { status: 400 }),
    }
  }

  return { endpoint, model, messages, documentFocus, documentContext, systemPromptExtra, threadId }
}

/**
 * Builds Sanity Insights telemetry for this agent, or returns undefined when it
 * cannot run.
 *
 * Conversations are stored against the organization, so this needs the
 * org-scoped client. Without `SANITY_CONTEXT_ORG_TOKEN` that client is null and
 * telemetry is skipped rather than failing the request.
 *
 * @param {string | undefined} threadId - Conversation id supplied by the caller, if any.
 * @param {Array<{ id?: string }>} messages - UI messages for this turn.
 * @returns {object | undefined} An `experimental_telemetry` config, when enabled.
 */
function buildInsightsTelemetry(threadId, messages) {
  if (!sanityContextClient) {
    /* Say so rather than skipping in silence: an empty dashboard otherwise
     * looks the same as an agent nobody has used yet. */
    console.warn(
      '[insights] skipped: no org-scoped Context client. SANITY_CONTEXT_ORG_TOKEN is missing or empty.',
    )
    return undefined
  }

  /* Fall back to the first message's id: it stays stable for the life of a
   * conversation, so turns still group into one thread even when the caller
   * sends no explicit `threadId`. */
  const resolvedThreadId = threadId || messages[0]?.id

  if (!resolvedThreadId) {
    console.warn(
      '[insights] skipped: no threadId on the request and no id on the first message, ' +
        'so turns could not be grouped into a conversation.',
    )
    return undefined
  }

  return {
    isEnabled: true,
    integrations: [
      sanityInsightsIntegration({
        client: sanityContextClient,
        threadId: resolvedThreadId,
        metadata: { mcpEndpoints: INSIGHTS_ENDPOINT_NAME },
      }),
    ],
  }
}

export const POST = async (request) => {
  const validated = await validateChatEnvironment(request)
  if (validated.error) {
    return validated.error
  }

  const { endpoint, model, messages, documentFocus, documentContext, systemPromptExtra, threadId } = validated

  let mcpClient = null

  try {
    mcpClient = await createMCPClient({
      transport: {
        type: 'http',
        url: endpoint.url,
        headers: {
          Authorization: `Bearer ${endpoint.token}`,
        },
      },
    })

    const mcpTools = await mcpClient.tools()
    const extra =
      typeof systemPromptExtra === 'string' ? systemPromptExtra : process.env.AGENT_SYSTEM_PROMPT_EXTRA || ''

    const focus = documentFocus && typeof documentFocus === 'object' ? documentFocus : {}
    const legacy = documentContext && typeof documentContext === 'object' ? documentContext : {}

    const system = buildSystemPrompt({
      extra,
      documentFocus: focus,
      legacyContext: legacy,
    })

    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(messages),
      tools: mcpTools,
      stopWhen: stepCountIs(MAX_STEPS),
      experimental_telemetry: buildInsightsTelemetry(threadId, messages),
      onFinish: async () => {
        await mcpClient?.close()
      },
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    })
  } catch (error) {
    await mcpClient?.close()
    console.error('[api/chat]', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Sanity agent request failed.' },
      { status: 500 },
    )
  }
}
