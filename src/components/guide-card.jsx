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

const defaultPalette = [
  'bg-primary text-[contrast-color(var(--color-primary))]',
  'bg-[var(--color-sweetcorn)] text-[contrast-color(var(--color-sweetcorn))]',
  'bg-[var(--color-voodoo)] text-[contrast-color(var(--color-voodoo))] ',
  'bg-[var(--color-tidal)] text-[contrast-color(var(--color-tidal))] ',
  'bg-[var(--color-secondary-alt)] text-[contrast-color(var(--color-secondary-alt))] ',
  'bg-[var(--color-blue-400)] text-[contrast-color(var(--color-blue-400))] ',
  'bg-secondary text-[contrast-color(var(--color-secondary))] ',
  'bg-[var(--color-tasman)] text-[contrast-color(var(--color-tasman))] ',
  'bg-[var(--color-chalet-green)] text-[contrast-color(var(--color-chalet-green))] ',
  'bg-[var(--color-metterhorn)] text-[contrast-color(var(--color-metterhorn))] ',
  'bg-[var(--color-heather)] text-[contrast-color(var(--color-heather))] ',
  'bg-[var(--color-wattle)] text-[contrast-color(var(--color-wattle))] ',
  'bg-[var(--color-charade)] text-[contrast-color(var(--color-charade))] ',
  'bg-[var(--color-ceramic)] text-[contrast-color(var(--color-ceramic))] ',
  'bg-[var(--color-tapa-green)] text-[contrast-color(var(--color-tapa-green))] ',
  'bg-[var(--color-sea-mist)] text-[contrast-color(var(--color-sea-mist))] ',
  'bg-[var(--color-black-current)] text-[contrast-color(var(--color-black-current))] ',
  'bg-[var(--color-confetti)] text-[contrast-color(var(--color-confetti))] ',
]

const guideCardToneClassByKey = {
  primary: 'bg-primary text-[contrast-color(var(--color-primary))]',
  sweetcorn: 'bg-[var(--color-sweetcorn)] text-[contrast-color(var(--color-sweetcorn))]',
  voodoo: 'bg-[var(--color-voodoo)] text-[contrast-color(var(--color-voodoo))]',
  tidal: 'bg-[var(--color-tidal)] text-[contrast-color(var(--color-tidal))]',
  secondaryAlt: 'bg-[var(--color-secondary-alt)] text-[contrast-color(var(--color-secondary-alt))]',
  blue400: 'bg-[var(--color-blue-400)] text-[contrast-color(var(--color-blue-400))]',
  secondary: 'bg-secondary text-[contrast-color(var(--color-secondary))]',
  tasman: 'bg-[var(--color-tasman)] text-[contrast-color(var(--color-tasman))]',
  chaletGreen: 'bg-[var(--color-chalet-green)] text-[contrast-color(var(--color-chalet-green))]',
  metterhorn: 'bg-[var(--color-metterhorn)] text-[contrast-color(var(--color-metterhorn))]',
  heather: 'bg-[var(--color-heather)] text-[contrast-color(var(--color-heather))]',
  wattle: 'bg-[var(--color-wattle)] text-[contrast-color(var(--color-wattle))]',
  charade: 'bg-[var(--color-charade)] text-[contrast-color(var(--color-charade))]',
  ceramic: 'bg-[var(--color-ceramic)] text-[contrast-color(var(--color-ceramic))]',
  tapaGreen: 'bg-[var(--color-tapa-green)] text-[contrast-color(var(--color-tapa-green))]',
  seaMist: 'bg-[var(--color-sea-mist)] text-[contrast-color(var(--color-sea-mist))]',
  blackCurrent: 'bg-[var(--color-black-current)] text-[contrast-color(var(--color-black-current))]',
  confetti: 'bg-[var(--color-confetti)] text-[contrast-color(var(--color-confetti))]',
}

function resolveGuideCardToneClass(colorKey, index) {
  if (typeof colorKey === 'string') {
    const normalizedKey = colorKey.trim()
    if (normalizedKey && guideCardToneClassByKey[normalizedKey]) {
      return guideCardToneClassByKey[normalizedKey]
    }
  }

  return defaultPalette[index % defaultPalette.length]
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
      className={cn(
        'grid-columns-1 shadow-theme-sm grid h-full min-h-95 grid-rows-[auto_auto_auto_1fr_auto] items-start justify-start overflow-hidden rounded-xl border-0 p-6',
        card.toneClassName,
        card.className,
      )}
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
      <div className="grid grid-cols-2 items-start text-current/88">
        {CardIcon ? <CardIcon className="size-8" aria-hidden="true" /> : <ArrowIcon />}
        {card.number ? (
          <span className="w-full text-right text-[2rem] font-semibold">{card.number}</span>
        ) : null}
      </div>
      {card.eyebrow ? (
        <p className="mt-4 text-sm font-semibold tracking-[0.18em] text-current/72 uppercase">
          {card.eyebrow}
        </p>
      ) : null}
      <h3 className="text-[2rem] leading-10 tracking-normal">{card.title}</h3>
      <p className="font-wght-450 mt-2 text-[0.95rem] leading-6 text-current/88">{card.copy}</p>
      {card.category ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-current/30 px-2 py-1 text-[0.7rem] font-semibold tracking-[0.12em] uppercase">
            {card.category}
          </span>
        </div>
      ) : null}
      {card.image ? (
        <div className="relative mt-6 h-56 w-full overflow-hidden rounded-lg after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-black/10 after:content-[''] after:ring-inset">
          <motion.div
            className="absolute inset-0"
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
              className="object-cover"
            />
          </motion.div>
        </div>
      ) : null}
      <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-current/88">
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

  const minWidth = '350px'

  return (
    <div>
      {enableFiltering ? (
        <div className="relative z-20 mb-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
          {availableCategories.map((category) => {
            const isActive = selectedCategory === category

            return (
              <Badge
                asChild
                key={category}
                variant={isActive ? 'secondary' : 'outline'}
                className={
                  isActive
                    ? 'bg-secondary hover:bg-secondary/95 px-4 py-1.5 text-sm text-white'
                    : 'bg-background! hover:bg-background! px-4 py-1.5 text-sm'
                }
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedCategory(category)}
                  className="min-h-9 cursor-pointer rounded-full"
                >
                  {category}
                </button>
              </Badge>
            )
          })}
          <div className="text-muted-foreground ml-auto basis-full pt-1 text-sm font-bold sm:basis-auto sm:pt-0">
            {filteredCards.length} {filteredCards.length === 1 ? 'guide' : 'guides'}
          </div>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        <motion.div
          ref={ref}
          animate={isInView ? 'visible' : 'hidden'}
          className={cn(columnsClassName, className)}
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
          }}
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
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-foreground bg-background border-border rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="text-foreground bg-background border-border rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
