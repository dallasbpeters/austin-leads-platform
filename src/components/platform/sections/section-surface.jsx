import Image from 'next/image'

import { buildSanityImageUrl } from '@/lib/platform/imageSource'

const getSectionSurfaceBackground = (section) => {
  const backgroundColor = section?.sectionBackgroundColor || null
  const backgroundImage = section?.sectionBackgroundImage || null
  const imageUrl = backgroundImage ? buildSanityImageUrl(backgroundImage, { width: 2400 }) : ''

  if (!backgroundColor && !imageUrl) {
    return null
  }

  return {
    backgroundColor,
    backgroundImage,
    imageUrl,
  }
}

const SectionSurface = ({ section, children }) => {
  const background = getSectionSurfaceBackground(section)

  if (!background) {
    return children
  }

  return (
    <div
      className="section-surface section-surface--custom"
      style={{ backgroundColor: background.backgroundColor || undefined }}
    >
      {background.imageUrl ? (
        <div className="section-surface__image-wrapper">
          <Image
            src={background.imageUrl}
            alt=""
            aria-hidden="true"
            width={2400}
            height={1680}
            priority
            quality={100}
          />
        </div>
      ) : null}
      <div className="section-surface__content">{children}</div>
    </div>
  )
}

export default SectionSurface
