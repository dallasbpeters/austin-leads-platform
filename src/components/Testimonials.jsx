import { Card } from '@/components/ui/card'
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
  const safeStars = Math.max(1, Math.min(5, Number(stars) || 5))

  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={index < safeStars ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
        </svg>
      ))}
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
    <div className="flex items-center justify-center h-14 w-14 font-semibold text-foreground text-sm tracking-[0.12em] bg-(--color-tasman) rounded-full uppercase">
      {initials || 'TS'}
    </div>
  )
}

export default function Testimonials({
  reviews = [],
  section = null,
  sectionId = 'testimonials-homepage',
  editAttributes = {},
}) {
  const resolvedReviews = reviews.length ? reviews.slice(0, 3) : fallbackReviews
  const title = section?.title || 'What customers are saying'
  const subtitle = section?.body || 'about Texas Solar and Roofing Pros'

  return (
    <section
      className="py-24 bg-secondary-100 radial-grid-bg"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/Testimonials.jsx',
        content: reviews.length ? 'homepage reviews from Sanity' : 'local fallback testimonial content',
      })}
      >
      <div className="max-w-7xl mb-20 ml-auto mr-auto lg:px-8 sm:px-6 text-center">
        <h2 className="mb-6 font-medium text-4xl text-foreground tracking-tight sm:text-6xl animate-delay-200 dynamic-zoom-in">
          {title}
          <span className="block font-medium leading-relaxed text-transparent tracking-tight bg-clip-text bg-primary">
            {subtitle}
          </span>
        </h2>
      </div>

      <div className="relative max-w-7xl mx-auto px-10 animate-delay-400 dynamic-slide-in">
        <div className="overflow-hidden">
          <div className="grid gap-6 testimonial-scroll md:grid-cols-3 sm:grid-cols-1">
            {resolvedReviews.map((review) => (
              <Card
                key={review.id || review.author}
                className="relative p-10 backdrop-blur-sm card--dark-glass"
              >
                <div className="flex items-center gap-1">
                  <Ratings stars={review.stars} />
                  <span className="ml-2 text-gray-400 text-sm">{Number(review.stars || 5).toFixed(1)}</span>
                </div>
                <p className="mb-6 leading-relaxed text-foreground">"{review.body}"</p>
                <div className="flex items-center gap-4">
                  <ReviewerAvatar review={review} />
                  <div>
                    <div className="font-semibold text-foreground text-lg">{review.author}</div>
                    {review.reviewerLocation ? (
                      <div className="text-gray-400 text-sm">{review.reviewerLocation}</div>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
