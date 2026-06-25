import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import LogoCloud from '@/components/logo-cloud'
import PortableTextContent from '@/components/portable-text-content'

export function RoofingLogoCloudSection({ section = {}, sectionId }) {
  return (
    <section
      className="bg-card border-border/60 border-b"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/roofing-logo-cloud-section.jsx',
        content: `logos marquee section from ${section?._type || 'local fallback section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/roofing-logo-cloud-section.jsx"
        content={`logos marquee section from ${section?._type || 'local fallback section'}`}
      />
      <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-10">
        {section?.title || section?.body ? (
          <div className="pt-16 text-left">
            {section?.title ? <h2 className="text-xl tracking-normal md:text-2xl">{section.title}</h2> : null}
            {section?.body ? (
              <PortableTextContent
                as="div"
                value={section.body}
                className="text-muted-foreground mx-auto mt-4 max-w-3xl text-[1rem] leading-8"
              />
            ) : null}
          </div>
        ) : null}
        <LogoCloud items={section?.items} />
      </div>
    </section>
  )
}
