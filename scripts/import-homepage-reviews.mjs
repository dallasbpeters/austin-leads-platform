import { createClient } from 'next-sanity'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const fallbackReviews = [
  {
    id: 'review-michael-r',
    author: 'Michael R.',
    reviewerLocation: 'Austin, TX',
    stars: 5,
    body: 'The team at Texas Solar and Roofing Pros made the entire process seamless. From the initial consultation to the final installation, they were professional, knowledgeable, and always on time. My energy bills have dropped significantly, and I could not be happier with my new solar panels.',
    reviewerPhoto: {
      alt: 'Michael R.',
      url: 'https://randomuser.me/api/portraits/men/32.jpg',
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
      url: 'https://randomuser.me/api/portraits/women/44.jpg',
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
      url: 'https://randomuser.me/api/portraits/men/65.jpg',
    },
  },
]

async function resolvePrimarySite() {
  const site = await client.fetch(
    `*[_type == "site" && slug.current == "texas-solar-and-roofing-pros"][0]{
      _id,
      name,
      slug
    }`,
  )

  if (!site?._id) {
    throw new Error('Could not find a site document for Texas Solar and Roofing Pros.')
  }

  return site
}

async function uploadReviewerPhoto(review) {
  const photo = review.reviewerPhoto

  if (!photo?.url) {
    return null
  }

  try {
    const response = await fetch(photo.url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const extension = contentType.includes('png') ? 'png' : 'jpg'
    const filename = `${review.id}.${extension}`

    const asset = await client.assets.upload('image', Buffer.from(arrayBuffer), {
      filename,
      contentType,
    })

    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
      alt: photo.alt || review.author,
    }
  } catch (error) {
    console.warn(`Failed to upload reviewer photo for ${review.author}: ${error.message}`)
    return null
  }
}

async function upsertReview(site, review) {
  const reviewerPhoto = await uploadReviewerPhoto(review)
  const doc = {
    _id: review.id,
    _type: 'review',
    author: review.author,
    reviewerLocation: review.reviewerLocation,
    stars: review.stars,
    body: review.body,
    site: {
      _type: 'reference',
      _ref: site._id,
    },
    ...(reviewerPhoto ? { reviewerPhoto } : {}),
  }

  await client.createOrReplace(doc)
  console.log(`Imported ${review.author}`)
}

async function main() {
  const site = await resolvePrimarySite()
  console.log(`Using site ${site.name} (${site.slug?.current || site._id})`)

  for (const review of fallbackReviews) {
    await upsertReview(site, review)
  }

  console.log(`Imported ${fallbackReviews.length} reviews.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
