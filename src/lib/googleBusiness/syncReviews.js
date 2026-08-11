/*
 * Upserts Google Business Profile reviews into Sanity `review` documents.
 *
 * Two rules shape this file, both learned the hard way in this dataset:
 *
 *  1. Deterministic ids. Each document is `review-google-<googleReviewId>`, so a
 *     re-run patches the same document. Generated ids would pile up duplicates,
 *     which is what put two identical cards on the homepage and tripped React's
 *     duplicate-key warning.
 *
 *  2. Never touch hand-written reviews. Only documents whose `source` is "google"
 *     get patched. A review someone typed in Studio is left alone even if its id
 *     collides.
 */

import { groq } from 'next-sanity'

import { sanityWriteClient } from '@/sanity/client'

import { hasGoogleBusinessCredentials, describeGoogleBusinessCredentialGap } from './auth'
import { isPublishableReview, listGoogleBusinessReviews, toSanityReview } from './reviews'

const SITES_QUERY = groq`*[_type == "site" && defined(googleBusiness.locationId)]{
  _id,
  name,
  "slug": slug.current,
  "accountId": googleBusiness.accountId,
  "locationId": googleBusiness.locationId
}`

/** Fields the sync owns. Anything else on the document is an editor's to keep. */
const SYNCED_FIELDS = ['author', 'stars', 'body', 'site', 'source', 'sourceId', 'sourceUpdatedAt']

function pickSyncedFields(doc) {
  return Object.fromEntries(
    SYNCED_FIELDS.filter((field) => doc[field] !== undefined).map((field) => [field, doc[field]]),
  )
}

/**
 * One site's reviews. Returns counts rather than throwing on a per-site failure,
 * so one misconfigured tenant cannot abort the whole run.
 */
async function syncSite(site, existingBySourceId) {
  const result = { site: site.slug, created: 0, updated: 0, skipped: 0, unchanged: 0, error: null }

  if (!site.accountId) {
    result.error = 'Missing googleBusiness.accountId'
    return result
  }

  let googleReviews
  try {
    googleReviews = await listGoogleBusinessReviews(site.accountId, site.locationId)
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error)
    return result
  }

  const transaction = sanityWriteClient.transaction()
  let queued = 0

  for (const googleReview of googleReviews) {
    // A star-only rating has no text and would render as an empty card.
    if (!isPublishableReview(googleReview)) {
      result.skipped += 1
      continue
    }

    const mapped = toSanityReview(googleReview, { siteId: site._id })
    if (!mapped) {
      result.skipped += 1
      continue
    }

    const existing = existingBySourceId.get(mapped.sourceId)

    // Someone typed this review in Studio. Leave it exactly as it is.
    if (existing && existing.source !== 'google') {
      result.skipped += 1
      continue
    }

    if (existing && existing.sourceUpdatedAt === mapped.sourceUpdatedAt) {
      result.unchanged += 1
      continue
    }

    // createIfNotExists + patch, rather than createOrReplace: replace would wipe
    // fields the sync does not own, such as a reviewerPhoto an editor uploaded.
    transaction
      .createIfNotExists({ _id: mapped._id, _type: 'review' })
      .patch(mapped._id, (patch) => patch.set(pickSyncedFields(mapped)))

    queued += 1
    if (existing) {
      result.updated += 1
    } else {
      result.created += 1
    }
  }

  if (queued > 0) {
    await transaction.commit({ visibility: 'async' })
  }

  return result
}

/**
 * Pull reviews for every site that has a Google location configured.
 *
 * Safe to call before API approval lands: it reports why it did nothing instead
 * of throwing, so a cron schedule can be wired up now.
 */
export async function syncGoogleReviews() {
  if (!sanityWriteClient) {
    return { ok: false, reason: 'SANITY_API_WRITE_TOKEN is not set, so nothing can be written.', sites: [] }
  }

  if (!hasGoogleBusinessCredentials()) {
    return { ok: false, reason: describeGoogleBusinessCredentialGap(), sites: [] }
  }

  const sites = await sanityWriteClient.fetch(SITES_QUERY)

  if (sites.length === 0) {
    return {
      ok: false,
      reason:
        'No site document has a Google Business Profile location id yet. Add one under Site settings → Google Business Profile.',
      sites: [],
    }
  }

  // One read of existing synced reviews, keyed by Google's review id.
  const existing = await sanityWriteClient.fetch(
    groq`*[_type == "review" && defined(sourceId)]{ _id, sourceId, source, sourceUpdatedAt }`,
  )
  const existingBySourceId = new Map(existing.map((doc) => [doc.sourceId, doc]))

  const results = []
  for (const site of sites) {
    // Sequential on purpose: Business Profile quota is 300 QPM per project and
    // shared across tenants, so parallel fans-out buy nothing here.

    results.push(await syncSite(site, existingBySourceId))
  }

  return { ok: results.every((entry) => !entry.error), reason: null, sites: results }
}
