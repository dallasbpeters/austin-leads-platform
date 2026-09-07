import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

import { getDevSectionAttributes } from './dev/dev-trace'
import PortableTextContent from './portable-text-content'

function splitParagraphs(value) {
  return portableTextToPlainText(value)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export default function IncentivesSection({ section = null, sectionId = 'incentives' }) {
  const title = section?.title || 'Roof insurance and claim realities'
  const paragraphs = splitParagraphs(section?.body)
  const resolvedParagraphs = paragraphs.length
    ? paragraphs
    : [
        'Roof claims get expensive when the details are misunderstood. This section is here to explain hail damage, aging roofs, RCV vs ACV policies, claim timing, and when detach and reset becomes part of the job.',
        'The goal is simple: help you understand whether you are looking at normal roof wear, storm damage with an insurance angle, or a roofing project that needs to be planned correctly before solar enters the picture.',
      ]
  const ctaLabel = String(section?.ctaLabel || '').trim()
  const ctaHref = section?.ctaHref || '/resources/roof-insurance-and-claim-realities'
  const imageUrl =
    getImageUrl(section?.imageAsset, section?.image) ||
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop'
  const imageAlt = getImageAlt(
    section?.imageAsset,
    section?.image,
    section?.title || 'Roofing and insurance consultation',
  )

  return (
    <section
      className="incentives"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/incentives-section.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="incentives__layout">
        <div className="incentives__copy">
          <h2 className="incentives__title text-size-400">{title}</h2>
          <div className="incentives__body text-size-100">
            {resolvedParagraphs.map((paragraph) => (
              <PortableTextContent key={paragraph} as="p" value={paragraph} />
            ))}
          </div>
          {ctaLabel ? (
            <Button href={ctaHref} shape="pill" variant="default" size="md">
              {ctaLabel}
            </Button>
          ) : null}
        </div>

        <div className="incentives__media">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            loading="lazy"
            className="incentives__image"
          />
        </div>
      </div>
    </section>
  )
}
