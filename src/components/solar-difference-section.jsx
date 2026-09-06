import Image from 'next/image'

import { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

const defaultItems = [
  {
    number: '01',
    eyebrow: 'Worry-free, done-for-you service',
    title: 'Done-for-you service',
    body: 'From roof review and system design to permits, installation, and utility coordination, the process should feel managed instead of chaotic.',
    color: 'oklch(32.98% 0.06 332.55)',
  },
  {
    number: '02',
    eyebrow: 'Thoughtful design customized to your home',
    title: 'Thoughtful design that is customized to your home.',
    body: 'The right layout starts with roof planes, shade, usage patterns, and the work your roof may need before panels go up.',
    color: 'oklch(93.35% 0.13 101.09)',
  },
  {
    number: '03',
    eyebrow: 'Customer support before, during, and after installation',
    title: 'Full-service customer support before, during & after installation',
    body: 'A strong project keeps you informed through the inspection, design, permitting, install, and follow-up stages.',
    color: 'oklch(29.86% 0.08 246.43)',
  },
]

const resolveCardImage = (item) => getImageUrl(item?.imageAsset, item?.image, { width: 900 })

const SolarDifferenceSection = ({ section = null, sectionId = 'solar-difference' }) => {
  const items = Array.isArray(section?.items) && section.items.length ? section.items : defaultItems
  const body =
    section?.body || 'Learn what makes a solar and roofing project feel intentional instead of rushed.'
  const stackTopBase = 132
  return (
    <section
      className="solar-difference"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/solar-difference-section.jsx',
        content: 'stacked ION-inspired service difference cards',
      })}
    >
      <div className="solar-difference__inner">
        <div className="solar-difference__intro">
          <h2 className="solar-difference__title">
            {section?.title || 'The difference — premium products, design, & support'}
          </h2>
          <PortableTextContent value={body} className="solar-difference__lede" />
        </div>

        <div className="solar-difference__stack">
          {items.map((item, index) => {
            const image = resolveCardImage(item)
            const imageAlt = getImageAlt(item?.imageAsset, item?.image, item.title || '')
            const itemBody = portableTextToPlainText(item.body)
            const colorHex = typeof item.color === 'string' ? item.color : item.color?.hex
            const backgroundColor = colorHex || defaultItems[index % defaultItems.length]?.color || '#191919'
            const stackTop = stackTopBase + index * 132
            const stackZ = index + 1

            return (
              <article
                key={item._key || `${item.title}-${index}`}
                className="solar-difference__card"
                style={{
                  backgroundColor,
                  top: stackTop,
                  zIndex: stackZ,
                  color: `contrast-color(${backgroundColor})`,
                }}
              >
                <div className="solar-difference__card-head">
                  <span className="solar-difference__card-number">
                    {item.number || String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="solar-difference__card-eyebrow">{item.eyebrow || item.title}</span>
                </div>
                <div className="solar-difference__card-body">
                  <div>
                    <h3 className="solar-difference__card-title">{item.title}</h3>
                    {itemBody ? <p className="solar-difference__card-copy">{itemBody}</p> : null}
                  </div>
                  {image ? (
                    <div className="solar-difference__card-media">
                      <Image
                        src={image}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="solar-difference__card-image"
                      />
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default SolarDifferenceSection
