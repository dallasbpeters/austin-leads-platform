import { describe, expect, it } from 'vitest'

import {
  buildNotFoundOutline,
  buildPageOutline,
  escapeMarkdown,
  extractHtmlText,
  isBrowserNavigation,
  isNextRouterRequest,
  measureHtmlContentRatio,
  parseAcceptHeader,
  prefersMarkdown,
  renderOutlineHtml,
  renderOutlineMarkdown,
  resolvePublicRepresentation,
} from '@/lib/platform/agent-content'

const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

/* Built from parts so the lint rule against script URLs in source does not fire. */
const UNSAFE_SCHEME_URL = `${['java', 'script'].join('')}:alert(1)`

const headersOf = (map) => (name) => map[name.toLowerCase()] ?? null

const site = {
  name: 'Texas Solar and Roofing Pros',
  primaryDomain: 'texassolarandroofingpros.com',
  seo: { description: 'Site description.' },
}

const identity = {
  name: 'Texas Solar and Roofing Pros',
  phone: '(512) 775-0561',
  email: 'info@texassolarandroofingpros.com',
  serviceArea: ['Austin, Texas', 'Cedar Park, Texas'],
  address: {
    streetAddress: '1700 Pagedale Cove',
    addressLocality: 'Cedar Park',
    addressRegion: 'TX',
    postalCode: '78613',
    addressCountry: 'US',
  },
}

const page = {
  title: 'About',
  description: 'Who we are.',
  sections: [
    {
      type: 'hero',
      title: 'Straight answers about roofs and solar.',
      body: 'We help you decide.',
      metrics: [{ label: 'Focus', value: 'Texas homeowners' }],
      actions: [{ label: 'See services', href: '/services' }],
    },
    { type: 'band' },
    {
      type: 'story',
      title: 'How we think',
      body: 'First paragraph.\n\nSecond paragraph.',
    },
    {
      type: 'faq',
      title: 'Questions',
      items: [{ question: 'Is it free?', answer: 'Yes.' }],
    },
    { type: 'steps', title: 'Steps', items: [{ title: 'Call', body: 'Pick up the phone.' }] },
    { type: 'quote', title: 'Our mission', body: 'Honest first.' },
    {
      type: 'cta',
      title: 'Talk with us',
      body: 'No pressure.',
      ctaLabel: 'Get a free estimate',
      ctaHref: '#consultation',
    },
  ],
}

