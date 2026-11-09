import { TIKTOK_VIDEO_URL } from '@/lib/platform/tiktok'

/*
 * TikTok videos from rich text (Studio: TikTok post), the TikTok match for
 * instagram-posts.jsx. TikTok's own player runs in a frame, so no script loads
 * on the page. A link that is not a TikTok video shows nothing.
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
        src={`https://www.tiktok.com/player/v1/${videoId}?description=1`}
        title="TikTok video"
        allow="encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}

/** One video (a portable text `tiktokPost` block). */
export const TikTokPost = ({ value }) => <TikTokEmbed url={value?.url} />

/** Two or more videos in a row, side by side (see groupEmbeds in portable-text-content.jsx). */
export const TikTokGrid = ({ value }) => (
  <div className="tiktok-grid">
    {value.posts.map((post) => (
      <TikTokEmbed key={post._key} url={post.url} />
    ))}
  </div>
)
