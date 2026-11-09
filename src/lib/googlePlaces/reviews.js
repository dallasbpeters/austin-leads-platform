/*
 * Google reviews through the Places API (New), using an API key.
 *
 * The Business Profile API would return every review, but Google only grants it
 * to agencies and tools; this one needs no approval. In exchange it returns at
 * most five reviews (Google picks them), and its terms ask that we show the
 * author and a Google credit, and not store the reviews. So they are fetched
 * here on the server and only held in Next's data cache for a day, which also
 * keeps the request count inside the free monthly usage.
 */

const PLACES_HOST = 'https://places.googleapis.com/v1/places'
const FIELD_MASK = 'rating,userRatingCount,googleMapsUri,reviews'
const REVALIDATE_SECONDS = 60 * 60 * 24

function apiKey() {
  return (process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_BUSINESS_API_KEY || '').trim()
}

function toReview(review, index) {
  const body = (review.text?.text || review.originalText?.text || '').trim()
  if (!body) {
    return null
  }

  return {
    _id: `google-place-review-${review.name?.split('/').pop() || index}`,
    author: review.authorAttribution?.displayName || 'Google reviewer',
    authorUri: review.authorAttribution?.uri || null,
    reviewerPhotoUrl: review.authorAttribution?.photoUri || null,
    stars: review.rating ?? 5,
    body,
    when: review.relativePublishTimeDescription || '',
    source: 'google',
  }
}

/**
 * Rating summary plus up to five reviews for one place, or null when the key or
 * place id is missing or Google refuses. Never throws, so a Google outage only
 * drops the section back to the Sanity reviews.
 */
export async function getGooglePlaceReviews(placeId) {
  const key = apiKey()
  if (!key || !placeId) {
    return null
  }

  try {
    const response = await fetch(`${PLACES_HOST}/${encodeURIComponent(placeId)}`, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELD_MASK },
      next: { revalidate: REVALIDATE_SECONDS },
    })

    if (!response.ok) {
      console.warn(`[googlePlaces] Place details failed (${response.status}) for ${placeId}`)
      return null
    }

    const place = await response.json()
    return {
      rating: place.rating ?? null,
      count: place.userRatingCount ?? null,
      mapsUri: place.googleMapsUri || null,
      reviews: (place.reviews || []).map(toReview).filter(Boolean),
    }
  } catch (error) {
    console.warn('[googlePlaces] Place details request threw', error)
    return null
  }
}
