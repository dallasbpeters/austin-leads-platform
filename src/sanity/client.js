import { createClient } from 'next-sanity'

import { apiVersion, canonicalStudioUrl, dataset, isSanityConfigured, projectId, useCdn } from './env'

const baseConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
}

const viewerToken =
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_API_VIEWER_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN

export const sanityClient = isSanityConfigured() ? createClient(baseConfig) : null

export const sanityWriteClient =
  isSanityConfigured() && process.env.SANITY_API_WRITE_TOKEN
    ? createClient({
        ...baseConfig,
        token: process.env.SANITY_API_WRITE_TOKEN,
        useCdn: false,
      })
    : null

export const sanityServerClient = sanityWriteClient || sanityClient

export function getSanityServerClient({ preview = false, stega = preview } = {}) {
  if (!isSanityConfigured()) {
    return null
  }

  return createClient({
    ...baseConfig,
    token: preview ? viewerToken : undefined,
    useCdn: preview ? false : useCdn,
    perspective: preview ? 'drafts' : 'published',
    stega: stega
      ? {
          studioUrl: canonicalStudioUrl,
        }
      : false,
  })
}

export function hasSanityViewerToken() {
  return Boolean(viewerToken)
}
