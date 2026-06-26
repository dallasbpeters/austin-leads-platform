import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { hasDomainDatabase, upsertDomainRecordDb } from '@/lib/platform/domain-db'
import { upsertDomainRecord } from '@/lib/platform/store'
import { addDomainToVercel } from '@/lib/platform/vercel'
import { sanityWriteClient } from '@/sanity/client'

export const runtime = 'nodejs'

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Sanity requires every array item to have a unique _key. */
function key() {
  return Math.random().toString(36).slice(2, 14)
}

function buildSiteDocument(siteId, slug, name, domain, category) {
  return {
    _type: 'site',
    _id: siteId,
    name,
    shortName: name,
    slug: { _type: 'slug', current: slug },
    primaryDomain: domain,
    category: category || 'general',
    tier: 'landing',
    seo: {
      title: name,
      description: `${name} — your trusted local experts in ${category || 'home services'} in Austin, Texas.`,
    },
    leadForm: {
      title: 'Get a Free Estimate',
      description: 'Tell us about your project and we will get back to you within 24 hours.',
      ctaLabel: 'Request Estimate',
    },
  }
}

function buildHomepageSections(name, category) {
  const heroBody = [
    {
      _key: key(),
      _type: 'block',
      style: 'normal',
      children: [
        {
          _key: key(),
          _type: 'span',
          marks: [],
          text: `Your trusted local ${category || 'home service'} experts. Serving the Austin metro area with quality you can count on.`,
        },
      ],
      markDefs: [],
    },
  ]
  const actions = [
    {
      _key: key(),
      _type: 'pageAction',
      label: 'Get a Free Estimate',
      href: '#lead-form',
      variant: 'default',
    },
    { _key: key(), _type: 'pageAction', label: 'Learn More', href: '#services', variant: 'outline' },
  ]
  return [
    {
      _key: key(),
      _type: 'heroSection',
      type: 'hero',
      eyebrow: 'Austin, Texas',
      title: name,
      body: heroBody,
      heroMediaMode: 'single',
      actions,
    },
  ]
}

function buildHomepageDocument(siteId, name, category) {
  return {
    _type: 'page',
    title: `${name} — Home`,
    description: `Homepage for ${name}`,
    slug: { _type: 'slug', current: '/' },
    pageType: 'home',
    templateLevel: 'landing',
    site: { _type: 'reference', _ref: siteId },
    sections: buildHomepageSections(name, category),
  }
}

async function attachVercelDomainSafe(domain) {
  try {
    return await addDomainToVercel({ domain })
  } catch (err) {
    const alreadyInVercel = err?.status === 409 || /already in use/i.test(err?.message ?? '')
    console.warn('[sites] Vercel domain attachment:', err.message)
    return {
      domain,
      verified: alreadyInVercel,
      verificationStatus: alreadyInVercel ? 'active' : 'pending',
      dnsInstructions: [],
      projectId: null,
    }
  }
}

function buildDomainRecord(domain, slug, vercelResult) {
  return {
    domain,
    siteSlug: slug,
    tier: 'landing',
    redirectTarget: null,
    projectId: vercelResult?.projectId ?? null,
    verified: vercelResult?.verified ?? false,
    verificationStatus: vercelResult?.verificationStatus ?? 'pending',
    dnsInstructions: vercelResult?.dnsInstructions ?? [],
    apexName: vercelResult?.apexName ?? null,
  }
}

async function persistDomainRecord(domainRecord) {
  return hasDomainDatabase() ? await upsertDomainRecordDb(domainRecord) : upsertDomainRecord(domainRecord)
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  const body = await request.json()
  const { domain, name, category } = body
  const slug = body.slug || slugify(name || domain)

  if (!domain) {
    return NextResponse.json({ error: 'domain is required' }, { status: 400 })
  }

  if (!name || !slug) {
    return NextResponse.json({ error: 'name and slug are required for landing pages' }, { status: 400 })
  }

  if (!sanityWriteClient) {
    return NextResponse.json(
      {
        error: 'SANITY_API_WRITE_TOKEN is not configured. Add it to .env.local and restart the dev server.',
      },
      { status: 503 },
    )
  }

  const siteId = `site-${slug}`

  const site = await sanityWriteClient.createOrReplace(
    buildSiteDocument(siteId, slug, name, domain, category),
  )
  const page = await sanityWriteClient.create(buildHomepageDocument(siteId, name, category))
  const vercelResult = await attachVercelDomainSafe(domain)
  const domainRecord = buildDomainRecord(domain, slug, vercelResult)
  const persisted = await persistDomainRecord(domainRecord)

  return NextResponse.json({ site, page, domain: persisted, vercel: vercelResult }, { status: 201 })
}
