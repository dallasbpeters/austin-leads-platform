import { createClient as createContextClient } from '@sanity/client'
import { createClient } from 'next-sanity'

import {
  apiVersion,
  canonicalStudioUrl,
  contextApiVersion,
  contextOrganizationId,
  dataset,
  isSanityConfigured,
  projectId,
  useCdn,
} from './env'

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

export const sanityAgentWriteClient =
  isSanityConfigured() && process.env.SANITY_API_WRITE_TOKEN
    ? createClient({
        ...baseConfig,
        apiVersion: 'vX',
        token: process.env.SANITY_API_WRITE_TOKEN,
        useCdn: false,
      })
    : null

/**
 * Org-scoped client for Sanity Context (v2).
 *
 * Insights conversations are stored against the ORGANIZATION, so this client
 * needs `context: {organizationId}` and an organization token -- a project
 * token is rejected with "Not a member of this organization". Null when no
 * organization token is set, which turns Insights off rather than failing the
 * chat request.
 */
export const sanityContextClient = (() => {
  const token = process.env.SANITY_CONTEXT_ORG_TOKEN?.trim()
  if (!token || !contextOrganizationId) {
    return null
  }
  return createContextClient({
    projectId,
    dataset,
    apiVersion: contextApiVersion,
    token,
    useCdn: false,
    context: { organizationId: contextOrganizationId },
  })
})()

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
