import { describe, expect, it } from 'vitest'

import { rootMetadata } from '@/lib/root-metadata'

describe('root metadata', () => {
  // iOS link detection rewrites the server HTML before hydration (React error #418).
  it('turns off iOS phone, date, email and address link detection', () => {
    expect(rootMetadata.formatDetection).toStrictEqual({
      address: false,
      date: false,
      email: false,
      telephone: false,
    })
  })
})
