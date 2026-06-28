import Image from 'next/image'

import { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

const defaultItems = [
  {
    number: '01',
    eyebrow: 'Worry-free, done-for-you service',
    title: 'Worry-free, done-for-you service',
    body: 'From roof review and system design to permits, installation, and utility coordination, the process should feel managed instead of chaotic.',
    color: '#4d554f',
  },
  {
    number: '02',
    eyebrow: 'Thoughtful design customized to your home',
    title: 'Thoughtful design that is customized to your home.',
    body: 'The right layout starts with roof planes, shade, usage patterns, and the work your roof may need before panels go up.',
    color: '#20261f',
  },
  {
    number: '03',
    eyebrow: 'Customer support before, during, and after installation',
    title: 'Full-service customer support before, during & after installation',
    body: 'A strong project keeps you informed through the inspection, design, permitting, install, and follow-up stages.',
    color: '#171717',
  },
]

const resolveCardImage = (item) => getImageUrl(item?.imageAsset, item?.image, { width: 900 })

const SolarDifferenceSection = ({ section = null, sectionId = 'solar-difference' }) => {
  const items = Array.isArray(section?.items) && section.items.length ? section.items : defaultItems
  const body =
    section?.body || 'Learn what makes a solar and roofing project feel intentional instead of rushed.'

  return (
    <section
      className="bg-background py-24 sm:py-32"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/solar-difference-section.jsx',
        content: 'stacked ION-inspired service difference cards',
      })}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(18rem,0.32fr)]">
          <h2 className="type-accent m-0 text-[clamp(3rem,7.4vw,6.5rem)] leading-[0.94] font-black tracking-[-0.075em] text-balance text-neutral-950">
            {section?.title || 'The difference — premium products, design, & support'}
          </h2>
          <PortableTextContent value={body} className="pt-3 text-xl leading-8 text-neutral-300 lg:pt-12" />
        </div>

        <div className="space-y-[-3rem]">
          {items.map((item, index) => {
            const image = resolveCardImage(item)
            const imageAlt = getImageAlt(item?.imageAsset, item?.image, item.title || '')
            const itemBody = portableTextToPlainText(item.body)
            const backgroundColor =
              item.color || defaultItems[index % defaultItems.length]?.color || '#191919'

            return (
              <article
                key={item._key || `${item.title}-${index}`}
                className="relative overflow-hidden rounded-[2rem] px-6 pt-8 pb-12 text-white shadow-[0_-10px_60px_rgba(0,0,0,0.22)] sm:rounded-[2.5rem] sm:px-12 lg:px-16 lg:pt-10 lg:pb-16"
                style={{ backgroundColor }}
              >
                <div className="mb-24 flex items-center gap-7 text-white/42">
                  <span className="text-xl font-black tracking-[-0.03em]">
                    {item.number || String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-lg font-black tracking-[-0.03em]">{item.eyebrow || item.title}</span>
                </div>
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:items-end">
                  <div>
                    <h3 className="m-0 text-[clamp(3rem,6vw,5.6rem)] leading-[0.96] font-black tracking-[-0.07em] text-balance">
                      {item.title}
                    </h3>
                    {itemBody ? (
                      <p className="mt-8 max-w-xl text-lg leading-8 text-white/78">{itemBody}</p>
                    ) : null}
                  </div>
                  {image ? (
                    <div className="relative min-h-[22rem] overflow-hidden rounded-[1.5rem] bg-white/8 lg:min-h-[30rem]">
                      <Image
                        src={image}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
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
