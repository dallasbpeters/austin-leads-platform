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
      className="section-surface section-surface--custom relative overflow-hidden"
      style={{ backgroundColor: background.backgroundColor || undefined }}
    >
      {background.imageUrl ? (
        <div className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-screen -translate-x-1/2 translate-y-1/4">
          <Image
            src={background.imageUrl}
            alt=""
            aria-hidden="true"
            width={2400}
            height={1680}
            priority
            quality={100}
            className="h-auto max-h-168 w-screen object-cover object-[50%_0%]"
          />
        </div>
      ) : null}
      <div className="section-surface__content relative z-10">{children}</div>
    </div>
  )
}

export default SectionSurface
