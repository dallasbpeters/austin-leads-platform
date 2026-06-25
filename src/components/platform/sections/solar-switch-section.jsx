import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import SolarSwitch from '@/components/solar-switch'

export function SolarSwitchSection({ section, sectionId }) {
  return (
    <section
      className="bg-background border-border/60 border-b"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/solar-switch-section.jsx',
        content: `solar switch section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/solar-switch-section.jsx"
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
