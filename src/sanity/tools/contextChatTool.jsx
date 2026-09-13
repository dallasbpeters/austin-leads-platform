import { Badge, Box, Button, Card, Flex, Spinner, Stack, Text, TextArea } from '@sanity/ui'
import React from 'react'

import { localFrontendUrl, studioPreviewOrigin } from '../env'

/**
 * Chat pane for the Sanity Context agent.
 *
 * Talks to this app's own `/api/chat`, which merges two MCP servers: Sanity
 * Context for grounded reads and the hosted Sanity MCP for writes, minus the
 * publish/delete tools. So the agent can draft and patch, and a person still
 * publishes here in Studio.
 *
 * The route is guarded by the app's own session, so you must be signed in to
 * the admin in this browser. Running Studio embedded at `/studio` keeps that
 * cookie same-origin; the hosted studio needs `credentials: 'include'` to work
 * plus CORS on the route.
 */

const isLocal = () =>
  typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)

/**
 * Origin of the Next app that serves /api/chat.
 *
 * `studioPreviewOrigin` rather than `frontendUrl`: the apex domain 301s to www
 * on Vercel, and a cross-origin POST that redirects loses both its body and its
 * CORS headers.
 *
 * @returns {string} Origin without a trailing slash.
 */
const appOrigin = () => (isLocal() ? localFrontendUrl : studioPreviewOrigin).replace(/\/$/, '')

/**
 * Where to POST chat turns.
 *
 * Decided by HOST, not by path. Studio runs in three places -- embedded in the
 * app at /studio, on <project>.sanity.studio, and inside the Sanity dashboard --
 * and only the first shares an origin with the API. The hosted studio's path
 * also starts with /studio, so a path check sends the request to the studio host
 * and 404s.
 *
 * Set SANITY_STUDIO_CHAT_ENDPOINT to override. Only `SANITY_STUDIO_*` variables
 * reach this bundle: Studio is built by Vite, so NEXT_PUBLIC_* is undefined here
 * and env.js falls back to its literals.
 *
 * @returns {string} Relative URL when same-origin, absolute otherwise.
 */
const chatEndpoint = () => {
  const configured = process.env.SANITY_STUDIO_CHAT_ENDPOINT
  if (configured) {
    return configured.trim().replace(/\/$/, '')
  }

  const origin = appOrigin()

  if (typeof window !== 'undefined' && window.location.origin === origin) {
    return '/api/chat'
  }

  return `${origin}/api/chat`
}

const newId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

/**
 * Parses one SSE line into an event object.
 *
 * @param {string} line - Raw line from the stream.
 * @returns {object | null} The decoded event, or null for keepalives and noise.
 */
function parseEventLine(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) {
    return null
  }

  const payload = trimmed.slice(5).trim()
  if (!payload || payload === '[DONE]') {
    return null
  }

  try {
    return JSON.parse(payload)
  } catch {
    return null
  }
}

/**
 * Routes one stream event to the right handler.
 *
 * @param {object} event - Decoded stream event.
 * @param {{onText: (delta: string) => void, onTool: (name: string) => void}} handlers - Callbacks.
 * @throws {Error} When the stream reports an error event.
 */
function handleEvent(event, { onText, onTool }) {
  const type = String(event.type || '')

  if (type === 'error') {
    throw new Error(event.errorText || event.error || 'Stream error.')
  }

  if (type === 'text-delta' || type === 'text') {
    const delta = event.delta ?? event.textDelta ?? event.text ?? ''
    if (delta) {
      onText(delta)
    }
    return
  }

  /* Surface tool activity so a write is never silent. */
  if (type.startsWith('tool-')) {
    const name = event.toolName || event.name
    if (name) {
      onTool(name)
    }
  }
}

/**
 * Reads an AI SDK UI message stream to completion.
 *
 * @param {Response} response - Fetch response from the chat route.
 * @param {{onText: (delta: string) => void, onTool: (name: string) => void}} handlers - Callbacks.
 */
async function readStream(response, handlers) {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body to read.')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const event = parseEventLine(line)
      if (event) {
        handleEvent(event, handlers)
      }
    }
  }
}

