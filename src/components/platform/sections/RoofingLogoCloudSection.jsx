import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import LogoCloud from '@/components/logo-cloud'
import PortableTextContent from '@/components/PortableTextContent'

export function RoofingLogoCloudSection({ section = {}, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-card border-border/60 border-b"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/RoofingLogoCloudSection.jsx',
        content: `logos marquee section from ${section?._type || 'local fallback section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/RoofingLogoCloudSection.jsx"
        content={`logos marquee section from ${section?._type || 'local fallback section'}`}
      />
      <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-10">
        {section?.title || section?.body ? (
          <div className="pt-16 text-left">
            {section?.title ? <h2 className="text-xl tracking-tight md:text-2xl">{section.title}</h2> : null}
            {section?.body ? (
              <PortableTextContent
                as="div"
                value={section.body}
                className="text-muted-foreground mx-auto mt-4 max-w-3xl text-base leading-8"
              />
            ) : null}
          </div>
        ) : null}
        <LogoCloud items={section?.items} />
      </div>
    </section>
  )
}
