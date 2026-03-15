import { stegaClean } from 'next-sanity'

export function isPortableTextValue(value) {
  return Array.isArray(value)
}

function cleanText(value) {
  return typeof value === 'string' ? stegaClean(value) : ''
}

export function portableTextToPlainText(value) {
  if (!value) return ''
  if (typeof value === 'string') return cleanText(value)
  if (!Array.isArray(value)) return ''

  const lines = value
    .map((block) => {
      if (!block) return ''
      if (typeof block === 'string') return cleanText(block)

      if (Array.isArray(block.children)) {
        return block.children
          .map((child) => {
            if (typeof child === 'string') return cleanText(child)
            if (typeof child?.text === 'string') return cleanText(child.text)
            return ''
          })
          .join('')
      }

      if (typeof block?.text === 'string') {
        return cleanText(block.text)
      }

      return ''
    })
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.join('\n\n')
}
