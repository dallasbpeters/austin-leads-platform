import { describe, expect, it } from 'vitest'

import { getHeroTextValues } from '@/components/hero'
import { isColorField } from '@/sanity/components/compact-color-input'
import { initialValueOf, isPageSection } from '@/sanity/components/section-type-switcher'

describe(getHeroTextValues, () => {
  it('follows the time of day on a cloud hero with no text color', () => {
    expect(getHeroTextValues({}, false, 'clouds').heroTextColor).toBe('var(--cloud-hero-text)')
  })

  it('uses the Sanity text color on a cloud hero when one is set', () => {
    const values = getHeroTextValues({ heroTextColor: '#123456' }, false, 'clouds')
    expect(values.heroTextColor).toBe('#123456')
    expect(values.softTextColor).toMatch(/^rgba\(18, 52, 86, 0\.78\)$/u)
  })

  it('uses white over a photo when no text color is set', () => {
    expect(getHeroTextValues({}, true, 'image').heroTextColor).toBe('#ffffff')
  })
})

describe(isPageSection, () => {
  const object = { jsonType: 'object' }

  it('is true for one section in the sections list', () => {
    expect(isPageSection({ path: ['sections', { _key: 'a' }], schemaType: object })).toBeTruthy()
  })

  it('is false for an item nested inside a section, or a non-object', () => {
    expect(
      isPageSection({ path: ['sections', { _key: 'a' }, 'items', { _key: 'b' }], schemaType: object }),
    ).toBeFalsy()
    expect(
      isPageSection({ path: ['sections', { _key: 'a' }], schemaType: { jsonType: 'string' } }),
    ).toBeFalsy()
  })
})

describe(initialValueOf, () => {
  it('reads an object or a function initial value', () => {
    expect(initialValueOf({ initialValue: { layout: 'introLeft' } })).toStrictEqual({ layout: 'introLeft' })
    expect(initialValueOf({ initialValue: () => ({ type: 'faq' }) })).toStrictEqual({ type: 'faq' })
  })

  it('skips one that throws or is async', () => {
    expect(
      initialValueOf({
        initialValue: () => {
          throw new Error('no')
        },
      }),
    ).toStrictEqual({})
    expect(initialValueOf({ initialValue: async () => ({ type: 'faq' }) })).toStrictEqual({})
  })
})

describe(isColorField, () => {
  it('matches the color object type and types built on it', () => {
    const color = { name: 'color', jsonType: 'object' }
    expect(isColorField({ schemaType: color })).toBeTruthy()
    expect(isColorField({ schemaType: { name: 'brandColor', jsonType: 'object', type: color } })).toBeTruthy()
  })

  it('does not match a string field named color', () => {
    expect(isColorField({ schemaType: { name: 'color', jsonType: 'string' } })).toBeFalsy()
  })
})
