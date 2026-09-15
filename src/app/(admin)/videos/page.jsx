import VideosClient from '@/components/admin/videos-client'
import { resolveRefreshToken } from '@/lib/platform/youtube-db'
import { getSanityServerClient } from '@/sanity/client'

export const dynamic = 'force-dynamic'

export default async function VideosPage() {
  const sanity = getSanityServerClient({ preview: false, stega: false })

  let projects = []
  if (sanity) {
    projects = await sanity.fetch(
      `*[_type == "videoProject"] | order(_createdAt desc) {
         _id, title, "slug": slug.current, message, status, reviewUrl, renderUrl, youtube
       }`,
    )
  }

  let youtubeConnected = false
  let channelEmail = null
  try {
    const stored = await resolveRefreshToken()
    youtubeConnected = Boolean(stored)
    channelEmail = stored?.channelEmail ?? null
  } catch {
    /* Not connected yet is a normal state, not a failure. */
  }

  return (
    <VideosClient
      channelEmail={channelEmail}
      initialProjects={projects}
      youtubeConnected={youtubeConnected}
    />
  )
}
