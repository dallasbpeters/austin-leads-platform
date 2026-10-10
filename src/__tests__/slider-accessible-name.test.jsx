import { JSDOM } from 'jsdom'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Slider } from '@/components/ui/slider'

/* The Radix root is a role-less <span>; ARIA forbids aria-label / aria-labelledby
 * there (axe: aria-prohibited-attr). The name must sit on each role="slider" thumb. */
const renderSlider = (props) => {
  const { document } = new JSDOM(renderToStaticMarkup(createElement(Slider, props))).window
  return {
    root: document.querySelector('[data-slot="slider"]'),
    thumbs: [...document.querySelectorAll('[role="slider"]')],
  }
}

describe('Slider accessible name', () => {
  it('puts aria-label on every thumb and never on the roleless root', () => {
    const { root, thumbs } = renderSlider({ 'aria-label': 'Monthly electric bill', defaultValue: [20, 80] })
    expect(root.hasAttribute('aria-label')).toBeFalsy()
    expect(root.hasAttribute('role')).toBeFalsy()
    expect(thumbs.map((thumb) => thumb.getAttribute('aria-label'))).toStrictEqual([
      'Monthly electric bill',
      'Monthly electric bill',
    ])
  })

  it('puts aria-labelledby on every thumb and never on the roleless root', () => {
    const { root, thumbs } = renderSlider({ 'aria-labelledby': 'bill-label', defaultValue: [40] })
    expect(root.hasAttribute('aria-labelledby')).toBeFalsy()
    expect(thumbs.map((thumb) => thumb.getAttribute('aria-labelledby'))).toStrictEqual(['bill-label'])
    expect(thumbs[0].hasAttribute('aria-label')).toBeFalsy()
  })

  it('falls back to a value label on the thumb when no name is given', () => {
    const { root, thumbs } = renderSlider({ defaultValue: [40] })
    expect(root.hasAttribute('aria-label')).toBeFalsy()
    expect(thumbs.map((thumb) => thumb.getAttribute('aria-label'))).toStrictEqual(['Value 40'])
  })
})
