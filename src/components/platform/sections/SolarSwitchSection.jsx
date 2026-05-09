import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import SolarSwitch from '@/components/SolarSwitch'

export function SolarSwitchSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-background border-b border-border/60"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/SolarSwitchSection.jsx',
        content: `solar switch section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/SolarSwitchSection.jsx"
        content={`solar switch section from ${section?._type || 'page section'}`}
      />
      <SolarSwitch
        leadingWords={
          Array.isArray(section.leadingWords) && section.leadingWords.length
            ? section.leadingWords
            : undefined
        }
        accentWord={section.accentWord || undefined}
        trailingText={section.trailingText || undefined}
      />
    </section>
  )
}
