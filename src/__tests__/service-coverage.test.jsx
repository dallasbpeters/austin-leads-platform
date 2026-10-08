import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ScrollTextSection } from '@/components/platform/sections/scroll-text-section'
import counties from '@/components/texasCounties.json'
import { pages } from '@/lib/platform/fixtures'
import { serviceAreaSection, serviceCityScrollSection } from '@/lib/platform/service-coverage'
import { withSectionKeys } from '@/lib/sanity/keys'

describe('service coverage content', () => {
  it('resolves every configured county to a unique geometry FIPS', () => {
    const matches = serviceAreaSection.areas.map((area) =>
      counties.counties.find((county) => county.key === area.countyKey),
    )
    expect(matches.every(Boolean)).toBeTruthy()
    expect(new Set(matches.map((county) => county.fips)).size).toBe(13)
    expect(matches.find((county) => county.key === 'dallas').fips).toBe('48113')
    expect(matches.find((county) => county.key === 'bexar').fips).toBe('48029')
  })

  it('preserves all six location references through seed normalization', () => {
    const [section] = withSectionKeys([serviceCityScrollSection])
    expect(section.linkedItems.filter((item) => item.page).map((item) => item.page._ref)).toStrictEqual([
      'locationPage-austin',
      'locationPage-round-rock',
      'locationPage-georgetown',
      'locationPage-leander',
      'locationPage-pflugerville',
      'locationPage-kyle',
    ])
    expect(section.linkedItems.every((item) => item._key && item._type === 'scrollTextItem')).toBeTruthy()
    expect(pages.find((page) => page.id === 'page-solar-home').sections).toContain(serviceAreaSection)
    expect(pages.find((page) => page.id === 'page-services').sections).toContain(serviceCityScrollSection)
  })
})

describe('rolling location links', () => {
  it('renders resolved pages as links and unresolved drafts as text, with one tab stop per link', () => {
    const html = renderToStaticMarkup(
      createElement(ScrollTextSection, {
        section: {
          ...serviceCityScrollSection,
          linkedItems: [
            { _key: 'austin', label: 'Austin', slug: 'locations/austin' },
            { _key: 'round-rock', label: 'Round Rock', slug: null },
          ],
        },
      }),
    )
    expect(html.match(/href="\/locations\/austin"/g)).toHaveLength(2)
    expect(html.match(/tabindex="-1"/g)).toHaveLength(1)
    expect(html).not.toContain('href="/locations/round-rock"')
    expect(html).toContain('Round Rock')
  })

  it('keeps legacy text and icons when no linked items are configured', () => {
    const html = renderToStaticMarkup(
      createElement(ScrollTextSection, {
        section: {
          text: ['Existing plain text'],
          showFlag: true,
          numCopies: 2,
        },
      }),
    )
    expect(html).toContain('Existing plain text')
    expect(html).not.toContain('<a ')
    expect(html).toContain('<svg')
  })
})