describe('Accept negotiation', () => {
  it('parses media ranges with quality values', () => {
    expect(parseAcceptHeader('text/markdown;q=0.9, text/html')).toStrictEqual([
      { type: 'text', subtype: 'markdown', q: 0.9, index: 0 },
      { type: 'text', subtype: 'html', q: 1, index: 1 },
    ])
  })

  it('prefers Markdown only when text/markdown is explicit and wins', () => {
    expect(prefersMarkdown('text/markdown')).toBeTruthy()
    expect(prefersMarkdown('text/markdown, text/html;q=0.8')).toBeTruthy()
    expect(prefersMarkdown('text/markdown, text/html')).toBeTruthy()
    expect(prefersMarkdown('text/html, text/markdown;q=0.5')).toBeFalsy()
    expect(prefersMarkdown('text/markdown;q=0')).toBeFalsy()
  })

  it('never treats wildcards or browser headers as a Markdown preference', () => {
    expect(prefersMarkdown('*/*')).toBeFalsy()
    expect(prefersMarkdown('text/*')).toBeFalsy()
    expect(prefersMarkdown(BROWSER_ACCEPT)).toBeFalsy()
    expect(prefersMarkdown('')).toBeFalsy()
    expect(prefersMarkdown(null)).toBeFalsy()
  })

  it('recognises browser navigations by Sec-Fetch headers or a Mozilla user agent', () => {
    expect(isBrowserNavigation(headersOf({ 'sec-fetch-mode': 'navigate' }))).toBeTruthy()
    expect(isBrowserNavigation(headersOf({ 'sec-fetch-dest': 'iframe' }))).toBeTruthy()
    expect(isBrowserNavigation(headersOf({ 'user-agent': CHROME_UA, accept: BROWSER_ACCEPT }))).toBeTruthy()
    expect(isBrowserNavigation(headersOf({ 'user-agent': 'curl/8.4.0', accept: 'text/html' }))).toBeFalsy()
    expect(
      isBrowserNavigation(headersOf({ 'user-agent': CHROME_UA, accept: 'application/json' })),
    ).toBeFalsy()
  })

  it('routes each client to the right representation', () => {
    expect(
      resolvePublicRepresentation({ method: 'GET', getHeader: headersOf({ accept: 'text/markdown' }) }),
    ).toBe('markdown')
    expect(
      resolvePublicRepresentation({
        method: 'GET',
        getHeader: headersOf({
          'user-agent': CHROME_UA,
          accept: BROWSER_ACCEPT,
          'sec-fetch-mode': 'navigate',
        }),
      }),
    ).toBe('page')
    expect(
      resolvePublicRepresentation({
        method: 'GET',
        getHeader: headersOf({ 'user-agent': 'curl/8.4.0', accept: 'text/html' }),
      }),
    ).toBe('lightweight-html')
    expect(
      resolvePublicRepresentation({
        method: 'GET',
        getHeader: headersOf({ accept: 'text/x-component', rsc: '1' }),
      }),
    ).toBe('page')
    expect(
      resolvePublicRepresentation({ method: 'POST', getHeader: headersOf({ accept: 'text/markdown' }) }),
    ).toBe('page')
  })

  it('keeps Next.js router fetches on the designed page as the proxy sees them', () => {
    /* Next.js strips `rsc` / `next-router-*` before the proxy runs; `next-url` survives. */
    const routerFetch = {
      'user-agent': CHROME_UA,
      accept: '*/*',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'sec-fetch-site': 'same-origin',
    }
    expect(isNextRouterRequest(headersOf({ ...routerFetch, 'next-url': '/' }))).toBeTruthy()
    expect(isNextRouterRequest(headersOf(routerFetch))).toBeFalsy()
    expect(
      resolvePublicRepresentation({
        method: 'GET',
        getHeader: headersOf({ ...routerFetch, 'next-url': '/' }),
      }),
    ).toBe('page')
    expect(
      resolvePublicRepresentation({
        method: 'GET',
        getHeader: headersOf({
          ...routerFetch,
          'next-url': '/about',
          'next-router-segment-prefetch': '/_tree',
        }),
      }),
    ).toBe('page')
    expect(resolvePublicRepresentation({ method: 'GET', getHeader: headersOf(routerFetch) })).toBe(
      'lightweight-html',
    )
  })
})

describe('page outline', () => {
  const outline = buildPageOutline({
    site,
    page,
    pathname: '/about',
    navigation: [
      { label: 'Solar', href: '/solar' },
      { label: 'Contact', href: '#consultation' },
    ],
    identity,
    canonicalUrl: 'https://texassolarandroofingpros.com/about',
  })

  it('uses the hero title as the single H1 and skips decorative sections', () => {
    expect(outline.h1).toBe('Straight answers about roofs and solar.')
    expect(outline.title).toBe('About')
    const headings = outline.blocks.filter((block) => block.type === 'heading').map((block) => block.text)
    expect(headings).toStrictEqual([
      'How we think',
      'Questions',
      'Steps',
      'Our mission',
      'Talk with us',
      'Contact Texas Solar and Roofing Pros',
      'Machine-readable resources',
    ])
    expect(headings.every((text) => text !== 'band')).toBeTruthy()
  })

  it('splits body copy into paragraphs and maps anchors to the contact page', () => {
    const paragraphs = outline.blocks.filter((block) => block.type === 'paragraph').map((block) => block.text)
    expect(paragraphs).toContain('First paragraph.')
    expect(paragraphs).toContain('Second paragraph.')
    const cta = outline.blocks.find(
      (block) => block.type === 'list' && block.items[0]?.text === 'Get a free estimate',
    )
    expect(cta.items[0].href).toBe('/contact')
    expect(outline.navigation).toStrictEqual([
      { label: 'Solar', href: '/solar' },
      { label: 'Contact', href: '/contact' },
    ])
  })

  it('renders Markdown with the contact block, resources, and ordered steps', () => {
    const markdown = renderOutlineMarkdown(outline, { origin: 'https://texassolarandroofingpros.com' })
    expect(markdown.startsWith('# Straight answers about roofs and solar.\n')).toBeTruthy()
    expect(markdown).toContain('1. **Call** — Pick up the phone.')
    expect(markdown).toContain('**Is it free?**\n\nYes.')
    expect(markdown).toContain('1700 Pagedale Cove, Cedar Park, TX 78613')
    expect(markdown).toContain('(https://texassolarandroofingpros.com/llms.txt)')
  })

  it('renders lightweight HTML with one H1, sequential headings, and a high content ratio', () => {
    const html = renderOutlineHtml(outline, {
      origin: 'https://texassolarandroofingpros.com',
      jsonLd: { '@context': 'https://schema.org', '@type': 'Organization' },
      meta: { ogImage: 'https://texassolarandroofingpros.com/og.png', robots: 'index, follow' },
    })
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html.match(/<h3[\s>]/g)).toBeNull()
    expect(html).not.toContain('self.__next_f')
    expect(html).toContain('<script type="application/ld+json">')
    expect(measureHtmlContentRatio(html)).toBeGreaterThan(0.05)
  })
})

