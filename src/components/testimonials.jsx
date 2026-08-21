// oxlint-disable func-style no-nested-ternary unicorn/no-array-for-each
import Image from 'next/image'

import Script from 'next/script'

import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

import { getDevSectionAttributes } from './dev/dev-trace'

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
      <Script src="https://elfsightcdn.com/platform.js" async></Script>
      <div className="elfsight-app-a47faa40-0d7d-4ae2-bf46-e4e63e4bf10a" data-elfsight-app-lazy></div>
    </section>
  )
}
