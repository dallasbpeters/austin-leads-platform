import Image from 'next/image'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { getImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey } from '@/lib/sanity/stega'

function resolveStepImageSide(index, override) {
  if (override === 'left') return 'left'
  if (override === 'right') return 'right'
  return index % 2 === 0 ? 'left' : 'right'
}

export function InstallProcessSection({ section, sectionId }) {
  const items = section.items ?? []

  return (
    <section
      className="bg-background border-border/60 border-b"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/install-process-section.jsx',
        content: `install process section from ${section._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/install-process-section.jsx"
        content={`install process section from ${section._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-3 py-20 md:px-6 lg:px-10">
        {/* Section header */}
        <div className="mb-16 max-w-3xl">
          {section.eyebrow && (
            <span className="text-primary mb-4 block text-sm font-semibold tracking-widest uppercase">
              {section.eyebrow}
            </span>
          )}
          <h2 className="text-foreground text-3xl tracking-normal md:text-4xl lg:text-5xl">
            {section.title}
          </h2>
          {section.subtitle && (
            <PortableTextContent
              as="div"
              value={section.subtitle}
              className="text-muted-foreground mt-6 text-lg leading-relaxed"
            />
          )}
        </div>

        {/* Process steps */}
        <div className="space-y-20">
          {items.map((item, index) => {
            const imageSide = resolveStepImageSide(index, item.imageSide)
            const isImageRight = imageSide === 'right'
            const stepNumber = String(index + 1).padStart(2, '0')
            const imageUrl = getImageUrl(item.image)

            return (
              <div
                key={buildRuntimeKey('install-step', item.title, index)}
                className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
              >
                {/* Image column */}
                <div
                  className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${
                    isImageRight ? 'md:order-last' : ''
                  }`}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.image?.altText ?? item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center">
                      <span className="text-muted-foreground text-sm">Image</span>
                    </div>
                  )}
                </div>

                {/* Content column */}
                <div className="flex flex-col gap-4">
                  <span className="text-primary/30 text-6xl leading-none font-bold md:text-7xl">
                    {stepNumber}
                  </span>
                  <h3 className="text-foreground text-2xl font-semibold md:text-3xl">{item.title}</h3>
                  <PortableTextContent
                    as="div"
                    value={item.body}
                    className="text-muted-foreground text-base leading-relaxed md:text-lg"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default InstallProcessSection
