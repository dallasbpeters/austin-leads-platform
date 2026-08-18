// oxlint-disable unicorn/no-useless-undefined
import { sanityInsightsIntegration } from '@sanity/context/ai-sdk'

import { anthropic } from '@ai-sdk/anthropic'
import { createGroq } from '@ai-sdk/groq'
import { createMCPClient } from '@ai-sdk/mcp'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'

import { safeAuth } from '@/lib/auth/session'
import { sanityWriteClient } from '@/sanity/client'
import { dataset, projectId } from '@/sanity/env'

export const runtime = 'nodejs'

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-5'
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'
/* Groups this agent's conversations in the Sanity Insights dashboard. */
const INSIGHTS_AGENT_ID = 'austin-leads-studio-agent'

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

const getAgentContextMcpUrl = () => {
  const fromEnv = process.env.SANITY_CONTEXT_MCP_URL?.trim()
  if (fromEnv) {
    return fromEnv
  }
  if (!projectId || !dataset) {
    return ''
  }
  return `https://api.sanity.io/v2026-03-03/agent-context/${projectId}/${dataset}`
}

const validateChatEnvironment = async (request) => {
  const session = await safeAuth()
  if (!session?.user) {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const mcpUrl = getAgentContextMcpUrl()
  const readToken = process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_VIEWER_TOKEN?.trim()

  if (!mcpUrl) {
    return {
      error: Response.json(
        {
          error:
            'Sanity project/dataset missing. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET, or SANITY_CONTEXT_MCP_URL.',
        },
        { status: 500 },
      ),
    }
  }

  if (!readToken) {
    return {
      error: Response.json(
        { error: 'SANITY_API_READ_TOKEN (or SANITY_API_VIEWER_TOKEN) is required for Agent Context MCP.' },
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

  return { mcpUrl, readToken, model, messages, documentFocus, documentContext, systemPromptExtra, threadId }
}

/**
 * Builds Sanity Insights telemetry for this agent, or returns undefined when it
 * cannot run.
 *
 * The integration writes conversations back to the dataset, so it needs a token
 * with write access. Without `SANITY_API_WRITE_TOKEN` the write client is null
 * and telemetry is skipped rather than failing the request.
 *
 * @param {string | undefined} threadId - Conversation id supplied by the caller, if any.
 * @param {Array<{ id?: string }>} messages - UI messages for this turn.
 * @returns {object | undefined} An `experimental_telemetry` config, when enabled.
 */
function buildInsightsTelemetry(threadId, messages) {
  if (!sanityWriteClient) {
    return undefined
  }

  /* Fall back to the first message's id: it stays stable for the life of a
   * conversation, so turns still group into one thread even when the caller
   * sends no explicit `threadId`. */
  const resolvedThreadId = threadId || messages[0]?.id

  if (!resolvedThreadId) {
    return undefined
  }

  return {
    isEnabled: true,
    integrations: [
      sanityInsightsIntegration({
        agentId: INSIGHTS_AGENT_ID,
        client: sanityWriteClient,
        threadId: resolvedThreadId,
      }),
    ],
  }
}

export const POST = async (request) => {
  const validated = await validateChatEnvironment(request)
  if (validated.error) {
    return validated.error
  }

  const { mcpUrl, readToken, model, messages, documentFocus, documentContext, systemPromptExtra, threadId } =
    validated

  let mcpClient = null

  try {
    mcpClient = await createMCPClient({
      transport: {
        type: 'http',
        url: mcpUrl,
        headers: {
          Authorization: `Bearer ${readToken}`,
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
