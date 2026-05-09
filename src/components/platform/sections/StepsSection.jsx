import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { buildRuntimeKey } from '@/lib/sanity/stega'

export function StepsSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-secondary-100 border-b border-border/60 radial-grid-bg"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/StepsSection.jsx',
        content: `steps section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/StepsSection.jsx"
        content={`steps section from ${section?._type || 'page section'}`}
      />
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl text-foreground tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
          {section.items?.map((item, index) => (
            <Card
              key={buildRuntimeKey('step-item', item.title, index)}
              className="pb-8 pt-12 bg-card border-border/80"
            >
              <CardHeader className="gap-4">
                <Badge className="text-lg text-secondary-foreground bg-primary border-primary rounded-full ring-1 ring-primary size-8">
                  {index + 1}
                </Badge>
                <CardTitle className="text-foreground text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <PortableTextContent
                  as="div"
                  value={item.body}
                  className="leading-6 text-md text-muted-foreground"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
