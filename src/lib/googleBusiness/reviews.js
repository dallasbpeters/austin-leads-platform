/*
 * Reading reviews from a Google Business Profile.
 *
 * Reviews are spread across three services, which is why a location id alone is
 * not enough to start:
 *   - mybusinessaccountmanagement.googleapis.com/v1  → your accounts
 *   - mybusinessbusinessinformation.googleapis.com/v1 → locations under an account
 *   - mybusiness.googleapis.com/v4                    → the reviews themselves
 *
 * Only v4 serves reviews; it is the legacy endpoint and has no v1 replacement.
 */

import { googleBusinessGet } from './auth'

const ACCOUNTS_URL = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts'
const LOCATIONS_HOST = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const REVIEWS_HOST = 'https://mybusiness.googleapis.com/v4'

const STAR_WORDS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }

/** Google returns ratings as words ("FIVE"), not numbers. */
export function starRatingToNumber(starRating) {
  return STAR_WORDS[starRating] ?? null
}

/** Accounts the authorised user can manage. Used once, to discover ids. */
export async function listGoogleBusinessAccounts() {
  const payload = await googleBusinessGet(`${ACCOUNTS_URL}?pageSize=20`)
  return (payload.accounts || []).map((account) => ({
    name: account.name, // "accounts/123456789"
    accountName: account.accountName,
    type: account.type,
  }))
}

/** Locations under one account. `accountName` is the full "accounts/123" string. */
export async function listGoogleBusinessLocations(accountName) {
  const url = `${LOCATIONS_HOST}/${accountName}/locations?readMask=name,title,storefrontAddress&pageSize=100`
  const payload = await googleBusinessGet(url)
  return (payload.locations || []).map((location) => ({
    name: location.name, // "locations/123456789"
    title: location.title,
    city: location.storefrontAddress?.locality || '',
  }))
}

/**
 * Every review for one location, following pagination.
 *
 * `locationId` accepts either "locations/123" or the bare "123" — the v4 path
 * wants `accounts/{account}/locations/{location}`, and mixing the two prefixes
 * is the most common cause of a 404 here.
 */
export async function listGoogleBusinessReviews(accountName, locationId, { maxPages = 10 } = {}) {
  const bareLocation = String(locationId).replace(/^locations\//, '')
  const bareAccount = String(accountName).replace(/^accounts\//, '')
  const reviews = []
  let pageToken = ''

  for (let page = 0; page < maxPages; page += 1) {
    const url = new URL(`${REVIEWS_HOST}/accounts/${bareAccount}/locations/${bareLocation}/reviews`)
    url.searchParams.set('pageSize', '50')
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken)
    }

    const payload = await googleBusinessGet(url.toString())
    reviews.push(...(payload.reviews || []))

    pageToken = payload.nextPageToken || ''
    if (!pageToken) {
      break
    }
  }

  return reviews
}

/**
 * Map one Google review onto the fields of the Sanity `review` document type.
 *
 * `reviewId` becomes a deterministic Sanity `_id` so re-running the sync patches
 * the same document instead of creating a duplicate — the failure mode that put
 * two identical cards on the homepage and tripped React's duplicate-key check.
 */
export function toSanityReview(googleReview, { siteId }) {
  const reviewId = String(googleReview.reviewId || googleReview.name || '')
    .split('/')
    .pop()

  if (!reviewId) {
    return null
  }

  const stars = starRatingToNumber(googleReview.starRating)
  const body = (googleReview.comment || '').trim()

  return {
    _id: `review-google-${reviewId}`,
    _type: 'review',
    author: googleReview.reviewer?.displayName || 'Google reviewer',
    stars: stars ?? 5,
    body,
    site: siteId ? { _type: 'reference', _ref: siteId } : undefined,
    // Provenance, so an editor can tell synced reviews from hand-written ones and
    // the sync knows which documents it is allowed to overwrite.
    source: 'google',
    sourceId: reviewId,
    sourceUpdatedAt: googleReview.updateTime || googleReview.createTime || null,
  }
}

/** Star-only ratings carry no text and would render as an empty card. */
export function isPublishableReview(googleReview) {
  return Boolean((googleReview?.comment || '').trim())
}
