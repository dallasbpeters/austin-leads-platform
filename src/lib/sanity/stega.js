import { stegaClean } from 'next-sanity'

export function cleanRuntimeString(value) {
  return typeof value === 'string' ? stegaClean(value) : value
}

export function cleanRuntimeHref(value) {
  const href = cleanRuntimeString(value)
  return typeof href === 'string' ? href : ''
}

export function buildRuntimeKey(...parts) {
  const key = parts
    .map((part) => cleanRuntimeString(part))
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join('::')

  return key || 'item'
}

export function toRuntimeToken(value) {
  return String(cleanRuntimeString(value) || '')
    .toLowerCase()
    .replaceAll('&', ' and ')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}
