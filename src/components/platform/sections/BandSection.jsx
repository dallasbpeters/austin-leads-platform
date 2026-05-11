import Band from '@/components/Band'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'

export function BandSection({ section, sectionId }) {
  return (
    <section
      className="bg-transparent"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/BandSection.jsx',
        content: `band section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/BandSection.jsx"
        content={`band section from ${section?._type || 'page section'}`}
      />
      <Band
        colors={Array.isArray(section.colors) && section.colors.length ? section.colors : undefined}
        tint={section.tint || undefined}
        minHeight={typeof section.minHeight === 'number' ? section.minHeight : undefined}
        maxHeight={typeof section.maxHeight === 'number' ? section.maxHeight : undefined}
        rotate={Boolean(section.rotate)}
        scrollStart={typeof section.scrollStart === 'number' ? section.scrollStart : undefined}
        scrollEnd={typeof section.scrollEnd === 'number' ? section.scrollEnd : undefined}
        reverse={Boolean(section.reverse)}
        autoAnimate={Boolean(section.autoAnimate)}
        speed={typeof section.speed === 'number' ? section.speed : undefined}
        amplitude={typeof section.amplitude === 'number' ? section.amplitude : undefined}
      />
    </section>
  )
}
