import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import LogoCloud from '@/components/logo-cloud'
import PortableTextContent from '@/components/portable-text-content'

const EMPTY_SECTION = {}

export const RoofingLogoCloudSection = ({ section = EMPTY_SECTION, sectionId }) => (
  <section
    className="logo-cloud-section section-shell section-shell--card"
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
    <div className="section-shell__inner section-shell__inner--flush">
      {section?.title || section?.body ? (
        <div className="logo-cloud-section__intro">
          {section?.title ? (
            <h2 className="logo-cloud-section__title text-size-200">{section.title}</h2>
          ) : null}
          {section?.body ? (
            <PortableTextContent
              as="div"
              value={section.body}
              className="logo-cloud-section__body text-size-100"
            />
          ) : null}
        </div>
      ) : null}
      <LogoCloud items={section?.items} />
    </div>
  </section>
)
