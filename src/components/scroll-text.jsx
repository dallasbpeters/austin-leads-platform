'use client'

import { resolveIconoirIcon } from '@/lib/resolve-icon'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { Fragment, useLayoutEffect, useRef, useState } from 'react'

import TexasFlag from '@/components/texas-flag'

function useElementWidth(ref) {
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (!ref.current) {
        return
      }
      setWidth(ref.current.offsetWidth)
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [ref])

  return width
}

function wrap(min, max, value) {
  const range = max - min
  const mod = (((value - min) % range) + range) % range
  return mod + min
}

function renderOptionalIcon(iconName, textColor, fontSize) {
  if (!iconName || typeof iconName !== 'string') {
    return null
  }

  const iconSize = typeof fontSize === 'number' ? fontSize : Number.parseFloat(fontSize) || 18
  const normalized = iconName.trim()
  const isTexasFlag = ['TexasFlag', 'texasFlag', 'texas-flag', 'tx-flag'].includes(normalized)

  if (isTexasFlag) {
    return <TexasFlag width={iconSize} height={iconSize} style={{ marginRight: 10, flexShrink: 0 }} />
  }

  const IconComponent = resolveIconoirIcon(normalized)
  if (!IconComponent) {
    return null
  }

  return <IconComponent color={textColor} width={iconSize} height={iconSize} style={{ marginRight: 10 }} />
}

function renderTexasFlag(textColor, fontSize) {
  return <TexasFlag color={textColor} width={fontSize} height={fontSize} />
}

function CityNames({ items, duplicate = false }) {
  return items.map((item) => (
    <Fragment key={item._key}>
      {item.slug ? (
        <a
          className="scroll-text__link"
          href={`/${item.slug.replace(/^\/+/, '')}`}
          tabIndex={duplicate ? -1 : undefined}
        >
          {item.label}
        </a>
      ) : (
        <span>{item.label}</span>
      )}
      <span aria-hidden="true">{' • '}</span>
    </Fragment>
  ))
}

function VelocityText({
  children,
  items,
  baseVelocity,
  startPosition,
  damping,
  stiffness,
  numCopies,
  showIcon,
  showFlag,
  icon,
  velocityMapping,
  fontSize,
  textColor,
  style,
}) {
  const copyRef = useRef(null)
  const pausedRef = useRef(false)
  const reduceMotion = useReducedMotion()
  const copyWidth = useElementWidth(copyRef)
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness })
  const velocityFactor = useTransform(smoothVelocity, velocityMapping.input, velocityMapping.output, {
    clamp: false,
  })
  const x = useTransform(baseX, (value) => {
    if (copyWidth === 0) {
      return `${startPosition}px`
    }
    const wrapped = wrap(-copyWidth, 0, value)
    return `${wrapped + startPosition}px`
  })

  const baseDirection = baseVelocity >= 0 ? 1 : -1
  const scrollDirectionRef = useRef(baseDirection)

  useAnimationFrame((_, delta) => {
    if (pausedRef.current || reduceMotion) {
      return
    }
    const velocityValue = velocityFactor.get()

    if (velocityValue < 0) {
      scrollDirectionRef.current = -baseDirection
    } else if (velocityValue > 0) {
      scrollDirectionRef.current = baseDirection
    } else {
      scrollDirectionRef.current = baseDirection
    }

    const moveBy = scrollDirectionRef.current * Math.abs(baseVelocity) * (delta / 1000)
    const additional = scrollDirectionRef.current * Math.abs(moveBy) * Math.abs(velocityValue)
    baseX.set(baseX.get() + moveBy + additional)
  })

  const resolvedTextColor =
    typeof textColor === 'string' ? textColor : textColor?.hex || textColor?.color?.hex || 'currentColor'

  const spans = []
  for (let index = 0; index < numCopies; index += 1) {
    spans.push(
      <span
        key={index}
        className="scroll-text__copy"
        aria-hidden={index > 0 ? true : undefined}
        ref={index === 0 ? copyRef : null}
        style={{
          flexShrink: 0,
          fontSize: fontSize || '24px',
          color: resolvedTextColor,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          whiteSpace: 'pre',
          ...style,
          ...(showIcon ? { display: 'inline-flex', alignItems: 'center' } : {}),
        }}
      >
        {items ? <CityNames items={items} duplicate={index > 0} /> : children}
        {showIcon ? renderOptionalIcon(icon, resolvedTextColor, fontSize) : null}
        {showFlag ? renderTexasFlag(resolvedTextColor, fontSize) : null}
      </span>,
    )
  }

  return (
    <div
      className="scroll-text__viewport"
      onPointerEnter={() => {
        pausedRef.current = true
      }}
      onPointerLeave={() => {
        pausedRef.current = false
      }}
      onFocus={() => {
        pausedRef.current = true
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) pausedRef.current = false
      }}
    >
      <motion.div
        className="scroll-text__track"
        style={{
          x,
          display: 'flex',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--primary-foreground)',
        }}
      >
        {spans}
      </motion.div>
    </div>
  )
}

export default function ScrollVelocity(props) {
  const {
    texts = [{ text: 'Texas Solar and Roofing Pros' }, { text: 'Texas Solar and Roofing Pros' }],
    linkedItems,
    showIcon = false,
    velocity = 100,
    direction = 'left',
    startPosition = 0,
    damping = 50,
    stiffness = 400,
    numCopies = 6,
    velocityInputMin = 0,
    velocityInputMax = 1000,
    velocityOutputMin = 0,
    velocityOutputMax = 5,
    fontSize,
    textColor,
    showFlag = false,
    style = {},
  } = props || {}

  const velocityMapping = {
    input: [velocityInputMin, velocityInputMax],
    output: [velocityOutputMin, velocityOutputMax],
  }
  const directionMultiplier = direction === 'left' ? 1 : -1
  const rows = linkedItems?.length ? [{ items: linkedItems, icon: texts[0]?.icon }] : texts

  return (
    <div
      className="scroll-text"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: 'var(--color-primary)',
        ...style,
      }}
    >
      {rows.map((item, index) => {
        const textContent = typeof item === 'string' ? item : item?.text
        const itemIcon = showFlag ? 'TexasFlag' : typeof item === 'string' ? undefined : item?.icon
        const rowMultiplier = index % 2 !== 0 ? -1 : 1
        const finalVelocity = velocity * directionMultiplier * rowMultiplier

        return (
          <VelocityText
            key={index}
            items={item?.items}
            baseVelocity={finalVelocity}
            startPosition={startPosition}
            damping={damping}
            stiffness={stiffness}
            numCopies={numCopies}
            velocityMapping={velocityMapping}
            fontSize={fontSize}
            textColor={textColor}
            showIcon={showIcon}
            icon={itemIcon}
          >
            {textContent || ''}&nbsp;
          </VelocityText>
        )
      })}
    </div>
  )
}
