import { describe, expect, it } from 'vitest'

import {
  brandChecks,
  collectLinks,
  imageChecks,
  isKnownPath,
  linkKind,
  seoChecks,
} from '@/lib/preflight/checks'

const doc = {
  _type: 'page',
  title: 'Austin Solar Cost Guide for Texas Homeowners',
  slug: { current: 'solar-costs' },
  seo: { description: 'Short.' },
  sections: [
    {
      _key: 'hero',
      _type: 'heroSection',
      title: 'Power your future',
      heroActions: [{ _key: 'a1', label: 'Quote', href: '/contact' }],
    },
    {
      _key: 'art',
      _type: 'articleSection',
      body: [
        {
          _key: 'b1',
          _type: 'block',
          markDefs: [{ _key: 'm1', _type: 'link', href: 'https://example.com/page' }],
          children: [
            {
              _key: 's1',
              _type: 'span',
              text: 'Claim the 30% federal tax credit with this unbeatable deal.',
            },
          ],
        },
      ],
      image: { _type: 'image', asset: { _ref: 'image-abc-10x10-png' } },
    },
  ],
}

describe(collectLinks, () => {
  it('finds link fields and rich text link annotations once each', () => {
    expect(collectLinks(doc).map((link) => link.href)).toEqual(['/contact', 'https://example.com/page'])
  })
})

describe(linkKind, () => {
  it('sorts links by how they are checked', () => {
    expect(linkKind('https://a.com')).toBe('external')
    expect(linkKind('/about')).toBe('internal')
    expect(linkKind('#consultation')).toBe('anchor')
    expect(linkKind('tel:5125550000')).toBe('contact')
    expect(linkKind('about')).toBe('invalid')
  })
})

describe(isKnownPath, () => {
  it('ignores query strings, hashes and a trailing slash', () => {
    const known = new Set(['/contact', '/'])
    expect(isKnownPath('/contact/?x=1#form', known)).toBeTruthy()
    expect(isKnownPath('/nope', known)).toBeFalsy()
  })
})

describe(seoChecks, () => {
  it('flags a short description and passes a good title', () => {
    const findings = seoChecks(doc)
    expect(findings.some((f) => f.level === 'ok' && f.message.startsWith('Search title'))).toBeTruthy()
    expect(
      findings.some((f) => f.level === 'warning' && f.message.startsWith('Search description is 6')),
    ).toBeTruthy()
  })
})

describe(imageChecks, () => {
  it('flags images with no alt text', () => {
    expect(imageChecks(doc)).toHaveLength(1)
  })
})

describe(brandChecks, () => {
  it('flags the expired tax credit and hype words', () => {
    const levels = brandChecks(doc).map((f) => f.level)
    expect(levels).toEqual(['error', 'warning'])
  })
})
