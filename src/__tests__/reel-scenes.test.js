import { describe, expect, it } from 'vitest'

import { spokenLine, toRenderScenes } from '@/lib/reels/scenes'

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
    ).toBe('Roofline package. Starting at $300. Install, mid-season service, takedown.')
  })

  it('turns the sign-off into a spoken call to action', () => {
    expect(
      spokenLine({ type: 'signoff', headline: 'Free estimate · No pressure', sub: '(512) 775-0561' }),
    ).toBe('Free estimate, No pressure. Call (512) 775-0561.')
  })

  it('stays silent for an empty scene and ships the line with each render scene', () => {
    expect(spokenLine({ type: 'text' })).toBe('')
    const [scene] = toRenderScenes([{ id: 'a', type: 'text', headline: 'Booked out', duration: 3 }])
    expect(scene).toMatchObject({ say: 'Booked out.', duration: 3 })
    expect(scene.id).toBeUndefined()
  })
})
