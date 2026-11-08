import Image from '@/components/site-image'

import { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { cn } from '@/lib/utils'

/**
 * An editorial layout on the page's four columns: the headline across two,
 * a short intro in one outer column, framed photos in the middle two, and a
 * big statement in the other outer column, level with the bottom of the first
 * photo. `layout: 'introRight'` mirrors it. Content: Sanity storyGridSection.
 */
export function StoryGridSection({ section, sectionId }) {
  const photos = (section?.storyPhotos || []).filter((photo) => photo?.url)
  const flipped = section?.layout === 'introRight'

  if (!section?.title && !photos.length) {
    return null
  }

  return (
    <section
      className={cn('story-grid', flipped && 'story-grid--flipped')}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/story-grid-section.jsx',
        content: 'Sanity storyGridSection: headline, intro, photos and statement',
      })}
    >
      <div className="story-grid__inner">
        <header className="story-grid__head">
          {section.eyebrow ? <p className="story-grid__eyebrow">{section.eyebrow}</p> : null}
          {section.title ? <h2 className="story-grid__title">{section.title}</h2> : null}
        </header>

        {section.body ? <PortableTextContent value={section.body} className="story-grid__intro" /> : null}

        {photos.map((photo, index) => (
          <figure
            key={photo._key || photo.url}
            className="story-grid__photo grid-frame"
            // The row only applies on wide screens (story-grid.css); phones stack in order.
            style={{ '--story-row': index + 2 }}
          >
            <Image
              src={`${photo.url}?w=1600&auto=format`}
              alt={photo.alt || ''}
              width={1600}
              height={1200}
              sizes="(width >= 64rem) 40rem, 100vw"
              className="story-grid__image"
            />
          </figure>
        ))}

        {section.statement ? <p className="story-grid__statement">{section.statement}</p> : null}
      </div>
    </section>
  )
}

export default StoryGridSection
