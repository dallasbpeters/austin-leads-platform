import Link from 'next/link'

import PortableTextContent from '@/components/portable-text-content'
import { cleanRuntimeHref } from '@/lib/sanity/stega'

function parseColorToRgb(value) {
  if (typeof value !== 'string') return null
  const color = value.trim()

  const shortHexMatch = color.match(/^#([0-9a-f]{3})$/i)
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('').map((part) => Number.parseInt(`${part}${part}`, 16))
    return { r, g, b }
  }

  const hexMatch = color.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i)
  if (hexMatch) {
    const hex = hexMatch[1]
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    }
  }

  const rgbMatch = color.match(/^rgba?\(([^)]+)\)$/i)
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((part) => Number.parseFloat(part.trim()))
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      return { r: parts[0], g: parts[1], b: parts[2] }
    }
  }

  return null
}

function getContrastTextBase(color) {
  const rgb = parseColorToRgb(color)
  if (!rgb) return '#111111'

  const toLinear = (channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  const luminance = 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
  return luminance > 0.35 ? '#111111' : '#ffffff'
}

export function SecondaryCTASection({ section, sectionId }) {
  const ctaLabel = section?.ctaLabel || 'Request a free roofing inspection'
  const ctaHref = section?.ctaHref?.startsWith('/')
    ? cleanRuntimeHref(section.ctaHref)
    : '/free-roofing-inspection'
  const resolvedColor = section?.color || 'var(--color-sweetcorn)'
  const contrastBase = getContrastTextBase(resolvedColor)
  const blendedTextColor = `color-mix(in oklch, ${resolvedColor} 10%, ${contrastBase})`

  return (
    <section id={sectionId} className="bg-card border-border/60 scroll-mt-38 border-b">
      <div className="mx-auto max-w-7xl px-3 py-10 md:px-6 lg:px-10">
        <Link
          href={ctaHref}
          className="block rounded-2xl border border-white/12 py-8"
          style={{ backgroundColor: resolvedColor, color: blendedTextColor }}
        >
          <div className="grid content-end items-center justify-end gap-6 md:grid-cols-1">
            <div className="space-y-3">
              <h2 className="text-center text-2xl font-semibold tracking-normal text-inherit md:text-3xl">
                {section?.title || 'Secondary CTA section'}
              </h2>
              {section?.body ? (
                <PortableTextContent
                  as="div"
                  value={section.body}
                  className="mx-auto max-w-3xl text-center leading-7 text-inherit/85"
                />
              ) : (
                <p className="mx-auto max-w-3xl text-center leading-7 text-inherit">Secondary CTA section</p>
              )}
            </div>
            <div className="inline-flex w-fit items-center gap-3 place-self-center rounded-full border border-inherit px-5 py-3 text-sm font-semibold text-inherit">
              {ctaLabel}
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
