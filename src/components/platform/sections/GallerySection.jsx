import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { buildSanityImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeString } from '@/lib/sanity/stega'

const COLUMN_COUNT = 4

function distributeIntoColumns(items, columnCount) {
  const columns = Array.from({ length: columnCount }, () => [])
  items.forEach((item, index) => {
    columns[index % columnCount].push({ item, index })
  })
  return columns
}

export function GallerySection({ section, sectionId, editAttributes = {} }) {
  const images = Array.isArray(section?.images) ? section.images : []
  const title = cleanRuntimeString(section?.title || '')

  if (images.length === 0) return null

  const columns = distributeIntoColumns(images, COLUMN_COUNT)

  return (
    <section
      className="border-b border-border/60 bg-background"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/GallerySection.jsx',
        content: `gallery section with ${images.length} images`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/GallerySection.jsx"
        content={`gallery section with ${images.length} images`}
      />
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-20 lg:px-10">
        {title ? (
          <h2 className="mb-8 max-w-3xl text-3xl text-foreground md:text-4xl">{title}</h2>
        ) : null}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {columns.map((column, columnIndex) => (
            <div
              key={buildRuntimeKey('gallery-column', sectionId, columnIndex)}
              className="grid gap-3 md:gap-4"
            >
              {column.map(({ item, index }) => {
                const src = buildSanityImageUrl(item, { width: 1200 })
                if (!src) return null

                const alt =
                  cleanRuntimeString(item?.alt || item?.altText || title) ||
                  `gallery photo ${index + 1}`

                return (
                  <div
                    key={buildRuntimeKey(
                      'gallery-image',
                      item?._key,
                      item?.asset?._ref,
                      index,
                    )}
                    className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
                  >
                    <img
                      src={src}
                      alt={alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