describe('escaping', () => {
  const hostile = {
    title: 'Safe <script>alert(1)</script> [link](https://evil.example) # not a heading',
    sections: [
      { type: 'story', title: '<img src=x onerror=alert(1)>', body: '* not a list\n\n> not a quote' },
    ],
  }

  it('neutralises HTML and Markdown syntax in Markdown output', () => {
    const outline = buildPageOutline({ site, page: hostile, pathname: '/x' })
    const markdown = renderOutlineMarkdown(outline)
    expect(markdown).not.toContain('<script>')
    expect(markdown).toContain('&lt;script&gt;')
    expect(markdown).toContain('\\[link\\]')
    expect(markdown).toContain('\\* not a list')
    expect(escapeMarkdown('# heading')).toBe('\\# heading')
  })

  it('escapes every attribute and text node in lightweight HTML', () => {
    const outline = buildPageOutline({ site, page: hostile, pathname: '/x' })
    const html = renderOutlineHtml(outline, { origin: 'https://texassolarandroofingpros.com' })
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<script>alert')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(extractHtmlText(html)).toContain('Safe &lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('drops unsafe hrefs instead of rendering them', () => {
    const outline = buildPageOutline({
      site,
      page: {
        title: 'T',
        sections: [
          {
            type: 'highlights',
            title: 'Links',
            items: [{ title: 'Bad', body: 'x', href: UNSAFE_SCHEME_URL }],
          },
        ],
      },
      pathname: '/t',
    })
    const html = renderOutlineHtml(outline)
    expect(html).not.toContain(UNSAFE_SCHEME_URL)
    expect(renderOutlineMarkdown(outline)).not.toContain(UNSAFE_SCHEME_URL)
  })
})

describe('not-found outline', () => {
  const outline = buildNotFoundOutline(site, '/missing-page', identity)

  it('explains the miss and links the homepage, llms.txt, and sitemap in Markdown', () => {
    const markdown = renderOutlineMarkdown(outline, { origin: 'https://texassolarandroofingpros.com' })
    expect(markdown.replaceAll(/\s+/g, ' ').length).toBeGreaterThan(20)
    expect(markdown).toContain('/missing-page')
    expect(markdown).toContain('(https://texassolarandroofingpros.com/)')
    expect(markdown).toContain('(https://texassolarandroofingpros.com/llms.txt)')
    expect(markdown).toContain('(https://texassolarandroofingpros.com/sitemap.xml)')
  })

  it('renders the same recovery links in lightweight HTML with a single H1', () => {
    const html = renderOutlineHtml(outline, {
      origin: 'https://texassolarandroofingpros.com',
      meta: { robots: 'noindex, nofollow' },
    })
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).toContain('href="https://texassolarandroofingpros.com/llms.txt"')
    expect(html).toContain('href="https://texassolarandroofingpros.com/sitemap.xml"')
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
  })
})
