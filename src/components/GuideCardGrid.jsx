'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

const defaultPalette = ['bg-primary text-primary-foreground', 'bg-[var(--color-secondary-alt)] text-white', 'bg-[var(--color-blue-400)] text-white', 'bg-secondary text-secondary-foreground', 'bg-secondary text-secondary-foreground text-white', 'bg-[var(--color-blue-400)]  text-white']

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

function normalizeCardProps(props) {
  if (props.card) {
    return {
      ...props.card,
      className: props.className,
      toneClassName: props.toneClassName,
      eyebrow: props.eyebrow ?? props.card.eyebrow,
      ctaLabel: props.ctaLabel ?? props.card.ctaLabel,
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
  }
}

function GuideCardBody({ card }) {
  return (
    <motion.article
      animate="rest"
      className={cn('shadow-theme-sm flex min-h-[380px] h-full flex-col overflow-hidden rounded-xl border-0 p-6', card.toneClassName, card.className)}
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
        <ArrowIcon />
        {card.number ? <span className="text-[2rem] font-semibold">{card.number}</span> : null}
      </div>
      {card.eyebrow ? <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-current/72">{card.eyebrow}</p> : null}
      <h3 className="mt-4 text-[2rem] tracking-tight">{card.title}</h3>
      <p className="mt-2 text-[0.95rem] font-semibold leading-6 text-current/88">{card.copy}</p>
      {card.image ? (
        <div className="mt-6 overflow-hidden rounded-lg">
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
      <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-current/88">
        <SunIcon />
        <span>{card.ctaLabel || 'Learn more'}</span>
      </div>
    </motion.article>
  )
}

export default function GuideCardGrid({ cards = [], className, columnsClassName = 'md:grid-cols-3', palette = defaultPalette }) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.15,
  })

  return (
    <AnimatePresence initial={false}>
      <motion.div ref={ref} animate={isInView ? 'visible' : 'hidden'} className={cn('grid gap-5 max-[900px]:grid-cols-1', columnsClassName, className)} initial="hidden" variants={containerVariants}>
        {cards.map((card, index) => (
          <motion.div key={card.href || card.title} variants={itemVariants}>
            <GuideCard card={card} toneClassName={palette[index % palette.length]} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

function GuideCard(props) {
  const card = normalizeCardProps(props)

  if (!card.href) {
    return <GuideCardBody card={card} />
  }

  return (
    <Link href={card.href}>
      <GuideCardBody card={card} />
    </Link>
  )
}

export { GuideCard }

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h10v10"></path>
      <path d="M7 17 17 7"></path>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
