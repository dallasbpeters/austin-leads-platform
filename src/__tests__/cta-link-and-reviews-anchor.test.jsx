import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import ConsultationSection from '@/components/consultation-section'
import { getSectionDomId, REVIEWS_ANCHOR_ID } from '@/components/platform/public-site-utils'

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
