import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import StorySection from '@/components/story-section'

/**
 * The story section reveals its copy one word at a time, so the string is cut into
 * per-word spans. Sanity's invisible click-to-edit markers are not whitespace, so a
 * `\S+` word split scatters them across spans and some spans end up holding nothing
 * but markers. `@sanity/visual-editing` then logs "Failed to decode stega for string"
 * for every one of those fragments.
 */
const MARKERS = '\u200B\u200C\u200D\u200B\u200C\u200D'
const INVISIBLE = /[\u200B-\u200F\u2060\uFEFF]/

const block = (text) => [
  { _key: 'b1', _type: 'block', style: 'normal', children: [{ _key: 's1', _type: 'span', text }] },
]

const spansOf = (html) => [...html.matchAll(/<span[^>]*>([^<]*)<\/span>/g)].map((m) => m[1])

describe('StorySection word reveal', () => {
  it('never emits a span made only of edit markers', () => {
    const html = renderToStaticMarkup(
      createElement(StorySection, {
        section: {
          title: 'Solar is not just panels.',
          body: block(`Tree branches and shock electric bills.${MARKERS}`),
          subtitle: block(`One step at a time.${MARKERS}`),
        },
      }),
    )
    const empties = spansOf(html).filter((t) => t.length > 0 && t.replace(INVISIBLE, '') === '')
    expect(empties).toEqual([])
    expect(html).not.toContain(MARKERS)
  })

  it('still splits the copy into one span per word', () => {
    const html = renderToStaticMarkup(
      createElement(StorySection, { section: { body: block('One two three') } }),
    )
    expect(html.match(/solar-k-word/g)).toHaveLength(3)
    expect(html).toContain('three')
  })

  it('falls back to local copy when Sanity has nothing', () => {
    const html = renderToStaticMarkup(createElement(StorySection, { section: null }))
    expect(html).toContain('Tree')
    expect(INVISIBLE.test(html)).toBe(false)
  })
})