function ContextChat() {
  const [messages, setMessages] = React.useState([])
  const [input, setInput] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [tools, setTools] = React.useState([])
  const threadId = React.useMemo(newId, [])
  const bottom = React.useRef(null)

  React.useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = React.useCallback(async () => {
    const question = input.trim()
    if (!question || busy) {
      return
    }

    const outgoing = [...messages, { id: newId(), role: 'user', parts: [{ type: 'text', text: question }] }]
    const replyId = newId()

    setMessages([...outgoing, { id: replyId, role: 'assistant', parts: [{ type: 'text', text: '' }] }])
    setInput('')
    setError('')
    setTools([])
    setBusy(true)

    const appendToReply = (delta) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === replyId
            ? { ...message, parts: [{ type: 'text', text: (message.parts[0]?.text || '') + delta }] }
            : message,
        ),
      )
    }

    const endpoint = chatEndpoint()

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: outgoing, threadId }),
      })

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}))
        if (response.status === 404) {
          throw new Error(
            `No chat route at ${endpoint} (404). That server does not have /api/chat — it is probably ` +
              'production, which has not been deployed with this branch yet. Open Studio at ' +
              '/studio on the app itself, or set SANITY_STUDIO_CHAT_ENDPOINT to the right origin.',
          )
        }

        throw new Error(
          detail.error ||
            (response.status === 401
              ? `Not signed in (401 from ${endpoint}). Open the admin in this browser, sign in, then try again.`
              : `Request failed (${response.status}) from ${endpoint}.`),
        )
      }

      await readStream(response, {
        onText: appendToReply,
        onTool: (name) => setTools((current) => (current.includes(name) ? current : [...current, name])),
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError))
    } finally {
      setBusy(false)
    }
  }, [busy, input, messages, threadId])

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      send()
    }
  }

  return (
    <Flex direction="column" height="fill" style={{ maxWidth: '52rem', margin: '0 auto', width: '100%' }}>
      <Box padding={4} paddingBottom={2}>
        <Stack gap={3}>
          <Text size={3} weight="semibold">
            Content agent
          </Text>
          <Text size={1} muted>
            Asks and answers from this dataset, and can draft or patch documents. It cannot publish — that
            stays with you.
          </Text>
        </Stack>
      </Box>

      <Box flex={1} overflow="auto" padding={4} paddingTop={2}>
        <Stack gap={4}>
          {messages.length === 0 && (
            <Card padding={4} radius={3} tone="transparent">
              <Stack gap={3}>
                <Text size={1} muted>
                  Try: “Which service pages are missing a meta description?” or “Draft a Leander location page
                  from the Cedar Park one, leave it as a draft.”
                </Text>
              </Stack>
            </Card>
          )}

          {messages.map((message) => (
            <Card
              key={message.id}
              padding={3}
              radius={3}
              tone={message.role === 'user' ? 'primary' : 'transparent'}
              border={message.role !== 'user'}
            >
              <Stack gap={3}>
                <Text size={0} muted weight="semibold">
                  {message.role === 'user' ? 'You' : 'Agent'}
                </Text>
                <Text size={1} style={{ whiteSpace: 'pre-wrap' }}>
                  {message.parts[0]?.text || (busy ? '…' : '')}
                </Text>
              </Stack>
            </Card>
          ))}

          {tools.length > 0 && (
            <Flex gap={2} wrap="wrap">
              {tools.map((name) => (
                <Badge key={name} tone="primary">
                  {name}
                </Badge>
              ))}
            </Flex>
          )}

          {error && (
            <Card padding={3} radius={3} tone="critical">
              <Text size={1}>{error}</Text>
            </Card>
          )}

          <div ref={bottom} />
        </Stack>
      </Box>

      <Card padding={4} borderTop>
        <Stack gap={3}>
          <TextArea
            rows={3}
            value={input}
            placeholder="Ask about the content, or ask for a draft edit…"
            onChange={(event) => setInput(event.currentTarget.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
          />
          <Flex align="center" gap={3}>
            <Button
              text={busy ? 'Working…' : 'Send'}
              tone="primary"
              disabled={busy || input.trim().length === 0}
              onClick={send}
            />
            {busy && <Spinner muted />}
            <Box flex={1} />
            <Text size={0} muted>
              Cmd/Ctrl + Enter to send
            </Text>
          </Flex>
        </Stack>
      </Card>
    </Flex>
  )
}

function ToolIcon() {
  return (
    <span aria-hidden="true" style={{ fontSize: '0.95rem', lineHeight: 1 }}>
      ✳
    </span>
  )
}

export function contextChatTool() {
  return {
    name: 'content-agent',
    title: 'Content agent',
    icon: ToolIcon,
    component: ContextChat,
  }
}
