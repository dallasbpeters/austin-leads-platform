import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TikTokPost } from '@/components/tiktok-posts'

describe(TikTokPost, () => {
  it('plays a TikTok video link in TikTok’s player', () => {
    const html = renderToStaticMarkup(
      <TikTokPost
        value={{ url: 'https://www.tiktok.com/@txsolarpros/video/7301234567890123456?is_from_webapp=1' }}
      />,
    )
    expect(html).toContain('src="https://www.tiktok.com/player/v1/7301234567890123456?description=1"')
  })

  it('shows nothing for a link that is not a TikTok video', () => {
    expect(renderToStaticMarkup(<TikTokPost value={{ url: 'https://example.com/@x/video/1' }} />)).toBe('')
    expect(renderToStaticMarkup(<TikTokPost value={{}} />)).toBe('')
  })
})
