import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import GlassCard, { glassCardDesign } from '@/components/glass-card'
import Testimonials from '@/components/testimonials'

const review = { _id: 'r1', author: 'Pat', body: 'Great crew, clean install.', stars: 5 }

describe(glassCardDesign, () => {
  it('leaves a card with no design exactly like the hero cards', () => {
    expect(glassCardDesign({ title: 'Plain' })).toStrictEqual({ style: {}, className: '' })
  })

  it('uses dark text on a light background color', () => {
    const design = glassCardDesign({ backgroundColor: '#ffd06b' })
    expect(design.style['--glass-bg']).toBe('#ffd06b')
    expect(design.className).toContain('solar-hero__glass--light')
  })

  it('keeps light text on a dark background color, opacity included', () => {
    expect(glassCardDesign({ backgroundColor: 'rgba(8, 47, 67, 0.6)' }).className).not.toContain('--light')
  })

  it('makes the eyebrow follow the contrast text color when only a background is picked', () => {
    expect(glassCardDesign({ backgroundColor: '#de1017' }).style['--glass-eyebrow']).toBe('currentcolor')
  })

  it('sets the eyebrow color and turns the frost off', () => {
    const design = glassCardDesign({ eyebrowColor: '#de1017', frosted: false })
    expect(design.style['--glass-eyebrow']).toBe('#de1017')
    expect(design.className).toContain('solar-hero__glass--flat')
  })
})

describe('glass banner above the reviews', () => {
  const banner = {
    title: 'Rated 5.0 on Google',
    eyebrow: 'Solar reviews',
    href: '#reviews',
    linkLabel: 'Read reviews',
  }

  it('renders above the reviews when it has a title', () => {
    const html = renderToStaticMarkup(
      <Testimonials section={{ title: 'Reviews', glassBanner: banner }} reviews={[review]} />,
    )
    expect(html).toContain('testimonials__banner')
    expect(html).toContain('Rated 5.0 on Google')
    expect(html.indexOf('testimonials__banner')).toBeLessThan(html.indexOf('testimonials__inner'))
  })

  it('stays hidden without a title', () => {
    const html = renderToStaticMarkup(
      <Testimonials section={{ title: 'Reviews', glassBanner: { eyebrow: 'Draft' } }} reviews={[review]} />,
    )
    expect(html).not.toContain('testimonials__banner')
  })

  it('still shows when there are no reviews', () => {
    const html = renderToStaticMarkup(<Testimonials section={{ title: 'Reviews', glassBanner: banner }} />)
    expect(html).toContain('Rated 5.0 on Google')
    expect(html).toContain('id="reviews"')
  })

  it('renders a hero card the same as before', () => {
    const html = renderToStaticMarkup(<GlassCard card={{ title: 'Detach & Reset', href: '/detach-reset' }} />)
    expect(html).toContain('class="solar-hero__glass"')
    expect(html).toContain('href="/detach-reset"')
  })
})
