import { Button } from '@/components/ui/button'
import PortableTextContent from './PortableTextContent'
import { getDevSectionAttributes } from './dev/DevTrace'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import Image from 'next/image'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

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
      className="bg-warm px-3 py-24 md:px-6"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/IncentivesSection.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-16 max-[900px]:grid-cols-1 md:grid-cols-2">
        <div className="grid place-items-start gap-4">
          <h2 className="text-secondary type-accent m-0 text-[clamp(1.875rem,4vw,2.25rem)]">{title}</h2>
          <div className="type-accent text-base leading-7 font-normal text-slate-500">
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

        <div className="relative h-[400px] overflow-hidden rounded-3xl">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            loading="lazy"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
