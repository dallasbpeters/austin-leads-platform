import Button from './Button'
import PortableTextContent from './PortableTextContent'
import { getDevSectionAttributes } from './dev/DevTrace'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

function splitParagraphs(value) {
  return portableTextToPlainText(value)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export default function IncentivesSection({ section = null, sectionId = 'incentives', editAttributes = {} }) {
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
      className="py-24 px-3 md:px-6 bg-warm"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/IncentivesSection.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="grid items-center max-w-6xl gap-16 mx-auto max-[900px]:grid-cols-1 md:grid-cols-2">
        <div className="grid gap-4 place-items-start">
          <h2 className="m-0 text-[clamp(1.875rem,4vw,2.25rem)] text-secondary type-accent">{title}</h2>
          <div className="font-normal leading-7 text-base text-slate-500 type-accent">
            {resolvedParagraphs.map((paragraph) => (
              <PortableTextContent key={paragraph} as="p" value={paragraph} />
            ))}
          </div>
          {ctaLabel ? (
            <Button href={ctaHref} pill variant="primary" size="md">
              {ctaLabel}
            </Button>
          ) : null}
        </div>

        <div className="h-[400px] rounded-3xl overflow-hidden">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
