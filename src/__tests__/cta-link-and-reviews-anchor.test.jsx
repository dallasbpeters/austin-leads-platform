import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import ConsultationSection from '@/components/consultation-section'
import {
  CALCULATOR_ANCHOR_ID,
  getSectionDomId,
  resolveSectionAnchor,
  REVIEWS_ANCHOR_ID,
} from '@/components/platform/public-site-utils'

const ctaSection = (extra) => ({
  type: 'cta',
  title: 'Ready when you are',
  ctaLabel: 'Get a free quote',
  cloudVisibility: 'hide',
  ...extra,
})

describe('CTA section button', () => {
  it('links to the picked page when the form is "Link to a page"', () => {
    const html = renderToStaticMarkup(
      <ConsultationSection section={ctaSection({ ctaForm: 'link', ctaHref: '/get-a-free-quote' })} />,
    )
    expect(html).toContain('href="/get-a-free-quote"')
    expect(html).toContain('Get a free quote')
  })

  it('falls back to the Jobber form when no link is picked', () => {
    const html = renderToStaticMarkup(<ConsultationSection section={ctaSection({ ctaForm: 'link' })} />)
    expect(html).not.toContain('href="/get-a-free-quote"')
    expect(html).toContain('consult__button')
  })

  it('ignores a leftover link when another form is picked', () => {
    const html = renderToStaticMarkup(
      <ConsultationSection section={ctaSection({ ctaForm: 'jobber', ctaHref: '/get-a-free-quote' })} />,
    )
    expect(html).not.toContain('href="/get-a-free-quote"')
  })
})

describe('Google Reviews section id', () => {
  it('is always "reviews", whatever the title', () => {
    expect(REVIEWS_ANCHOR_ID).toBe('reviews')
    expect(getSectionDomId({ type: 'testimonials', title: 'What our customers say' }, 3)).toBe('reviews')
  })

  it('still lets an explicit anchor win', () => {
    expect(getSectionDomId({ type: 'testimonials', anchor: 'happy-customers' }, 0)).toBe('happy-customers')
  })

  it('leaves other sections alone', () => {
    expect(getSectionDomId({ type: 'faq', title: 'Questions' }, 0)).toBe('faq-questions')
  })
})

describe('Calculator section id', () => {
  it('is always "calculator", whatever the title', () => {
    expect(CALCULATOR_ANCHOR_ID).toBe('calculator')
    expect(getSectionDomId({ type: 'calculator', title: 'See what solar could save' }, 2)).toBe('calculator')
  })
})

describe(resolveSectionAnchor, () => {
  const pageIds = ['hero-1', 'tabbedPanel-about-us', 'reviews', 'calculator', 'faq-questions']

  it('keeps an id that is on the page', () => {
    expect(resolveSectionAnchor('faq-questions', pageIds)).toBe('faq-questions')
  })

  it('sends an old title-based id to the fixed id of its section type', () => {
    expect(resolveSectionAnchor('testimonials-what-customers-are-saying-about', pageIds)).toBe('reviews')
    expect(resolveSectionAnchor('calculator-see-what-solar-could-save', pageIds)).toBe('calculator')
  })

  it('sends a renamed section to the section of the same type', () => {
    expect(resolveSectionAnchor('faq-common-questions', pageIds)).toBe('faq-questions')
  })

  it('returns null when the page has no section of that type', () => {
    expect(resolveSectionAnchor('calculator-see-what-solar-could-save', ['hero-1', 'reviews'])).toBeNull()
  })
})
