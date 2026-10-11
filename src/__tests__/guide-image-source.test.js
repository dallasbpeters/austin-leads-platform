import { describe, expect, it } from 'vitest'

import {
  HOW_SOLAR_WORKS_IMAGE,
  SOLAR_COSTS_IMAGE,
  getFeaturedSolarGuideCards,
  getSolarGuideGridItems,
  getSolarGuidePages,
  solarGuides,
} from '@/lib/platform/guides'
import { getHeroImageUrl, getImageAlt, getImageUrl, hasImageSource } from '@/lib/platform/imageSource'

/**
 * The two solar guide images used to live on a Supabase storage project that has
 * since been deleted. They now live in Sanity as uploaded image assets. These
 * tests pin the fixture data and the image-source helpers so a reseed or a
 * refactor can never quietly point the guides back at the dead host.
 */
const DELETED_SUPABASE_HOST = 'hoirqrkdgbmvpwutwuwj.supabase.co'
const RECOVERED_GUIDE_SLUGS = new Set([
  'guides/how-solar-works-texas',
  'guides/solar-costs-and-payback-texas',
])
const SANITY_CDN = /^https:\/\/cdn\.sanity\.io\/images\/[a-z0-9]+\/[a-z0-9-]+\/[0-9a-f]{40}-1360x1024\.png$/

describe('guide fixture images', () => {
  it('never reference the deleted Supabase host', () => {
    expect(JSON.stringify(solarGuides)).not.toContain(DELETED_SUPABASE_HOST)
    expect(JSON.stringify(getSolarGuidePages())).not.toContain(DELETED_SUPABASE_HOST)
    expect(JSON.stringify(getSolarGuideGridItems())).not.toContain(DELETED_SUPABASE_HOST)
    expect(JSON.stringify(getFeaturedSolarGuideCards())).not.toContain(DELETED_SUPABASE_HOST)
  })

  it('point both recovered guides at Sanity image assets', () => {
    for (const image of [HOW_SOLAR_WORKS_IMAGE, SOLAR_COSTS_IMAGE]) {
      expect(image.url).toMatch(SANITY_CDN)
      expect(image.assetId).toMatch(/^image-[0-9a-f]{40}-1360x1024-png$/)
    }
    expect(HOW_SOLAR_WORKS_IMAGE.assetId).not.toBe(SOLAR_COSTS_IMAGE.assetId)
  })

  it('give each recovered guide hero a Sanity asset and a matching URL fallback', () => {
    const heroes = getSolarGuidePages()
      .filter((page) => RECOVERED_GUIDE_SLUGS.has(page.slug))
      .map((page) => page.sections.find((section) => section.type === 'hero'))
    expect(heroes).toHaveLength(2)
    for (const hero of heroes) {
      expect(hero.heroAsset.asset._ref).toMatch(/^image-[0-9a-f]{40}-1360x1024-png$/)
      expect(hero.heroImage.urls.regular).toMatch(SANITY_CDN)
      expect(hero.heroAsset.altText).toBe(hero.heroImage.alt)
      expect(hero.heroImage.alt).toBeTruthy()
      expect(hero.heroImage.description).toBeTruthy()
    }
  })

  it('give each recovered guide card the same asset as its hero', () => {
    const items = getSolarGuideGridItems().filter((item) => RECOVERED_GUIDE_SLUGS.has(item.href.slice(1)))
    const pages = getSolarGuidePages()
    expect(items).toHaveLength(2)
    for (const item of items) {
      const page = pages.find((candidate) => `/${candidate.slug}` === item.href)
      const hero = page.sections.find((section) => section.type === 'hero')
      expect(item.imageAsset.asset._ref).toBe(hero.heroAsset.asset._ref)
      expect(item.image.urls.regular).toBe(hero.heroImage.urls.regular)
    }
  })
})

describe('image source resolution', () => {
  const heroImage = solarGuides[0].sections[0].heroImage
  const heroAsset = solarGuides[0].sections[0].heroAsset

  it('prefers the Sanity asset when the reference is present', () => {
    const url = getHeroImageUrl(heroAsset, heroImage, { width: 800 })
    expect(url).toContain('cdn.sanity.io/images/')
    expect(url).toContain('32e04704af401cd29a2444f7fe31dcddaa64598b-1360x1024.png')
    expect(url).not.toContain(DELETED_SUPABASE_HOST)
    expect(hasImageSource(heroAsset, heroImage)).toBeTruthy()
  })

  it('falls back to the stored URL when the asset reference is missing', () => {
    expect(getHeroImageUrl(null, heroImage)).toBe(heroImage.urls.full)
    expect(getImageUrl(undefined, heroImage)).toBe(heroImage.urls.full)
    expect(hasImageSource(null, heroImage)).toBeTruthy()
  })

  it('returns nothing when neither source exists', () => {
    expect(getHeroImageUrl(null, null)).toBe('')
    expect(hasImageSource(null, null)).toBeFalsy()
  })

  it('keeps the alt text from the asset, then the stored image, then the fallback', () => {
    expect(getImageAlt(heroAsset, heroImage)).toBe(heroImage.alt)
    expect(getImageAlt(null, heroImage)).toBe(heroImage.alt)
    expect(getImageAlt(null, null, 'Guide')).toBe('Guide')
  })
})
