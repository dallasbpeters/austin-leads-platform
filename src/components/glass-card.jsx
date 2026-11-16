import { ArrowUpRight } from 'iconoir-react'
import Link from 'next/link'

import { surfaceTone } from '@/lib/platform/surface-tone'
import { cn } from '@/lib/utils'

/*
 * A frosted glass card: the hero's "Glass cards" and the glass banner above the
 * reviews. Styles live in solar-hero.css (.solar-hero__glass*).
 *
 * Optional design from Sanity:
 *   backgroundColor  the card color; the text turns dark or light to contrast with it
 *   eyebrowColor     the small label color (default gold; with a background color, the text color)
 *   frosted          false for a flat card with no blur or sheen
 * Without them the card looks exactly like the hero cards always have.
 */

/** CSS variables and modifier classes for a card's Sanity design fields. */
export function glassCardDesign(card) {
  const style = {}
  if (card?.backgroundColor) {
    style['--glass-bg'] = card.backgroundColor
  }
  if (card?.eyebrowColor) {
    style['--glass-eyebrow'] = card.eyebrowColor
  } else if (card?.backgroundColor) {
    // The default gold can vanish on a picked color (gold on red), so the label
    // follows the text, which already contrasts with the background.
    style['--glass-eyebrow'] = 'currentcolor'
  }
  // A light background needs dark text. surfaceTone returns null for colors it can't read.
  const isLight = surfaceTone(card?.backgroundColor) === 'light'
  return {
    style,
    className: cn(
      isLight && 'solar-hero__glass--light',
      card?.frosted === false && 'solar-hero__glass--flat',
    ),
  }
}

export default function GlassCard({ card, className, as: Tag = 'article' }) {
  const design = glassCardDesign(card)
  return (
    <Tag
      className={cn(
        'solar-hero__glass',
        card.imageUrl && 'solar-hero__glass--with-image',
        design.className,
        className,
      )}
      // oxlint-disable-next-line shadcn/no-inline-styles -- per-card colors chosen in Sanity
      style={design.style}
    >
      <div className="solar-hero__glass-head">
        <div className="solar-hero__glass-heading">
          <h2 className="solar-hero__glass-title">{card.title}</h2>
          {card.eyebrow ? <p className="solar-hero__glass-eyebrow">{card.eyebrow}</p> : null}
        </div>
        {card.stat ? <p className="solar-hero__glass-stat">{card.stat}</p> : null}
      </div>
      {card.body ? <p className="solar-hero__glass-body">{card.body}</p> : null}
      {card.href ? (
        <Link href={card.href} className="solar-hero__glass-link">
          <span className="solar-hero__glass-link-label">{card.linkLabel || 'Learn more'}</span>
          <span className="solar-hero__glass-link-icon" aria-hidden="true">
            <ArrowUpRight strokeWidth={2} />
          </span>
        </Link>
      ) : null}
      {card.imageUrl ? (
        // oxlint-disable-next-line next/no-img-element -- Sanity's CDN sizes the image (?w=800&h=400)
        <img
          src={`${card.imageUrl}?w=800&h=400&fit=crop&auto=format`}
          alt={card.imageAlt || ''}
          width={400}
          height={200}
          loading="lazy"
          className="solar-hero__glass-image"
        />
      ) : null}
    </Tag>
  )
}
