import { describe, expect, it } from 'vitest'

import {
  defaultCaption,
  makeScene,
  SCENE_TYPES,
  sceneSummary,
  sceneTypeOf,
  sceneTypesFor,
  STARTER_SCENES,
} from '@/lib/reels/scenes'
import { DEFAULT_THEME, themeHasScene, themeId, themeOf, themeProject, THEMES } from '@/lib/reels/themes'

describe('theme registry', () => {
  it('defaults to christmas, which is what the database column writes', () => {
    // reel-db.js spells 'christmas' out in DDL, because Postgres takes no
    // parameter there. This assertion is what stops the two from drifting.
    expect(DEFAULT_THEME).toBe('christmas')
    expect(themeOf(undefined).id).toBe('christmas')
    expect(themeOf(null).id).toBe('christmas')
    expect(themeId('nonsense')).toBe('christmas')
  })

  it('resolves each theme to its own composition project', () => {
    expect(themeProject('christmas')).toBe('christmas-reels')
    expect(themeProject('brand')).toBe('brand-reels')
    expect(themeProject('nonsense')).toBe('christmas-reels')
  })

  it('gives every theme a distinct project, preview path and download name', () => {
    const unique = (key) => new Set(THEMES.map((theme) => theme[key])).size
    expect(unique('id')).toBe(THEMES.length)
    expect(unique('project')).toBe(THEMES.length)
    expect(unique('previewUrl')).toBe(THEMES.length)
    expect(unique('downloadName')).toBe(THEMES.length)
  })

  it('only claims scene types the shared vocabulary actually defines', () => {
    const known = new Set(SCENE_TYPES.map((entry) => entry.type))
    for (const theme of THEMES) {
      expect(theme.sceneTypes.length).toBeGreaterThan(0)
      expect(theme.sceneTypes.every((type) => known.has(type))).toBe(true)
    }
  })

  it('keeps the drawn-house scene out of the brand theme', () => {
    expect(themeHasScene('christmas', 'lights')).toBe(true)
    expect(themeHasScene('brand', 'lights')).toBe(false)
  })
})

describe('theme-aware scene vocabulary', () => {
  it('offers only the scene types the chosen theme can draw', () => {
    expect(sceneTypesFor('christmas').map((entry) => entry.type)).toEqual([
      'photo',
      'offer',
      'text',
      'signoff',
      'lights',
    ])
    expect(sceneTypesFor('brand').map((entry) => entry.type)).toEqual(['photo', 'offer', 'text', 'signoff'])
  })

  it('leaves the christmas wording exactly as it was', () => {
    expect(makeScene('photo', 'christmas')).toMatchObject({
      type: 'photo',
      headline: 'Your house. Lit.',
    })
    expect(makeScene('offer', 'christmas')).toMatchObject({ price: '$300' })
    // No theme argument at all behaves like the christmas theme.
    expect(makeScene('offer')).toMatchObject({ price: '$300' })
  })

  it('dresses the brand theme in its own words and durations', () => {
    expect(makeScene('photo', 'brand')).toMatchObject({
      type: 'photo',
      headline: 'What solar costs here',
      duration: 5,
    })
    expect(makeScene('offer', 'brand')).toMatchObject({ price: '$15,000-$30,000' })
    expect(makeScene('signoff', 'brand')).toMatchObject({ sub: '512-400-3763' })
  })

  it('falls back to the first available type when a theme cannot draw the asked-for one', () => {
    expect(makeScene('lights', 'brand').type).toBe('photo')
    expect(sceneTypeOf({ type: 'lights' }, 'brand').type).toBe('photo')
  })

  it('starts each theme with a photo, a price and a sign-off it can draw', () => {
    for (const theme of THEMES) {
      const scenes = STARTER_SCENES(theme.id)
      expect(scenes.map((scene) => scene.type)).toEqual(['photo', 'offer', 'signoff'])
      expect(scenes.every((scene) => themeHasScene(theme.id, scene.type))).toBe(true)
    }
  })

  it('labels a scene in the theme that owns it', () => {
    expect(sceneSummary({ type: 'offer', price: '$300' }, 'christmas')).toBe('$300')
    expect(sceneSummary({ type: 'offer' }, 'brand')).toBe('Price card')
  })
})

describe('captions per theme', () => {
  const scenes = [
    { type: 'photo', headline: 'Roof first', sub: 'Panels back after' },
    { type: 'offer', headline: 'A reroof runs', price: '$12,000' },
    { type: 'signoff', sub: '512-400-3763' },
  ]

  it('tags a christmas reel the way it always did', () => {
    const caption = defaultCaption(scenes, 'christmas')
    expect(caption).toContain('#ChristmasLights')
    expect(defaultCaption(scenes)).toBe(caption)
  })

  it('tags a brand reel for the service, not the season', () => {
    const caption = defaultCaption(scenes, 'brand')
    expect(caption).toContain('#TexasRoofing')
    expect(caption).not.toContain('#ChristmasLights')
  })
})

describe('brand theme content rules', () => {
  const words = () =>
    sceneTypesFor('brand')
      .flatMap((entry) => [
        ...Object.values(entry.defaults || {}),
        ...entry.fields.map((field) => field.placeholder),
        entry.hint,
        entry.label,
      ])
      .filter((value) => typeof value === 'string')
      .join(' ')
      .toLowerCase()

  it('never mentions the federal tax credit, which expired 31 Dec 2025', () => {
    expect(words()).not.toMatch(/tax credit|federal credit|30%|itc\b/)
  })

  it('uses no hype words', () => {
    expect(words()).not.toMatch(/revolutionary|unbeatable|limited.time|guaranteed savings|best price/)
  })

  it('invites contact the way the brand guide asks', () => {
    expect(words()).toMatch(/free estimate/)
    expect(words()).toMatch(/no pressure/)
  })
})
