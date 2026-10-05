import { describe, expect, it } from 'vitest'

import { numberWords, spokenLine, spokenNumbers, toRenderScenes } from '@/lib/reels/scenes'

describe('what the voice says', () => {
  it('reads a photo scene headline then its supporting line', () => {
    expect(
      spokenLine({ type: 'photo', eyebrow: 'Leander', headline: 'Your house. Lit.', sub: 'We hang it' }),
    ).toBe('Your house. Lit. We hang it.')
  })

  it('reads the price inside the offer sentence', () => {
    expect(
      spokenLine({
        type: 'offer',
        eyebrow: 'Roofline package',
        headline: 'Starting at',
        price: '$300',
        sub: 'Install, mid-season service, takedown.',
      }),
    ).toBe('Roofline package. Starting at three hundred dollars. Install, mid-season service, takedown.')
  })

  it('turns the sign-off into a spoken call to action', () => {
    expect(
      spokenLine({ type: 'signoff', headline: 'Free estimate · No pressure', sub: '(512) 775-0561' }),
    ).toBe('Free estimate, No pressure. Call five one two, seven seven five, zero five six one.')
  })

  it('stays silent for an empty scene and ships the line with each render scene', () => {
    expect(spokenLine({ type: 'text' })).toBe('')
    const [scene] = toRenderScenes([{ id: 'a', type: 'text', headline: 'Booked out', duration: 3 }])
    expect(scene).toMatchObject({ say: 'Booked out.', duration: 3 })
    expect(scene.id).toBeUndefined()
  })
})

describe('numbers the voice can say', () => {
  it('turns prices, phone numbers and counts into words', () => {
    expect(numberWords(1250)).toBe('one thousand two hundred fifty')
    expect(numberWords(0)).toBe('zero')
    expect(numberWords(115)).toBe('one hundred fifteen')
    expect(spokenNumbers('Starting at $1,250')).toBe('Starting at one thousand two hundred fifty dollars')
    expect(spokenNumbers('$49.99 a month')).toBe('forty nine dollars and ninety nine cents a month')
    expect(spokenNumbers('Call 512-775-0561')).toBe('Call five one two, seven seven five, zero five six one')
    expect(spokenNumbers('Over 400 homes lit')).toBe('Over four hundred homes lit')
  })
})

describe('reel caption and posting', () => {
  it('builds a caption from the reel', async () => {
    const { defaultCaption } = await import('@/lib/reels/scenes')
    const caption = defaultCaption([
      { type: 'photo', headline: 'Your house. Lit.', sub: 'We hang it' },
      { type: 'offer', headline: 'Starting at', price: '$300' },
      { type: 'signoff', sub: '(512) 775-0561', headline: 'Free estimate' },
    ])
    expect(caption).toContain('Your house. Lit. We hang it.')
    expect(caption).toContain('Starting at $300.')
    expect(caption).toContain('(512) 775-0561')
  })

  it('only posts videos from Vercel Blob', async () => {
    const { isPostableVideoUrl } = await import('@/lib/social/publish')
    expect(isPostableVideoUrl('https://abc.public.blob.vercel-storage.com/reels/x.mp4')).toBeTruthy()
    expect(isPostableVideoUrl('https://evil.example.com/x.mp4')).toBeFalsy()
    expect(isPostableVideoUrl('not a url')).toBeFalsy()
  })
})
