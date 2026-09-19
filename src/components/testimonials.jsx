// oxlint-disable func-style no-nested-ternary unicorn/no-array-for-each
import Image from 'next/image'

import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

import { getDevSectionAttributes } from './dev/dev-trace'
import ElfsightReviewsEmbed from './elfsight-reviews-embed'

export default function Testimonials({ section = null, sectionId = 'testimonials-homepage' }) {
  // The same review referenced twice in a section renders two cards keyed alike,
  // which React rejects. Schema validation now blocks new duplicates, but existing

  const backgroundImage = getImageUrl(section?.backgroundImageAsset, section?.backgroundImage, {
    width: 1800,
  })
  const backgroundImageAlt = getImageAlt(
    section?.backgroundImageAsset,
    section?.backgroundImage,
    'Customer reviews background',
  )

  return (
    <section
      className="bg-secondary-100 radial-grid-bg relative overflow-hidden py-24"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/testimonials.jsx',
      })}
    >
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt={backgroundImageAlt}
          fill
          sizes="100vw"
          className="mask-t-to-75% object-cover object-[0_-s100%]"
        />
      ) : null}
      <ElfsightReviewsEmbed appId="a47faa40-0d7d-4ae2-bf46-e4e63e4bf10a" />
    </section>
  )
}
