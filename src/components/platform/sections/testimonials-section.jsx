import Testimonials from '@/components/testimonials'
import { getGooglePlaceReviews } from '@/lib/googlePlaces/reviews'

/**
 * Server half of the testimonials section: loads the site's Google reviews
 * (Places API) and hands them to the client carousel. Without a place id or
 * API key the carousel falls back to the Sanity reviews.
 */
export async function TestimonialsSection({ section, site, reviews, sectionId }) {
  const placeId = site?.googlePlaceId || process.env.GOOGLE_PLACE_ID
  const google = await getGooglePlaceReviews(placeId)

  return <Testimonials section={section} reviews={reviews} sectionId={sectionId} google={google} />
}

export default TestimonialsSection
