import { TIKTOK_VIDEO_URL } from '@/lib/platform/tiktok'

/*
 * TikTok videos from rich text (Studio: TikTok post), the TikTok match for
 * instagram-posts.jsx. It is TikTok's standard embed (the card TikTok's own
 * "Embed" gives) in a frame, so no script loads on the page. The bare player
 * (/player/v1) showed "Watch on TikTok" instead of playing many videos. A link
 * that is not a TikTok video shows nothing. Posts in a row share one grid with
 * Instagram posts (embedGrid in portable-text-content.jsx).
 */
const TikTokEmbed = ({ url }) => {
  const videoId = String(url || '').match(TIKTOK_VIDEO_URL)?.[2]
  if (!videoId) {
    return null
  }
  return (
    <div className="tiktok-post">
      <iframe
        className="tiktok-post__frame"
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        title="TikTok video"
        allow="encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}

/** One video (a portable text `tiktokPost` block). */
export const TikTokPost = ({ value }) => <TikTokEmbed url={value?.url} />
