// oxlint-disable func-style

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import InstallProcess from '@/components/install-process'

import InstallProcessTimelineClient from './install-process-timeline-client'

export function InstallProcessSection({ section, sectionId }) {
  const items = section.items ?? []

  return (
    <section
      className="section-shell"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/install-process-section.jsx',
        content: `install process section from ${section._type || 'page section'}`,
      })}
    >
      <InstallProcess eyebrow={section.eyebrow} title={section.title} body={section.subtitle} />
      <DevTrace
        markup="src/components/platform/sections/install-process-section.jsx"
        content={`install process section from ${section._type || 'page section'}`}
      />
      <div className="section-shell__inner">
        <InstallProcessTimelineClient items={items} />
      </div>
    </section>
  )
}

export default InstallProcessSection
