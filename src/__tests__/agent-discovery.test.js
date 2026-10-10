import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import { GET as getRobots } from '@/app/robots.txt/route'
import { getSiteBySlug, getSitemapEntriesForSite } from '@/lib/platform/content'
import { pages } from '@/lib/platform/fixtures'

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
const readPublic = (name) => readFileSync(resolve(process.cwd(), 'public', name), 'utf8')
const findPage = (slug) => pages.find((page) => page.siteSlug === SITE && page.slug === slug)
const textOf = (page) =>
  JSON.stringify(page.sections, (key, value) =>
    ['heroImage', 'image', 'urls', 'alt', 'variant', 'href'].includes(key) ? undefined : value,
  )

describe('llms.txt guidance', () => {
  const llms = readPublic('llms.txt')

  it('tells agents when to use the site and what jobs it completes', () => {
    expect(llms).toContain('## When to use this site')
    expect(llms).toContain('Concrete jobs this site can complete for an agent')
    expect(llms).toContain('Do not use this site for')
    expect(llms).toContain('(512) 775-0561')
  })

  it('explains Markdown negotiation and the request contract', () => {
    expect(llms).toContain('## How to request pages')
    expect(llms).toContain('Accept: text/markdown')
    expect(llms).toContain('text/markdown; charset=utf-8')
    expect(llms).toContain('Vary: Accept')
    expect(llms).toContain('HTTP 404')
  })

  it('links the agent and developer resources and the contact page', () => {
    expect(llms).toContain('https://texassolarandroofingpros.com/developers')
    expect(llms).toContain('https://texassolarandroofingpros.com/contact')
    expect(llms).toContain('https://texassolarandroofingpros.com/sitemap.xml')
    expect(llms).toContain('https://texassolarandroofingpros.com/ai.txt')
    expect(llms).toContain('no public API, SDK, or MCP server')
  })

  it('still carries the incentive facts and never promotes the expired federal credit', () => {
    expect(llms).toContain('expired on December 31,\n  2025')
    expect(llms).toContain('$2,500')
    expect(llms).toContain('9.91¢/kWh')
  })
})

describe('ai.txt policy', () => {
  const ai = readPublic('ai.txt')

  it('points at the developer and contact pages and the Markdown contract', () => {
    expect(ai).toContain('/developers')
    expect(ai).toContain('/contact')
    expect(ai).toContain('Accept: text/markdown')
    expect(ai).toContain('1700 Pagedale Cove, Cedar Park, TX 78613')
  })
})

describe('developer resources page', () => {
  const page = findPage('developers')
  const text = textOf(page)

  it('is titled and headed with the business name', () => {
    expect(page.title.startsWith('Texas Solar and Roofing Pros')).toBeTruthy()
    const hero = page.sections.find((section) => section.type === 'hero')
    expect(hero.title.startsWith('Texas Solar and Roofing Pros')).toBeTruthy()
  })

  it('documents every public resource and the Markdown contract', () => {
    for (const resource of ['/llms.txt', '/sitemap.xml', '/robots.txt', '/ai.txt']) {
      expect(text).toContain(resource)
    }
    expect(text).toContain('Accept: text/markdown')
  })

  it('is honest that there is no API, SDK, or MCP server and shows contact details', () => {
    expect(text).toContain('There is no public API, SDK, or MCP server')
    expect(text).toContain('no Model Context Protocol server')
    expect(text).toContain('(512) 775-0561')
    expect(text).toContain('info@texassolarandroofingpros.com')
  })
})

describe('contact page', () => {
  const page = findPage('contact')
  const text = textOf(page)

  it('carries at least 500 characters of useful content with visible contact details', () => {
    expect(text.length).toBeGreaterThan(500)
    expect(text).toContain('(512) 775-0561')
    expect(text).toContain('info@texassolarandroofingpros.com')
    expect(text).toContain('1700 Pagedale Cove, Cedar Park, TX 78613')
  })

  it('states the service area, response expectations, and no-pressure language', () => {
    expect(text).toContain('Austin')
    expect(text).toContain('Central Texas')
    expect(text).toContain('within one business day')
    expect(text).toContain('No pressure')
    expect(text).toContain('free')
  })

  it('never mentions the expired federal tax credit', () => {
    expect(text.toLowerCase()).not.toContain('tax credit')
  })
})

describe('endpoint discovery', () => {
  it('lists the contact and developer pages in the sitemap', async () => {
    const entries = await getSitemapEntriesForSite(getSiteBySlug(SITE))
    const slugs = entries.map((entry) => entry.slug)
    expect(slugs).toContain('contact')
    expect(slugs).toContain('developers')
    expect(slugs).toContain('')
  })

  it('points crawlers at the developer resources, contact page, and Markdown from robots.txt', async () => {
    const response = await getRobots()
    const body = await response.text()
    expect(body).toContain('Sitemap: https://texassolarandroofingpros.com/sitemap.xml')
    expect(body).toContain('https://texassolarandroofingpros.com/llms.txt')
    expect(body).toContain('https://texassolarandroofingpros.com/developers')
    expect(body).toContain('https://texassolarandroofingpros.com/contact')
    expect(body).toContain('Accept: text/markdown')
  })
})
