'use client'

import GuideShareBar from '@/components/guide-share-bar'
import PortableTextContent from '@/components/portable-text-content'
import { cleanRuntimeString } from '@/lib/sanity/stega'

import { getDevSectionAttributes } from './dev/dev-trace'

const buildShareUrl = (page, site, pathname) => {
  const canonical = cleanRuntimeString(page?.seo?.canonicalUrl)
  if (canonical) {
    return canonical
  }
  if (site?.primaryDomain) {
    return `https://${site.primaryDomain}${pathname || '/'}`
  }
  return ''
}

// Returns share metadata only when this section is rendered inside a guide article.
const resolveGuideShare = (page, site, pathname, fallbackTitle) => {
  const pageSlug = cleanRuntimeString(page?.slug)
  const isGuideArticle = page?.pageType === 'post' && pageSlug.startsWith('guides/')
  if (!isGuideArticle) {
    return null
  }
  const url = buildShareUrl(page, site, pathname)
  if (!url) {
    return null
  }
  return { url, title: page?.seo?.title || page?.title || fallbackTitle }
}

const ArticleSection = ({
  section = null,
  sectionId = 'how-it-works',
  page = null,
  site = null,
  pathname = '',
}) => {
  const title = section?.title || ''
  const eyebrow = section?.eyebrow || ''
  const guideShare = resolveGuideShare(page, site, pathname, title)

  return (
    <section
      className="bg-background overflow-hidden"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/article-section.jsx',
        content: section ? 'story copy from Sanity-backed homepage section' : 'local fallback story copy',
        note: 'karaoke text reveal section',
      })}
    >
      <div className="mx-auto w-[min(72rem,calc(100%-3rem))] py-32 text-left">
        {eyebrow ? (
          <p className="text-muted-foreground mb-2 text-[0.65rem] tracking-[0.22em] uppercase">{eyebrow}</p>
        ) : null}
        <h2 className="font-500 type-accent m-0 max-w-210 text-[clamp(1.85rem,4vw,3.25rem)] tracking-[-0.02em] text-neutral-800">
          {title ? `${title} ` : null}
        </h2>
        {guideShare ? (
          <div className="mt-6">
            <GuideShareBar url={guideShare.url} title={guideShare.title} align="start" background={false} />
          </div>
        ) : null}
        <PortableTextContent value={section?.body} className="type-ui font-500 mt-6 text-neutral-800" />
      </div>
    </section>
  )
}

export default ArticleSection
