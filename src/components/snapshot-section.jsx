import { Clock, Leaf, StatUp, Wallet } from 'iconoir-react'

import { cardToneCssVar } from '@/lib/platform/card-tones'
import { getHeroVideoSource, getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { resolveIconoirIcon } from '@/lib/resolve-icon'
import { cn } from '@/lib/utils'

import Card from './card'
import CloudSectionBackground from './cloud-section-background'
import { getDevSectionAttributes } from './dev/dev-trace'
import PortableTextContent from './portable-text-content'

const fallbackItems = [
  {
    icon: 'solar:wallet-money-linear',
    value: '$18k-$28k',
    copy: 'Typical residential solar range before credits and roof-related adders',
  },
  {
    icon: 'solar:chart-square-linear',
    value: '10+ years',
    copy: 'Roof age is where insurance and timing questions usually start',
  },
  {
    icon: 'solar:leaf-linear',
    value: '2 years',
    copy: 'A common claim window for detach-and-reset conversations after roof work',
  },
  {
    icon: 'solar:history-linear',
    value: '7–9 years',
    copy: 'Typical solar payback range once the roof plan is already solid',
  },
]

function inferSnapshotIcon(item) {
  const text = `${item?.value || ''} ${item?.copy || ''}`.toLowerCase()

  if (text.includes('payback') || text.includes('savings') || text.includes('$')) {
    return Wallet
  }
  if (text.includes('year') || text.includes('timeline') || text.includes('window')) {
    return Clock
  }
  if (text.includes('roof') || text.includes('claim') || text.includes('insurance')) {
    return StatUp
  }
  if (text.includes('solar') || text.includes('energy')) {
    return Leaf
  }

  return StatUp
}

/*
 * Shapes one Sanity snapshotItem for render. The big number leads; when a card
 * has only a title, the title takes the number's place. Media resolution
 * follows the hero: uploaded asset first, then Unsplash metadata, then a raw
 * URL; video beats image when both are set.
 */
function resolveItem(item, index) {
  const imageUrl = getImageUrl(item.imageAsset, item.image) || item.imageUrl || ''
  const video = getHeroVideoSource(item.video, item.videoAsset, { posterWidth: 800 })

  return {
    key: item._key || `${item.number || item.title || 'snapshot'}-${index}`,
    icon: item.icon || fallbackItems[index]?.icon || 'solar:wallet-money-linear',
    value: item.number || item.title,
    label: item.number && item.title ? item.title : '',
    copy: item.body || fallbackItems[index]?.copy || '',
    tone: cardToneCssVar(item.color),
    imageUrl,
    imageAlt: getImageAlt(item.imageAsset, item.image, ''),
    video,
  }
}

function SnapshotIcon({ item }) {
  const Icon = (item.icon && resolveIconoirIcon(item.icon)) || inferSnapshotIcon(item)
  return <Icon className="snapshot__icon-svg" strokeWidth={2} aria-hidden="true" />
}

function SnapshotMedia({ item }) {
  if (item.video) {
    return (
      <div className="snapshot__media" aria-hidden="true">
        <video
          className="snapshot__media-video"
          autoPlay={item.video.autoplay}
          loop={item.video.loop}
          muted={item.video.muted}
          playsInline={item.video.playsInline}
          poster={item.video.poster || item.imageUrl || undefined}
          preload="metadata"
        >
          <source src={item.video.src} type={item.video.type || undefined} />
        </video>
      </div>
    )
  }

  if (item.imageUrl) {
    return (
      <div className="snapshot__media">
        <img className="snapshot__media-image" src={item.imageUrl} alt={item.imageAlt} loading="lazy" />
      </div>
    )
  }

  return null
}

function SnapshotCard({ item }) {
  const hasMedia = Boolean(item.video || item.imageUrl)
  const toned = Boolean(item.tone) && !hasMedia

  return (
    <Card
      className={cn('snapshot__card', toned && 'snapshot__card--toned', hasMedia && 'snapshot__card--media')}
      style={toned ? { '--snapshot-card-tone': item.tone } : undefined}
      variant="darkGlass"
    >
      <SnapshotMedia item={item} />
      <div className="snapshot__icon">
        <SnapshotIcon item={item} />
      </div>
      <div className="snapshot__value text-size-400">{item.value}</div>
      {item.label ? <p className="snapshot__label text-size-90">{item.label}</p> : null}
      <PortableTextContent as="div" value={item.copy} className="snapshot__copy text-size-90" />
    </Card>
  )
}

export default function SnapshotSection({ section = null, sectionId = 'texas-snapshot' }) {
  const eyebrow = section?.eyebrow || 'Texas Snapshot'
  const title = section?.title || 'The numbers people usually ask for.'
  const body =
    section?.body ||
    "Most homeowners walk into their first quote with zero frame of reference. These are the cost ranges, timelines, and coverage benchmarks we see on Central Texas projects — so you're not starting from scratch. Your numbers will vary based on roof size, material, and carrier, but at least you'll know what ballpark you're in."
  const items = section?.items?.length
    ? section.items.map(resolveItem)
    : fallbackItems.map((item, index) => ({ ...item, key: `fallback-${index}` }))
  const showClouds =
    section?.cloudVisibility !== 'hide' &&
    section?.cloudVisibility !== 'off' &&
    section?.cloudVisibility !== false

  return (
    <CloudSectionBackground
      className="snapshot cloud-theme-section--metrics"
      density="regular"
      showClouds={showClouds}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/snapshot-section.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="snapshot__glyph">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="snapshot__glyph-svg"
          aria-hidden="true"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="6"></circle>
            <path
              strokeLinecap="round"
              d="M12 2v1m0 18v1m10-10h-1M3 12H2m17.07-7.07l-.392.393M5.322 18.678l-.393.393m14.141-.001l-.392-.393M5.322 5.322l-.393-.393"
            ></path>
          </g>
        </svg>
      </div>

      <div className="snapshot__shell">
        <div className="snapshot__intro">
          <p className="snapshot__eyebrow text-size-90 cloud-theme-section__eyebrow">{eyebrow}</p>
          <h2 className="snapshot__title text-fluid-500 cloud-theme-section__heading">{title}</h2>
          <PortableTextContent
            as="div"
            value={body}
            className="snapshot__body text-size-100 cloud-theme-section__body"
          />
        </div>

        <div className="snapshot__grid">
          {items.map((item) => (
            <SnapshotCard key={item.key} item={item} />
          ))}
        </div>
      </div>
    </CloudSectionBackground>
  )
}
