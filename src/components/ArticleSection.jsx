'use client'

import PortableTextContent from '@/components/PortableTextContent'

import { getDevSectionAttributes } from './dev/DevTrace'

export default function ArticleSection({ section = null, sectionId = 'how-it-works' }) {
  const title = section?.title || ''
  const eyebrow = section?.eyebrow || ''

  return (
    <section
      className="bg-background overflow-hidden"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/ArticleSection.jsx',
        content: section ? 'story copy from Sanity-backed homepage section' : 'local fallback story copy',
        note: 'karaoke text reveal section',
      })}
    >
      <div className="mx-auto w-[min(72rem,calc(100%-3rem))] py-32 text-left">
        {eyebrow ? (
          <p className="text-muted-foreground mb-2 text-[0.65rem] tracking-[0.22em] uppercase">{eyebrow}</p>
        ) : null}
        <h2 className="font-500 type-accent m-0 max-w-210 text-[clamp(1.5rem,4vw,2.25rem)] tracking-[-0.02em] text-neutral-800">
          {title ? `${title} ` : null}
        </h2>
        <PortableTextContent value={section?.body} className="type-ui font-500 mt-6 text-neutral-800" />
      </div>
    </section>
  )
}
