import { describe, expect, it } from 'vitest'

import {
  brandChecks,
  collectLinks,
  imageChecks,
  isKnownPath,
  linkKind,
  seoChecks,
  slugify,
  suggestHref,
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

describe(slugify, () => {
  it('turns a title into a web address', () => {
    expect(slugify('Solar in Round Rock, Texas!')).toBe('solar-in-round-rock-texas')
    expect(slugify('Café & Roof')).toBe('cafe-roof')
  })
})

describe(suggestHref, () => {
  const known = new Set(['/locations/round-rock', '/guides/how-solar-works-texas', '/contact'])

  it('adds https:// to a bare web address', () => {
    expect(suggestHref('www.austinenergy.com', known)).toBe('https://www.austinenergy.com')
  })

  it('adds the leading slash to a page path', () => {
    expect(suggestHref('contact', known)).toBe('/contact')
  })

  it('matches a missing page to the closest real one', () => {
    expect(suggestHref('/locations/roundrock', known)).toBe('/locations/round-rock')
    expect(suggestHref('/how-solar-works-texas', known)).toBe('/guides/how-solar-works-texas')
  })

  it('gives up when nothing is close', () => {
    expect(suggestHref('/totally-different-page-name-here', known)).toBeNull()
  })
})

describe('seoChecks fixes', () => {
  it('offers to turn off "No index" and to type a search title', () => {
    const findings = seoChecks({ _type: 'page', title: 'Hi', slug: { current: 'x' }, seo: { noIndex: true } })
    expect(findings.find((finding) => finding.path?.join('.') === 'seo.noIndex')?.fix).toMatchObject({
      type: 'set',
      value: false,
    })
    expect(findings.find((finding) => finding.path?.join('.') === 'seo.title')?.fix).toMatchObject({
      type: 'text',
      min: 30,
      max: 60,
    })
  })

  it('suggests a slug from the title', () => {
    const findings = seoChecks({ _type: 'page', title: 'Solar in Kyle' })
    expect(findings.find((finding) => finding.path?.[0] === 'slug')?.fix?.value).toStrictEqual({
      _type: 'slug',
      current: 'solar-in-kyle',
    })
  })
})

describe('imageChecks logos', () => {
  const logo = { _type: 'image', asset: { _ref: 'image-abc-204x63-svg' } }

  it('does not flag a logo on a card with a title, which the site names itself', () => {
    const findings = imageChecks({
      sections: [{ _key: 's', items: [{ _key: 'i', title: 'Birdcreek', logo }] }],
    })
    expect(findings).toStrictEqual([])
  })

  it('still flags a logo with no title to name it from', () => {
    const findings = imageChecks({ sections: [{ _key: 's', items: [{ _key: 'i', logo }] }] })
    expect(findings).toHaveLength(1)
  })
})

describe('seoChecks main heading', () => {
  const base = { _type: 'page', title: 'Detach and reset for solar roofs', slug: { current: 'detach-reset' } }
  const h1Warning = (findings) => findings.some((finding) => /main heading/u.test(finding.message))

  it('counts a process section that opens the page as its main heading', () => {
    expect(
      h1Warning(
        seoChecks({
          ...base,
          sections: [{ _key: 'p', _type: 'installProcessSection', title: 'How it works' }],
        }),
      ),
    ).toBeFalsy()
  })

  it('counts an article that opens the page, like the privacy policy', () => {
    expect(
      h1Warning(
        seoChecks({ ...base, sections: [{ _key: 'a', _type: 'articleSection', title: 'Privacy Policy' }] }),
      ),
    ).toBeFalsy()
  })

  it('still warns when the page opens with a section that has no main heading', () => {
    expect(
      h1Warning(seoChecks({ ...base, sections: [{ _key: 'f', _type: 'faqSection', title: 'Questions' }] })),
    ).toBeTruthy()
  })
})
