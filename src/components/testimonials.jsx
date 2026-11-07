'use client'

import { ArrowLeft, ArrowRight } from 'iconoir-react'
import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { getDevSectionAttributes } from './dev/dev-trace'

// Long reviews step down a size so a 400-character review still fits the stage.
const LONG_QUOTE = 180

const pad = (value) => String(value).padStart(2, '0')

const initials = (name = '') =>
  name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

/** Drops repeats: the same review referenced twice would render two cards keyed alike. */
function uniqueReviews(list) {
  const seen = new Set()
  return (Array.isArray(list) ? list : []).filter((review) => {
    const key = review?._id || review?.id || review?.body
    if (!review?.body || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * Customer stories: one big quote at a time, with a counter and arrows.
 * Live Google reviews (`google`, from the Places API) come first; without them
 * it shows the section's picked Sanity reviews, else the site's reviews.
 */
export default function Testimonials({
  section = null,
  reviews = [],
  google = null,
  sectionId = 'testimonials-homepage',
}) {
  const fromGoogle = Boolean(google?.reviews?.length)
  const list = uniqueReviews(
    fromGoogle ? google.reviews : section?.reviews?.length ? section.reviews : reviews,
  )
  const [index, setIndex] = useState(0)

  if (!list.length) {
    return null
  }

  const review = list[index % list.length]
  const stars = Math.round(Number(review.stars) || 5)
  const uploadedPhoto = review.reviewerPhoto?.asset?.url
  // Google avatars end in a size flag such as "=s128-c0x00000000-cc-rp-mo"; ask for one big enough for the portrait.
  const googlePhoto = review.reviewerPhotoUrl?.replace(/[=]s\d+[^/]*$/u, '')
  const photoUrl = uploadedPhoto
    ? `${uploadedPhoto}?w=480&h=640&fit=crop&auto=format`
    : googlePhoto
      ? `${googlePhoto}=s640-c`
      : null
  const eyebrow = section?.eyebrow || 'Customer stories'
  const go = (step) => setIndex((current) => (current + step + list.length) % list.length)

  return (
    <section
      className="testimonials"
      aria-roledescription="carousel"
      aria-label={section?.title || 'Customer stories'}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/testimonials.jsx',
        content: 'Google reviews (Places API), else Sanity reviews',
      })}
    >
      <div className="testimonials__inner grid-frame">
        <div className="testimonials__aside">
          <p className="testimonials__eyebrow">{eyebrow}</p>
          <div className="testimonials__portrait" key={`photo-${index}`}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={review.reviewerPhoto?.alt || review.author || ''}
                fill
                sizes="12rem"
                className="testimonials__photo"
              />
            ) : (
              <span className="testimonials__initials" aria-hidden="true">
                {initials(review.author)}
              </span>
            )}
          </div>
        </div>

        <div className="testimonials__main">
          <div className="testimonials__bar">
            <p className="testimonials__count" aria-hidden="true">
              <span>{pad(index + 1)}</span>/{pad(list.length)}
            </p>
            {list.length > 1 ? (
              <div className="testimonials__arrows">
                <button
                  type="button"
                  className="testimonials__arrow"
                  onClick={() => go(-1)}
                  aria-label="Previous review"
                >
                  <ArrowLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="testimonials__arrow"
                  onClick={() => go(1)}
                  aria-label="Next review"
                >
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>

          <figure
            key={review._id || index}
            className="testimonials__slide"
            aria-live="polite"
            aria-label={`Review ${index + 1} of ${list.length}`}
          >
            <blockquote
              className={cn(
                'testimonials__quote',
                review.body.length > LONG_QUOTE && 'testimonials__quote--long',
              )}
            >
              {review.body}
            </blockquote>
            <figcaption className="testimonials__by">
              <span className="testimonials__stars" role="img" aria-label={`${stars} out of 5 stars`}>
                {'★'.repeat(stars)}
                <span className="testimonials__stars-off">{'★'.repeat(5 - stars)}</span>
              </span>
              {review.authorUri ? (
                <a
                  href={review.authorUri}
                  className="testimonials__author"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {review.author}
                </a>
              ) : (
                <span className="testimonials__author">{review.author}</span>
              )}
              {review.reviewerLocation || review.when ? (
                <span className="testimonials__meta">
                  {review.source === 'google' ? 'Google review · ' : ''}
                  {review.reviewerLocation || review.when}
                </span>
              ) : null}
            </figcaption>
          </figure>

          {fromGoogle ? (
            <p className="testimonials__credit">
              <span>
                {google.rating ? `${google.rating.toFixed(1)} ★ on Google` : 'Reviews from Google'}
                {google.count ? ` · ${google.count.toLocaleString('en-US')} reviews` : ''}
              </span>
              {google.mapsUri ? (
                <a href={google.mapsUri} target="_blank" rel="noopener noreferrer">
                  Read all on Google
                </a>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
