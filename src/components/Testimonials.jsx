import { useId } from 'react'

import { Card } from '@/components/ui/card'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

import { getDevSectionAttributes } from './dev/DevTrace'

const fallbackReviews = [
  {
    id: 'review-michael-r',
    author: 'Michael R.',
    reviewerLocation: 'Austin, TX',
    stars: 5,
    body: 'The team at Texas Solar and Roofing Pros made the entire process seamless. From the initial consultation to the final installation, they were professional, knowledgeable, and always on time. My energy bills have dropped significantly, and I could not be happier with my new solar panels.',
    reviewerPhoto: {
      alt: 'Michael R.',
      asset: { url: 'https://randomuser.me/api/portraits/men/32.jpg' },
    },
  },
  {
    id: 'review-lisa-g',
    author: 'Lisa G.',
    reviewerLocation: 'Round Rock, TX',
    stars: 5,
    body: 'After a major hailstorm, I needed a new roof and decided to add solar at the same time. The crew handled both projects flawlessly. They explained everything clearly, worked efficiently, and left my property spotless. Highly recommend for anyone considering roofing or solar.',
    reviewerPhoto: {
      alt: 'Lisa G.',
      asset: { url: 'https://randomuser.me/api/portraits/women/44.jpg' },
    },
  },
  {
    id: 'review-david-s',
    author: 'David S.',
    reviewerLocation: 'Cedar Park, TX',
    stars: 5,
    body: 'I was nervous about switching to solar, but Texas Solar and Roofing Pros answered all my questions and provided transparent pricing. The installation was quick, and now I am seeing real savings every month. Excellent service from start to finish.',
    reviewerPhoto: {
      alt: 'David S.',
      asset: { url: 'https://randomuser.me/api/portraits/men/65.jpg' },
    },
  },
]

function getReviewPhotoUrl(review) {
  return review?.reviewerPhoto?.asset?.url || ''
}

function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function Ratings({ stars = 5 }) {
  const safeStars = Math.max(0, Math.min(5, Number(stars) || 5))
  const idPrefix = useId()

  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {Array.from({ length: 5 }).map((_, index) => {
        const fillRatio = Math.max(0, Math.min(1, safeStars - index))
        const fillPercent = `${fillRatio * 100}%`
        const gradientId = `${idPrefix}-star-${index}`
        const fill = fillRatio <= 0 ? 'none' : fillRatio >= 1 ? 'currentColor' : `url(#${gradientId})`

        return (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={fillPercent} stopColor="currentColor" />
                <stop offset={fillPercent} stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill={fill}
              d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
            />
          </svg>
        )
      })}
    </div>
  )
}

function ReviewerAvatar({ review }) {
  const photoUrl = getReviewPhotoUrl(review)
  const initials = getInitials(review.author)

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={review?.reviewerPhoto?.alt || review.author}
        className="h-14 w-14 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex size-12 items-center justify-center rounded-full bg-(--color-metterhorn) text-sm font-semibold tracking-[0.12em] text-white uppercase">
      {initials || 'TS'}
    </div>
  )
}

const GoogleLogo = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1556 1587" width="1.5em" height="1.5em" {...props}>
    <g id="Layer">
      <path
        id="Layer"
        fill="#4285f4"
        d="M1555.26 810.89C1555.26 745.67 1549.96 698.07 1538.51 648.72L793.5 648.72L793.5 943.1L1230.8 943.1C1221.99 1016.26 1174.38 1126.44 1068.58 1200.47L1067.09 1210.33L1302.65 1392.76L1318.97 1394.39C1468.85 1256 1555.26 1052.4 1555.26 810.89Z"
      />
      <path
        id="Layer"
        fill="#34a853"
        d="M793.5 1586.53C1007.74 1586.53 1187.6 1516.02 1318.97 1394.39L1068.58 1200.47C1001.57 1247.19 911.64 1279.8 793.5 1279.8C583.66 1279.8 405.57 1141.42 342.08 950.16L332.78 950.95L87.84 1140.45L84.64 1149.35C215.12 1408.48 483.15 1586.53 793.5 1586.53Z"
      />
      <path
        id="Layer"
        fill="#fbbc05"
        d="M342.08 950.16C325.33 900.8 315.64 847.91 315.64 793.27C315.64 738.62 325.33 685.73 341.2 636.37L340.76 625.86L92.75 433.32L84.64 437.17C30.86 544.71 0 665.46 0 793.27C0 921.07 30.86 1041.82 84.64 1149.35L342.08 950.16Z"
      />
      <path
        id="Layer"
        fill="#eb4335"
        d="M793.5 306.73C942.5 306.73 1043.01 371.07 1100.32 424.84L1324.26 206.25C1186.72 78.45 1007.74 0 793.5 0C483.15 0 215.12 178.04 84.64 437.17L341.2 636.37C405.57 445.11 583.66 306.73 793.5 306.73Z"
      />
    </g>
  </svg>
)

export default function Testimonials({ reviews = [], section = null, sectionId = 'testimonials-homepage' }) {
  const sectionReviews = Array.isArray(section?.reviews) ? section.reviews.filter(Boolean) : []
  const siteReviews = Array.isArray(reviews) ? reviews.filter(Boolean) : []
  const resolvedReviews = sectionReviews.length
    ? sectionReviews.slice(0, 6)
    : siteReviews.length
      ? siteReviews.slice(0, 3)
      : fallbackReviews
  const title = section?.title || 'What customers are saying'
  const subtitle = portableTextToPlainText(section?.body) || 'about Texas Solar and Roofing Pros'
  const desktopColumns = [[], [], []]
  const desktopOrder = [0, 1, 2, 1]

  resolvedReviews.forEach((review, index) => {
    const targetColumn = desktopOrder[index % desktopOrder.length]
    desktopColumns[targetColumn].push(review)
  })

  return (
    <section
      className="bg-secondary-100 radial-grid-bg py-24"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/Testimonials.jsx',
        content: reviews.length ? 'homepage reviews from Sanity' : 'local fallback testimonial content',
      })}
    >
      <div className="mr-auto mb-20 ml-auto max-w-7xl text-center sm:px-3 md:px-6 lg:px-8">
        <h2 className="text-foreground animate-delay-200 dynamic-zoom-in mb-6 text-4xl font-medium tracking-normal sm:text-6xl">
          {title}
          <span className="bg-primary block bg-clip-text leading-relaxed font-medium tracking-normal text-transparent">
            {subtitle}
          </span>
        </h2>
      </div>

      <div className="animate-delay-400 dynamic-slide-in relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {desktopColumns.map((columnReviews, columnIndex) => (
            <div key={`column-${columnIndex}`} className="space-y-6">
              {columnReviews.map((review) => (
                <Card
                  key={review.id || `${review.author}-${columnIndex}`}
                  className="card--dark-glass relative p-8 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1">
                    <Ratings stars={review.stars} />
                    <span className="ml-2 grow text-sm text-gray-400">
                      {Number(review.stars || 5).toFixed(1)}
                    </span>
                    <GoogleLogo />
                  </div>
                  <p className="border-border text-foreground mb-1 border-b pb-3 leading-relaxed">
                    "{review.body}"
                  </p>
                  <div className="flex items-center gap-4">
                    <ReviewerAvatar review={review} />
                    <div>
                      <div className="text-foreground text-lg font-semibold">{review.author}</div>
                      {review.reviewerLocation ? (
                        <div className="text-sm text-gray-400">{review.reviewerLocation}</div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
