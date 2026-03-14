const isDev = process.env.NODE_ENV === 'development'

function toAttributeValue(value) {
  if (!value) return undefined

  return String(value).replace(/"/g, '&quot;')
}

export function getDevTraceAttributes({ markup, content, note } = {}) {
  if (!isDev) {
    return {}
  }

  return {
    'data-dev-markup': markup,
    'data-dev-content': content,
    'data-dev-note': note,
  }
}

export function getDevSectionAttributes({ id, markup, content, note } = {}) {
  return {
    id,
    'data-vercel-edit-target': '',
    'data-sanity-edit-target': '',
    ...getDevTraceAttributes({ markup, content, note }),
  }
}

export default function DevTrace({ markup, content, note = null }) {
  if (!isDev) {
    return null
  }

  const parts = [`markup: ${markup}`]

  if (content) parts.push(`content: ${content}`)
  if (note) parts.push(`note: ${note}`)

  const comment = `<!-- dev-trace | ${parts.join(' | ')} -->`

  return (
    <template
      data-dev-trace=""
      data-dev-markup={toAttributeValue(markup)}
      data-dev-content={toAttributeValue(content)}
      data-dev-note={toAttributeValue(note)}
      dangerouslySetInnerHTML={{ __html: comment }}
    />
  )
}
