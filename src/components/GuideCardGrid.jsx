'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as IconoirIcons from 'iconoir-react'
import {
  AirConditioner,
  AreaSearch,
  BatteryCharging,
  Car,
  Flash,
  HomeShield,
  HomeSimple,
  Thunderstorm,
  WindowTabs,
  Wrench,
} from 'iconoir-react'

import { Badge } from '@/components/ui/badge'
import { buildRuntimeKey, cleanRuntimeHref } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

const defaultPalette = [
  'bg-[var(--color-metterhorn)] text-white',
  'bg-primary text-primary-foreground',
  'bg-[var(--color-sweetcorn)] text-foreground',
  'bg-[var(--color-secondary-alt)] text-secondary-foreground',
  'bg-[var(--color-tidal)] text-foreground',
  'bg-[var(--color-blue-400)] text-white',
  'bg-secondary text-secondary-foreground',
  'bg-[var(--color-tasman)] text-foreground',
  'bg-[var(--color-voodoo)] text-white',
  'bg-[var(--color-chalet-green)] text-white',
  'bg-[var(--color-heather)] text-foreground',
  'bg-[var(--color-wattle)] text-foreground',
  'bg-[var(--color-charade)] text-white',
  'bg-[var(--color-ceramic)] text-foreground',
  'bg-[var(--color-tapa-green)] text-white',
  'bg-[var(--color-sea-mist)] text-foreground',
  'bg-[var(--color-black-current)] text-white',
  'bg-[var(--color-confetti)] text-foreground',
]

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

const serviceIconMap = {
  audit: AreaSearch,
  insulation: HomeShield,
  ducts: AirConditioner,
  windows: WindowTabs,
  heatpump: AirConditioner,
  solarbattery: BatteryCharging,
  detachreset: Wrench,
  shingles: HomeSimple,
  metalroofing: HomeSimple,
  stormdamage: Thunderstorm,
  commercialroofing: HomeSimple,
  hailinspection: Thunderstorm,
  rodent: HomeShield,
  electrical: Flash,
  evcharger: Car,
}

function resolveGuideCardIcon(iconName) {
  if (typeof iconName !== 'string') return null
  const normalizedName = iconName.trim()
  if (!normalizedName) return null

  if (serviceIconMap[normalizedName]) {
    return serviceIconMap[normalizedName]
  }

  if (IconoirIcons[normalizedName]) {
    return IconoirIcons[normalizedName]
  }

  return null
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
  }
}

function GuideCardBody({ card }) {
  const CardIcon = resolveGuideCardIcon(card.icon)

  return (
    <motion.article
      animate="rest"
      className={cn(
        "flex flex-col h-full min-h-[380px] p-6 border-0 rounded-xl shadow-theme-sm overflow-hidden",
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
      <div className="flex items-center justify-between text-current/88">
        {CardIcon ? <CardIcon className="size-6" /> : <ArrowIcon />}
        {card.number ? <span className="font-semibold text-[2rem]">{card.number}</span> : null}
      </div>
      {card.eyebrow ? (
        <p className="mt-4 font-semibold text-current/72 text-sm tracking-[0.18em] uppercase">
          {card.eyebrow}
        </p>
      ) : null}
      <h3 className="mt-4 leading-10 text-[2rem] tracking-tight">{card.title}</h3>
      <p className="mt-2 font-semibold leading-6 text-[0.95rem] text-current/88">{card.copy}</p>
      {card.category ? (
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-2 py-1 font-semibold text-[0.7rem] tracking-[0.12em] border border-current/30 rounded-full uppercase">
            {card.category}
          </span>
        </div>
      ) : null}
      {card.image ? (
        <div className="mt-6 rounded-lg overflow-hidden">
          <motion.img
            alt={card.imageAlt || card.title}
            className="h-56 w-full object-cover"
            src={card.image}
            variants={{
              rest: {
                scale: 1,
              },
              hover: {
                scale: 1.08,
              },
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
      ) : null}
      <div className="flex items-center gap-2 mt-auto pt-6 font-semibold text-current/88 text-sm">
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
    return ['All', ...Array.from(values)]
  }, [cards])

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const categoryMatch = selectedCategory === 'All' ? true : card.category === selectedCategory
      return categoryMatch
    })
  }, [cards, selectedCategory])

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

  return (
    <div>
      {enableFiltering ? (
        <div className="flex flex-wrap relative items-center gap-2.5 mb-6 sm:gap-3 z-20">
          {availableCategories.map((category) => {
            const isActive = selectedCategory === category

            return (
              <Badge
                asChild
                key={category}
                variant={isActive ? 'secondary' : 'outline'}
                className={
                  isActive
                    ? "px-4 py-1.5 text-sm text-white bg-secondary hover:bg-secondary/95"
                    : 'px-4 py-1.5 text-sm bg-background! hover:bg-background!'
                }
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedCategory(category)}
                  className="min-h-9 rounded-full cursor-pointer"
                >
                  {category}
                </button>
              </Badge>
            )
          })}
          <div className="ml-auto pt-1 sm:pt-0 font-bold text-muted-foreground text-sm basis-full sm:basis-auto">
            {filteredCards.length} {filteredCards.length === 1 ? 'guide' : 'guides'}
          </div>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        <motion.div
          ref={ref}
          animate={isInView ? 'visible' : 'hidden'}
          className={cn('grid gap-5 max-[900px]:grid-cols-1', columnsClassName, className)}
          initial="hidden"
          variants={containerVariants}
        >
          {paginatedCards.map((card, index) => (
            <motion.div
              key={buildRuntimeKey('guide-card', card.href, card.title, card.number, index)}
              variants={itemVariants}
            >
              <GuideCard card={card} toneClassName={defaultPalette[index % defaultPalette.length]} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {enableFiltering && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            className="px-3 py-2 text-foreground text-sm bg-background border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="px-3 py-2 text-foreground text-sm bg-background border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}

function GuideCard(props) {
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

export { GuideCard }

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
