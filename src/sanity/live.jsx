import { createClient } from 'next-sanity'
import { defineLive } from 'next-sanity/live'

import { apiVersion, dataset, projectId, runtimeStudioUrl, useCdn } from './env'

const viewerToken =
  process.env.SANITY_VIEWER_TOKEN ||
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_API_VIEWER_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN

const liveConfig =
  projectId && dataset && viewerToken
    ? defineLive({
        client: createClient({
          projectId,
          dataset,
          apiVersion,
          useCdn,
          // `enabled` defaults to false; without it live content carries no edit links.
          stega: {
            enabled: true,
            studioUrl: runtimeStudioUrl,
          },
        }),
        browserToken: viewerToken,
        serverToken: viewerToken,
      })
    : null

export function SanityLive() {
  if (!liveConfig) {
    return null
  }

  const LiveComponent = liveConfig.SanityLive
  return <LiveComponent />
}

export const sanityFetch = liveConfig?.sanityFetch
