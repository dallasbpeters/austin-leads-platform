import { Badge } from '@/components/ui/badge'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'

export function StorySection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-background border-b border-border/60"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/StorySection.jsx',
        content: `story section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/StorySection.jsx"
        content={`story section from ${section?._type || 'page section'}`}
      />
      <div className="grid max-w-7xl mx-auto px-3 md:px-6 py-24 lg:px-10 grid-cols-1 place-items-start">
        {section.eyebrow ? (
          <Badge variant="outline" className="text-foreground bg-secondary border-secondary/20">
            {section.eyebrow}
          </Badge>
        ) : null}
        <h2 className="max-w-5xl w-full mt-6 font-display text-3xl text-foreground tracking-tight md:text-4xl">
          {section.title}
        </h2>
        <PortableTextContent
          as="div"
          value={section.body}
          className="max-w-5xl mt-6 leading-8 text-lg text-muted-foreground"
        />
      </div>
    </section>
  )
}
