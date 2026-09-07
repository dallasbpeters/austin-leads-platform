import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildRuntimeKey } from '@/lib/sanity/stega'

export const StepsSection = ({ section, sectionId }) => {
  return (
    <section
      className="steps section-shell radial-grid-bg"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/steps-section.jsx',
        content: `steps section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/steps-section.jsx"
        content={`steps section from ${section?._type || 'page section'}`}
      />
      <div className="section-shell__inner">
        <div className="section-shell__intro">
          <h2 className="section-shell__title text-fluid-500">{section.title}</h2>
        </div>
        <div className="steps__grid">
          {section.items?.map((item, index) => (
            <Card key={buildRuntimeKey('step-item', item.title, index)} className="steps__card">
              <CardHeader className="steps__card-head">
                <Badge className="steps__index text-size-100">{index + 1}</Badge>
                <CardTitle className="steps__card-title text-size-200">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <PortableTextContent as="div" value={item.body} className="steps__card-body" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
