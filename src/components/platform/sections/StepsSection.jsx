import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildRuntimeKey } from '@/lib/sanity/stega'

export function StepsSection({ section, sectionId }) {
  return (
    <section
      className="bg-secondary-100 border-border/60 radial-grid-bg border-b"
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
      <div className="mx-auto max-w-7xl px-3 py-20 md:px-6 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-foreground text-3xl tracking-normal md:text-4xl">{section.title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
          {section.items?.map((item, index) => (
            <Card
              key={buildRuntimeKey('step-item', item.title, index)}
              className="bg-card border-border/80 pt-12 pb-8"
            >
              <CardHeader className="gap-4">
                <Badge className="text-secondary-foreground bg-primary border-primary ring-primary size-8 rounded-full text-lg ring-1">
                  {index + 1}
                </Badge>
                <CardTitle className="text-foreground text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <PortableTextContent
                  as="div"
                  value={item.body}
                  className="text-md text-muted-foreground leading-6"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
