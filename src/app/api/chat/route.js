// oxlint-disable unicorn/no-useless-undefined
import { randomUUID } from 'node:crypto'

import { anthropic } from '@ai-sdk/anthropic'
import { createGroq } from '@ai-sdk/groq'
import { createMCPClient } from '@ai-sdk/mcp'
import { withTracing } from '@posthog/ai'
import { sanityInsightsIntegration } from '@sanity/context/ai-sdk'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'

import { safeAuth } from '@/lib/auth/session'
import { getPostHogClient } from '@/lib/posthog-server'
import { sanityContextClient } from '@/sanity/client'
import { contextMcpApiVersion, contextMcpName, contextOrganizationId, dataset, projectId } from '@/sanity/env'

export const runtime = 'nodejs'

/*
 * Origins allowed to call this route with credentials.
 *
 * The Content agent tool ships inside Studio, which is served from Sanity's
 * hosts, not ours. Add more with SANITY_STUDIO_ALLOWED_ORIGINS (comma
 * separated). Credentialed CORS forbids `*`, so the request's own origin is
 * echoed back only when it is on this list.
 */
const ALLOWED_ORIGINS = new Set(
  [
    'https://austin-leads-platform.sanity.studio',
    'https://www.sanity.io',
    'https://sanity.io',
    ...(process.env.SANITY_STUDIO_ALLOWED_ORIGINS || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  ].map((entry) => entry.replace(/\/$/, '')),
)

/**
 * CORS headers for one request, empty when the origin is not allowed.
 *
 * @param {Request} request - Incoming request.
 * @returns {Record<string, string>} Headers to merge into the response.
 */
const corsHeaders = (request) => {
  const origin = request.headers.get('origin')
  if (!origin || !ALLOWED_ORIGINS.has(origin.replace(/\/$/, ''))) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

/**
 * Preflight. Without this the browser never sends the POST from Studio.
 *
 * @param {Request} request - Incoming preflight request.
 * @returns {Response} 204 with CORS headers when the origin is allowed.
 */
export const OPTIONS = (request) => new Response(null, { status: 204, headers: corsHeaders(request) })

/**
 * JSON response carrying this request's CORS headers.
 *
 * @param {Request} request - Incoming request.
 * @param {object} body - JSON body.
 * @param {number} status - HTTP status.
 * @returns {Response} The response.
 */
const jsonWithCors = (request, body, status) => Response.json(body, { status, headers: corsHeaders(request) })

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-5'
/* llama-3.3-70b-versatile was decommissioned: Groq answers 404 for it. */
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b'
/* Groups this agent's conversations in the Context app, under a key of our own.
 * `agentId` is gone in v2; arbitrary metadata keys are allowed alongside the
 * well-known ones. */
const INSIGHTS_AGENT = 'austin-leads-studio-agent'

/* Name of the hosted Sanity MCP server as it appears in conversation metadata. */
const SANITY_MCP_ENDPOINT_NAME = 'sanity-mcp'

const MAX_STEPS = 20

const toAiSessionId = (value) => String(value).replace(/[^A-Za-z0-9_~.@()!'|:-]/g, '-')

const BASE_SYSTEM_PROMPT = `You are a **Sanity CMS assistant** for the Austin Leads Platform (Texas Solar and Roofing Pros). You help **editors and operators** work with **documents and structure** in the dataset—not end-site visitors.

## Domain facts (when interpreting or summarizing public content)
- The federal residential solar tax credit is **not** available; it expired December 31, 2025. Do not recommend it in savings or eligibility copy.
- Austin Energy: **$2,500** one-time rebate and **Value of Solar** bill credits at **9.91¢/kWh** (confirm against current CMS fields when relevant).

## Tools (Agent Context)
- **initial_context** — schema overview, types, counts. Use when exploring the model or starting a task.
- **groq_query** — run **Sanity GROQ** (the query language). This is **not** the Groq Cloud LLM. Always include **_id** in projections when the user might open or patch documents.
- **schema_explorer** — field-level detail for a document type.

## Tools (Sanity MCP — writes)
- **create_documents / patch_documents** and friends let you change content. They are real writes against the live dataset.

## Write rules — follow exactly
1. **Read before you write.** Fetch the document and confirm the current values before patching. Never patch a field you have not read.
2. **Drafts only.** Write to the draft (\`drafts.<id>\`), never to a published document. Publishing is a human action in Studio; the publish tools are withheld from you on purpose. Do not look for a way around that.
3. **Say what you are about to do**, then do it, then report the \`_id\` and the fields you changed so the person can open it and check.
4. **One change at a time.** No sweeping rewrites across many documents in a single turn unless the person asked for exactly that and named the scope.
5. **Never delete.** Not documents, not array items, unless the person asked for that specific removal in this conversation.
6. If a write fails, say so plainly and stop. Do not retry with a different shape hoping it sticks.

## Behaviors
- Prefer accurate, structured answers: cite document types, key fields, and \`_id\`s.
- Stay concise; use markdown for lists and code blocks for GROQ examples.
- Content you draft follows the brand voice: warm, plain, direct. No hype words. The federal solar tax credit expired December 31, 2025 — never reference it.
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
 * @param {{ extra?: string; documentFocus?: Record<string, string>; legacyContext?: Record<string, string> }} props - Extra instructions plus any document the client has open.
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
 * @returns {{url: string, token: string, scope: 'organization' | 'dataset'} | null} The endpoint to
 *   use and the token for it, or null when neither is configured.
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

/** Hosted Sanity MCP server, the write half of this agent's toolset. */
const SANITY_MCP_URL = (process.env.SANITY_MCP_URL || 'https://mcp.sanity.io').trim()

/**
 * Tools withheld from the model. The agent drafts; a person publishes in Studio.
 * Matched case-insensitively as substrings, so `publish_documents` and
 * `publish_release` both fall out.
 */
const WITHHELD_TOOL_PATTERNS = (
  process.env.SANITY_MCP_WITHHELD_TOOLS ||
  'publish,unpublish,delete,discard,schedule,release,deploy,transaction'
)
  .split(',')
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean)

/**
 * Drops write tools this agent should not have.
 *
 * The guardrail lives here rather than in the prompt: a system prompt is a
 * request, an absent tool is a fact.
 *
 * @param {Record<string, unknown>} tools - Tool set as reported by the MCP server.
 * @returns {{tools: Record<string, unknown>, withheld: string[]}} The tools the model may
 *   use, plus the names that were dropped, for logging.
 */
const withholdDangerousTools = (tools) => {
  const kept = {}
  const withheld = []

  for (const [name, tool] of Object.entries(tools)) {
    const lower = name.toLowerCase()
    if (WITHHELD_TOOL_PATTERNS.some((pattern) => lower.includes(pattern))) {
      withheld.push(name)
      continue
    }
    kept[name] = tool
  }

  return { tools: kept, withheld }
}

/**
 * Whether the caller is allowed in.
 *
 * Two ways: an app session (the admin, same-origin) or the shared key (the
 * Studio tool, which runs on *.sanity.studio). The key exists because browsers
 * withhold the session cookie from a third-party context no matter what
 * SameSite says, the same reason the Gemini image route works this way.
 *
 * @param {Request} request - Incoming request.
 * @returns {Promise<boolean>} True when authorized.
 */
const isAuthorized = async (request) => {
  const expectedKey = process.env.CHAT_AGENT_KEY?.trim()
  if (expectedKey && request.headers.get('x-api-key') === expectedKey) {
    return true
  }

  const session = await safeAuth()
  return Boolean(session?.user)
}

const validateChatEnvironment = async (request) => {
  if (!(await isAuthorized(request))) {
    return {
      error: jsonWithCors(
        request,
        {
          error:
            'Unauthorized. Sign in to the admin, or send x-api-key matching CHAT_AGENT_KEY (what the Studio tool does).',
        },
        401,
      ),
    }
  }

  const endpoint = resolveContextEndpoint()

  if (!endpoint) {
    return {
      error: jsonWithCors(
        request,
        {
          error:
            'No Sanity Context endpoint available. Set SANITY_CONTEXT_ORG_TOKEN (plus SANITY_CONTEXT_MCP_URL) for the org endpoint, or SANITY_API_READ_TOKEN for the dataset endpoint.',
        },
        500,
      ),
    }
  }

  const model = resolveLanguageModel()
  if (!model) {
    return {
      error: jsonWithCors(
        request,
        {
          error:
            'No LLM configured. Set GROQ_API_KEY and/or ANTHROPIC_API_KEY (optional CHAT_LLM_PROVIDER=groq|anthropic).',
        },
        500,
      ),
    }
  }

  let body
  try {
    body = await request.json()
  } catch {
    return { error: jsonWithCors(request, { error: 'Invalid JSON body.' }, 400) }
  }

  const { messages, documentFocus, documentContext, systemPromptExtra, threadId } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      error: jsonWithCors(request, { error: 'Request must include a non-empty messages array.' }, 400),
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
 * `metadata.mcpEndpoints` must be an ARRAY of endpoint names, not a string:
 * Context's own queries filter it with `$mcpEndpoint in metadata.mcpEndpoints`,
 * and GROQ's `in` needs an array on the right. A bare string still type-checks
 * (the field is `string | string[]`) and then quietly matches nothing, so
 * conversations would never group by endpoint or enter the classification
 * queue.
 *
 * @param {string | undefined} threadId - Conversation id supplied by the caller, if any.
 * @param {Array<{ id?: string }>} messages - UI messages for this turn.
 * @param {string[]} mcpEndpoints - Names of the MCP endpoints used for this turn.
 * @returns {object | undefined} An `experimental_telemetry` config, when enabled.
 */
function buildInsightsTelemetry(threadId, messages, mcpEndpoints) {
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
        metadata: {
          mcpEndpoints,
          agent: INSIGHTS_AGENT,
        },
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
  const session = await safeAuth()
  const posthog = getPostHogClient()
  const conversationId = threadId || messages[0]?.id || randomUUID()
  const tracedModel = posthog
    ? withTracing(model, {
        posthog,
        posthogTraceId: randomUUID(),
        posthogProperties: { $ai_session_id: `sanity-agent-${toAiSessionId(conversationId)}` },
        ...(session?.user?.id ? { posthogDistinctId: session.user.id } : {}),
      })
    : model

  let mcpClient = null
  let writeClient = null

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

    const contextTools = await mcpClient.tools()

    /* Writes come from the hosted Sanity MCP server, which needs a token with
     * write access. Without one the agent stays read-only instead of failing. */
    let writeTools = {}
    let withheldTools = []
    const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim()

    if (writeToken) {
      try {
        writeClient = await createMCPClient({
          transport: {
            type: 'http',
            url: SANITY_MCP_URL,
            headers: { Authorization: `Bearer ${writeToken}` },
          },
          /* mcp.sanity.io rejects the protocol version this client probes with
           * (2026-07-28; the server tops out at 2025-11-25) and errors instead
           * of negotiating down. Skipping discovery makes it initialize on a
           * version the server accepts. Drop this once Sanity catches up. */
          protocolVersionDiscovery: false,
        })
        const filtered = withholdDangerousTools(await writeClient.tools())
        writeTools = filtered.tools
        withheldTools = filtered.withheld
      } catch (writeError) {
        /* A dead write server should not take the whole agent down: log it and
         * carry on with reads. */
        console.error('[api/chat] Sanity MCP (write) unavailable:', writeError)
        await writeClient?.close()
        writeClient = null
      }
    } else {
      console.warn('[api/chat] read-only: SANITY_API_WRITE_TOKEN is not set.')
    }

    if (withheldTools.length > 0) {
      console.info('[api/chat] withheld write tools:', withheldTools.join(', '))
    }

    const mcpTools = { ...contextTools, ...writeTools }

    /* Endpoint names for Insights: the Context endpoint is the last path segment
     * of its URL, which is the name the Context app shows. */
    const mcpEndpoints = [endpoint.url.split('/').filter(Boolean).pop()]
    if (writeClient) {
      mcpEndpoints.push(SANITY_MCP_ENDPOINT_NAME)
    }

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
      model: tracedModel,
      system,
      messages: await convertToModelMessages(messages),
      tools: mcpTools,
      stopWhen: stepCountIs(MAX_STEPS),
      experimental_telemetry: buildInsightsTelemetry(threadId, messages, mcpEndpoints),
      onFinish: async () => {
        await Promise.allSettled([mcpClient?.close(), writeClient?.close(), posthog?.flush()])
      },
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      headers: corsHeaders(request),
      /* Default is a bare "An error occurred.", which sends you to the server
       * logs for every failure. This is an internal tool: say what broke. */
      onError: (error) => {
        console.error('[api/chat] stream error:', error)
        return error instanceof Error ? error.message : String(error)
      },
    })
  } catch (error) {
    await Promise.allSettled([mcpClient?.close(), writeClient?.close(), posthog?.flush()])
    console.error('[api/chat]', error)
    return jsonWithCors(
      request,
      { error: error instanceof Error ? error.message : 'Sanity agent request failed.' },
      500,
    )
  }
}
