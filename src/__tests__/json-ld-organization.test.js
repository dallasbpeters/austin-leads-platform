import { describe, expect, it, vi } from 'vitest'

import { createJsonLd, getSiteBySlug, resolveSiteOrganization } from '@/lib/platform/content'
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
const site = getSiteBySlug(SITE)
const homepage = pages.find((page) => page.siteSlug === SITE && page.slug === '')

const organizationNode = (jsonLd) =>
  jsonLd['@graph'].find((node) => Array.isArray(node['@type']) && node['@type'].includes('Organization'))

describe('homepage Organization JSON-LD', () => {
  const jsonLd = createJsonLd(site, homepage, '/')
  const organization = organizationNode(jsonLd)

  it('declares Organization literally alongside the specific business type', () => {
    expect(organization['@type']).toStrictEqual(['Organization', 'RoofingContractor'])
    expect(organization['@id']).toBe('https://texassolarandroofingpros.com/#organization')
    expect(organization.name).toBe('Texas Solar and Roofing Pros')
    expect(organization.url).toBe('https://texassolarandroofingpros.com/')
    expect(organization.description.length).toBeGreaterThan(40)
  })

  it('carries telephone, email, and a contact point with a contact type', () => {
    expect(organization.telephone).toBe('(512) 775-0561')
    expect(organization.email).toBe('info@texassolarandroofingpros.com')
    expect(organization.contactPoint).toStrictEqual([
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '(512) 775-0561',
        email: 'info@texassolarandroofingpros.com',
        areaServed: organization.areaServed,
        availableLanguage: 'en',
      },
    ])
  })

  it('carries a complete PostalAddress', () => {
    expect(organization.address).toStrictEqual({
      '@type': 'PostalAddress',
      streetAddress: '1700 Pagedale Cove',
      addressLocality: 'Cedar Park',
      addressRegion: 'TX',
      postalCode: '78613',
      addressCountry: 'US',
    })
  })

  it('keeps the WebSite and WebPage nodes pointing at the organization', () => {
    const website = jsonLd['@graph'].find((node) => node['@type'] === 'WebSite')
    const webPage = jsonLd['@graph'].find((node) => node['@type'] === 'WebPage')
    expect(website.publisher).toStrictEqual({ '@id': organization['@id'] })
    expect(webPage.isPartOf).toStrictEqual({ '@id': website['@id'] })
    expect(JSON.stringify(jsonLd)).not.toContain('tax credit')
  })
})

describe('organization identity merge', () => {
  it('lets Sanity values win while the fixture fills missing fields', () => {
    const merged = resolveSiteOrganization({
      ...site,
      organization: {
        name: 'Texas Solar & Roofing Pros',
        phone: '(512) 775-0561',
        address: null,
        serviceArea: [],
      },
    })
    expect(merged.name).toBe('Texas Solar & Roofing Pros')
    expect(merged.address.postalCode).toBe('78613')
    expect(merged.serviceArea.length).toBeGreaterThan(3)
    expect(merged.type).toBe('RoofingContractor')
  })

  it('falls back to a plain Organization for sites without a specific type', () => {
    const jsonLd = createJsonLd(
      { slug: 'unknown-site', name: 'Unknown', primaryDomain: 'unknown.example', organization: { type: '' } },
      null,
      '/',
    )
    const organization = organizationNode(jsonLd)
    expect(organization['@type']).toStrictEqual(['Organization', 'LocalBusiness'])
    expect(organization.address).toBeUndefined()
    expect(organization.contactPoint).toBeUndefined()
  })
})
