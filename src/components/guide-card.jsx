'use client'

import { resolveIconoirIcon } from '@/lib/resolve-icon'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Flash,
  HomeShield,
  Thunderstorm,
  WindowTabs,
} from 'iconoir-react'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { buildRuntimeKey, cleanRuntimeHref } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

/*
 * Card tones map to `guide-card--tone-*` modifiers in guide-card.css. Sanity
 * stores the camelCase key; the palette below is the rotation used when a card
 * has no color of its own.
 */
const GUIDE_CARD_TONE_KEYS = [
  'primary',
  'sweetcorn',
  'voodoo',
  'tidal',
  'secondaryAlt',
  'blue400',
  'secondary',
  'tasman',
  'chaletGreen',
  'metterhorn',
  'heather',
  'wattle',
  'charade',
  'ceramic',
  'tapaGreen',
  'seaMist',
  'blackCurrent',
  'confetti',
]

const toneModifier = (key) =>
  `guide-card--tone-${key.replaceAll(/([a-z])([A-Z0-9])/gu, '$1-$2').toLowerCase()}`

function resolveGuideCardToneClass(colorKey, index) {
  if (typeof colorKey === 'string') {
    const normalizedKey = colorKey.trim()
    if (normalizedKey && GUIDE_CARD_TONE_KEYS.includes(normalizedKey)) {
      return toneModifier(normalizedKey)
    }
  }

  return toneModifier(GUIDE_CARD_TONE_KEYS[index % GUIDE_CARD_TONE_KEYS.length])
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function inferGuideCardIconFromText(value) {
  const text = String(value || '').toLowerCase()

  if (!text) {
    return null
  }
  if (text.includes('hail') || text.includes('storm')) {
    return Thunderstorm
  }
  if (text.includes('roof') || text.includes('insurance') || text.includes('warranty')) {
    return HomeShield
  }
  if (text.includes('audit') || text.includes('inspect')) {
    return AreaSearch
  }
  if (text.includes('duct')) {
    return AirConditioner
  }
  if (text.includes('window')) {
    return WindowTabs
  }
  if (text.includes('electrical')) {
    return Flash
  }
  if (text.includes('charger') || text.includes('ev')) {
    return Car
  }
  if (text.includes('battery') || text.includes('solar')) {
    return BatteryCharging
  }

  return null
}

function resolveGuideCardIcon(iconName, fallbackText = '') {
  if (typeof iconName !== 'string') {
    return inferGuideCardIconFromText(fallbackText)
  }
  const normalizedName = iconName.trim()
  if (!normalizedName) {
    return inferGuideCardIconFromText(fallbackText)
  }

  const namedIcon = resolveIconoirIcon(normalizedName)
  if (namedIcon) {
    return namedIcon
  }

  return inferGuideCardIconFromText(fallbackText)
}

function normalizeCardProps(props) {
  if (props.card) {
    return {
      ...props.card,
      className: props.className,
      toneClassName: props.toneClassName,
      eyebrow: props.eyebrow ?? props.card.eyebrow,
      ctaLabel: props.ctaLabel ?? props.card.ctaLabel,
      icon: props.icon ?? props.card.icon,
      color: props.color ?? props.card.color,
      editAttributes: props.editAttributes ?? props.card.editAttributes,
    }
  }

  return {
    number: props.number,
    eyebrow: props.eyebrow,
    title: props.title,
    copy: props.copy || props.body,
    href: props.href,
    image: props.image,
    imageAlt: props.imageAlt,
    className: props.className,
    toneClassName: props.toneClassName,
    ctaLabel: props.ctaLabel,
    icon: props.icon,
    color: props.color,
    editAttributes: props.editAttributes,
  }
}

function GuideCardBody({ card }) {
  const CardIcon = resolveGuideCardIcon(
    card.icon,
    `${card.title || ''} ${card.copy || ''} ${card.category || ''}`,
  )

  return (
    <motion.article
      animate="rest"
      className={cn('guide-card', card.toneClassName, card.className)}
      initial={false}
      variants={{
        rest: {
          y: 0,
          scale: 1,
        },
        hover: {
          y: -6,
          scale: 1.015,
        },
      }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover="hover"
    >
      <div className="guide-card__head">
        {CardIcon ? <CardIcon className="guide-card__icon" aria-hidden="true" /> : <ArrowIcon />}
        {card.number ? <span className="guide-card__number">{card.number}</span> : null}
      </div>
      {card.eyebrow ? <p className="guide-card__eyebrow">{card.eyebrow}</p> : null}
      <h3 className="guide-card__title">{card.title}</h3>
      <p className="guide-card__copy">{card.copy}</p>
      {card.category ? (
        <div className="guide-card__tags">
          <span className="guide-card__tag">{card.category}</span>
        </div>
      ) : null}
      {card.image ? (
        <div className="guide-card__media">
          <motion.div
            className="guide-card__media-motion"
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.08 },
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src={card.image}
              alt={card.imageAlt || card.title}
              fill
              quality={95}
              sizes="(max-width: 900px) 100vw, (max-width: 1280px) 50vw, 33vw"
              loading="lazy"
              className="guide-card__image"
            />
          </motion.div>
        </div>
      ) : null}
      <div className="guide-card__cta">
        <SunIcon />
        <span>{card.ctaLabel || 'Learn more'}</span>
      </div>
    </motion.article>
  )
}

export default function GuideCardGrid({
  cards = [],
  className,
  columnsClassName = 'md:grid-cols-3',
  enableFiltering = false,
  pageSize = 6,
  scrollTargetId = '',
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.15,
  })
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const safePageSize = Math.max(1, Number(pageSize) || 6)

  const availableCategories = useMemo(() => {
    const values = new Set(cards.map((card) => card.category).filter(Boolean))
    return ['All', ...values]
  }, [cards])

  const filteredCards = useMemo(
    () =>
      cards.filter((card) => {
        const categoryMatch = selectedCategory === 'All' ? true : card.category === selectedCategory
        return categoryMatch
      }),
    [cards, selectedCategory],
  )

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / safePageSize))

  const paginatedCards = useMemo(() => {
    if (!enableFiltering) {
      return cards
    }

    const start = (currentPage - 1) * safePageSize
    return filteredCards.slice(start, start + safePageSize)
  }, [cards, enableFiltering, filteredCards, currentPage, safePageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function scrollToPaginationTarget() {
    if (typeof window === 'undefined') {
      return
    }

    const target = scrollTargetId ? document.querySelector(`#${scrollTargetId}`) : ref.current
    if (!target) {
      return
    }

    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function handlePageChange(nextPage) {
    if (nextPage === currentPage) {
      return
    }
    setCurrentPage(nextPage)
    scrollToPaginationTarget()
  }

  return (
    <div className="guide-grid">
      {enableFiltering ? (
        <div className="guide-grid__filters">
          {availableCategories.map((category) => {
            const isActive = selectedCategory === category

            return (
              <Badge
                asChild
                key={category}
                variant={isActive ? 'secondary' : 'outline'}
                className={cn('guide-grid__filter', isActive && 'guide-grid__filter--active')}
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedCategory(category)}
                  className="guide-grid__filter-button"
                >
                  {category}
                </button>
              </Badge>
            )
          })}
          <div className="guide-grid__count">
            {filteredCards.length} {filteredCards.length === 1 ? 'guide' : 'guides'}
          </div>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        <motion.div
          ref={ref}
          animate={isInView ? 'visible' : 'hidden'}
          className={cn('guide-grid__cards', columnsClassName, className)}
          initial="hidden"
          variants={containerVariants}
        >
          {paginatedCards.map((card, index) => (
            <motion.div
              key={buildRuntimeKey('guide-card', card.href, card.title, card.number, index)}
              {...(card.editAttributes || {})}
              variants={itemVariants}
            >
              <GuideCard card={card} toneClassName={resolveGuideCardToneClass(card.color, index)} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {enableFiltering && totalPages > 1 ? (
        <div className="guide-grid__pagination">
          <button
            type="button"
            className="guide-grid__page-button"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="guide-grid__page-status">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="guide-grid__page-button"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function GuideCard(props) {
  const card = normalizeCardProps(props)
  const href = cleanRuntimeHref(card.href)

  if (!href) {
    return <GuideCardBody card={card} />
  }

  return (
    <Link href={href}>
      <GuideCardBody card={card} />
    </Link>
  )
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 7h10v10"></path>
      <path d="M7 17 17 7"></path>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  )
}
