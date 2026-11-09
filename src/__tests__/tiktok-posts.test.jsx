import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TikTokPost } from '@/components/tiktok-posts'

describe(TikTokPost, () => {
  it('shows a TikTok video link in TikTok’s embed', () => {
    const html = renderToStaticMarkup(
      <TikTokPost
        value={{ url: 'https://www.tiktok.com/@txsolarpros/video/7301234567890123456?is_from_webapp=1' }}
      />,
    )
    expect(html).toContain('src="https://www.tiktok.com/embed/v2/7301234567890123456"')
  })

  it('shows nothing for a link that is not a TikTok video', () => {
    expect(renderToStaticMarkup(<TikTokPost value={{ url: 'https://example.com/@x/video/1' }} />)).toBe('')
    expect(renderToStaticMarkup(<TikTokPost value={{}} />)).toBe('')
  })
})

describe('social posts in a row', () => {
  it('puts Instagram and TikTok posts side by side in one grid', async () => {
    const { default: PortableTextContent } = await import('@/components/portable-text-content')
    const html = renderToStaticMarkup(
      <PortableTextContent
        value={[
          { _type: 'instagramPost', _key: 'a', url: 'https://www.instagram.com/p/AAA/' },
          { _type: 'instagramPost', _key: 'b', url: 'https://www.instagram.com/p/BBB/' },
          {
            _type: 'tiktokPost',
            _key: 'c',
            url: 'https://www.tiktok.com/@txsolarpros/video/7301234567890123456',
          },
        ]}
      />,
    )
    expect(html.match(/class="embed-grid"/g)).toHaveLength(1)
    expect(html.indexOf('tiktok.com/embed/v2')).toBeGreaterThan(html.indexOf('class="embed-grid"'))
  })
})
