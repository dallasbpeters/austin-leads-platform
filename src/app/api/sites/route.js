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
      { error: 'SANITY_API_WRITE_TOKEN is not configured. Add it to .env.local and restart the dev server.' },
      { status: 503 },
    )
  }

  const siteId = `site-${slug}`

  // 1. Create or replace the Sanity site document (no arrays, so no _key needed)
  const site = await sanityWriteClient.createOrReplace({
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
  })

  // 2. Create the homepage — every array item needs a unique _key
  const page = await sanityWriteClient.create({
    _type: 'page',
    title: `${name} — Home`,
    description: `Homepage for ${name}`,
    slug: { _type: 'slug', current: '/' },
    pageType: 'home',
    templateLevel: 'landing',
    site: { _type: 'reference', _ref: siteId },
    sections: [
      {
        _key: key(),
        _type: 'heroSection',
        type: 'hero',
        eyebrow: 'Austin, Texas',
        title: name,
        body: [
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
        ],
        heroMediaMode: 'single',
        actions: [
          {
            _key: key(),
            _type: 'pageAction',
            label: 'Get a Free Estimate',
            href: '#lead-form',
            variant: 'default',
          },
          { _key: key(), _type: 'pageAction', label: 'Learn More', href: '#services', variant: 'outline' },
        ],
      },
    ],
  })

  // 3. Add domain to Vercel (non-fatal — domain may already be attached)
  let vercelResult
  let alreadyInVercel
  try {
    vercelResult = await addDomainToVercel({ domain })
  } catch (err) {
    // 409 = domain already exists in this or another project
    alreadyInVercel = err?.status === 409 || /already in use/i.test(err?.message ?? '')
    console.warn('[sites] Vercel domain attachment:', err.message)
    vercelResult = {
      domain,
      verified: alreadyInVercel,
      verificationStatus: alreadyInVercel ? 'active' : 'pending',
      dnsInstructions: [],
      projectId: null,
    }
  }

  // 4. Persist the domain record locally
  const domainRecord = {
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

  const persisted = hasDomainDatabase()
    ? await upsertDomainRecordDb(domainRecord)
    : upsertDomainRecord(domainRecord)

  return NextResponse.json({ site, page, domain: persisted, vercel: vercelResult }, { status: 201 })
}
