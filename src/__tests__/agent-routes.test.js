import { describe, expect, it, vi } from 'vitest'

import { GET as getLightweightHtml } from '@/app/agent/html/[site]/[[...slug]]/route'
import { GET as getMarkdown } from '@/app/agent/markdown/[site]/[[...slug]]/route'
import { extractHtmlText, measureHtmlContentRatio } from '@/lib/platform/agent-content'

/*
 * The routes read the same tenant content the designed pages render. Sanity is
 * switched off here so the fixture content is exercised deterministically, and
 * `next/headers` is stubbed because the readers consult draft mode.
 */
vi.mock(import('@/sanity/client'), () => ({
  getSanityServerClient: () => null,
  hasSanityViewerToken: () => false,
  sanityAgentWriteClient: null,
  sanityClient: null,
  sanityContextClient: null,
  sanityServerClient: null,
  sanityWriteClient: null,
}))

vi.mock(import('next/headers'), () => ({
  draftMode: async () => ({ isEnabled: false }),
  headers: async () => new Headers({ host: 'texassolarandroofingpros.com' }),
}))

const SITE = 'texas-solar-and-roofing-pros'
const request = (path) => new Request(`http://localhost${path}`)
const context = (slug) => ({ params: Promise.resolve({ site: SITE, slug }) })

describe('Markdown route', () => {
  it('serves the homepage as nonempty Markdown with the right headers', async () => {
    const response = await getMarkdown(request('/agent/markdown/texas-solar-and-roofing-pros'), context([]))
    const body = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
    expect(response.headers.get('vary')).toBe('Accept')
    expect(body.startsWith('# ')).toBeTruthy()
    expect(body.length).toBeGreaterThan(500)
  })

  it('serves a public page with its canonical source and contact details', async () => {
    const response = await getMarkdown(
      request('/agent/markdown/texas-solar-and-roofing-pros/about'),
      context(['about']),
    )
    const body = await response.text()
    expect(response.status).toBe(200)
    expect(body).toContain('Source: https://texassolarandroofingpros.com/about')
    expect(body).toContain('(512) 775-0561')
    expect(body).toContain('1700 Pagedale Cove, Cedar Park, TX 78613')
    expect(response.headers.get('link')).toBe('<https://texassolarandroofingpros.com/about>; rel="canonical"')
  })

  it('returns a useful Markdown 404 with recovery links for a missing path', async () => {
    const response = await getMarkdown(
      request('/agent/markdown/texas-solar-and-roofing-pros/definitely-not-a-page'),
      context(['definitely-not-a-page']),
    )
    const body = await response.text()
    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
    expect(body.trim().length).toBeGreaterThan(20)
    expect(body).toContain('/definitely-not-a-page')
    expect(body).toContain('(https://texassolarandroofingpros.com/llms.txt)')
  })

  it('links the homepage and sitemap from the 404 and marks it noindex', async () => {
    const response = await getMarkdown(
      request('/agent/markdown/texas-solar-and-roofing-pros/nope'),
      context(['nope']),
    )
    const body = await response.text()
    expect(body).toContain('(https://texassolarandroofingpros.com/)')
    expect(body).toContain('(https://texassolarandroofingpros.com/sitemap.xml)')
    expect(response.headers.get('x-robots-tag')).toBe('noindex')
    expect(response.headers.get('vary')).toBe('Accept')
  })
})

describe('lightweight HTML route', () => {
  it('serves the homepage as a single-H1 document with real content and no hydration payload', async () => {
    const response = await getLightweightHtml(
      request('/agent/html/texas-solar-and-roofing-pros'),
      context([]),
    )
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(extractHtmlText(html).length).toBeGreaterThan(500)
    expect(html).not.toContain('self.__next_f')
  })

  it('keeps headings sequential and the content ratio above 5%', async () => {
    const response = await getLightweightHtml(
      request('/agent/html/texas-solar-and-roofing-pros'),
      context([]),
    )
    const html = await response.text()
    const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((match) => Number(match[1]))
    const jumps = levels.filter((level, index) => index > 0 && level > levels[index - 1] + 1)
    expect(levels[0]).toBe(1)
    expect(jumps).toStrictEqual([])
    expect(measureHtmlContentRatio(html)).toBeGreaterThan(0.05)
    expect(response.headers.get('vary')).toBe('Accept')
  })

  it('embeds Organization JSON-LD and the canonical link', async () => {
    const response = await getLightweightHtml(
      request('/agent/html/texas-solar-and-roofing-pros'),
      context([]),
    )
    const html = await response.text()
    const [, json] = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
    const graph = JSON.parse(json)['@graph']
    const organization = graph.find(
      (node) => Array.isArray(node['@type']) && node['@type'].includes('Organization'),
    )
    expect(organization.telephone).toBe('(512) 775-0561')
    expect(organization.address.postalCode).toBe('78613')
    expect(html).toContain('<link rel="canonical" href="https://texassolarandroofingpros.com/">')
  })

  it('returns an HTML 404 with recovery links for a missing path', async () => {
    const response = await getLightweightHtml(
      request('/agent/html/texas-solar-and-roofing-pros/nope'),
      context(['nope']),
    )
    const html = await response.text()
    expect(response.status).toBe(404)
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).toContain('href="https://texassolarandroofingpros.com/llms.txt"')
    expect(html).toContain('href="https://texassolarandroofingpros.com/sitemap.xml"')
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
  })
})
