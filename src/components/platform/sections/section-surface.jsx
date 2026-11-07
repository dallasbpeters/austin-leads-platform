import Image from 'next/image'

import { buildSanityImageUrl } from '@/lib/platform/imageSource'
import { surfaceTone } from '@/lib/platform/surface-tone'
import { cleanRuntimeString } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

const getSectionSurfaceBackground = (section) => {
  const backgroundColor = cleanRuntimeString(section?.sectionBackgroundColor) || null
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

  // Text on a custom colour flips to whichever of dark or light contrasts with it.
  const tone = background.backgroundColor ? surfaceTone(background.backgroundColor) : null

  return (
    <div
      className={cn('section-surface section-surface--custom', tone && `section-surface--on-${tone}`)}
      style={{
        backgroundColor: background.backgroundColor || undefined,
        '--surface-bg': background.backgroundColor || undefined,
      }}
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
