import { toRuntimeToken } from '@/lib/sanity/stega'

export const CONSULTATION_ANCHOR_ID = 'consultation'

const DEFAULT_THEME_CLASS = 'texas-solar-and-roofing-pros-theme'

/**
 * Map a site slug to its theme class. Theme files live at
 * src/styles/{slug}-theme.css and define a matching .{slug}-theme class
 * with the standard shadcn-style token set.
 *
 * `site.themeSlug` overrides the derived class so a Sanity editor can
 * switch the look without renaming the site.
 */
export function getThemeClassForSite(site) {
  const explicit = site?.themeSlug
  if (typeof explicit === 'string' && explicit.trim()) {
    return `${explicit.trim()}-theme`
  }

  const slug = typeof site?.slug === 'string' ? site.slug.trim() : ''
  if (!slug) return DEFAULT_THEME_CLASS

  return `${slug}-theme`
}

/**
 * Convert a Sanity color object (from @sanity/color-input) into CSS variable
 * overrides for the three H/S/L root components that drive the full color
 * cascade. Theme files derive every numbered shade and shadcn slot
 * (--color-primary, --color-primary-700, --primary, ...) from these three
 * components, so overriding H/S/L re-tints the whole palette in one shot.
 *
 * Sanity stores s/l as 0–1 fractions; CSS expects percentages.
 */
export function brandColorHSLVars(color, prefix) {
  const hsl = color?.hsl
  if (!hsl || !Number.isFinite(hsl.h)) return {}
  return {
    [`--color-${prefix}-h`]: String(Math.round(hsl.h)),
    [`--color-${prefix}-s`]: `${Math.round(hsl.s * 100)}%`,
    [`--color-${prefix}-l`]: `${Math.round(hsl.l * 100)}%`,
  }
}

/**
 * Build the inline style overrides that inject Sanity-defined brand colors
 * onto the public-site wrapper element.
 *
 * Cascade contract:
 *   1. `src/styles/{slug}-theme.css` defines defaults at the themed scope —
 *      these are the source of truth for `--background`, `--foreground`, etc.
 *   2. This helper returns only the keys Sanity actually has a value for (e.g. HSL brand ramps).
 *   3. Optional `brand.surface.hex` sets `--site-surface` only (never replaces `--background`)
 *      so page backgrounds stay on the curated theme tokens unless a component reads `--site-surface`.
 *
 * To expose a new Sanity-driven token, add the field to `siteType.js`,
 * extend the GROQ projection in `content.js`, and add a branch below.
 */
export function getSiteBrandStyleVars(site) {
  const brand = site?.brand
  if (!brand) return {}

  const vars = {
    ...brandColorHSLVars(brand.primary, 'primary'),
    ...brandColorHSLVars(brand.secondary, 'secondary'),
    ...brandColorHSLVars(brand.accent, 'tertiary'),
  }

  // Surface chip is optional UI chrome only — do not overwrite `--background`.
  // Theme files (e.g. `.txchristmaslights-theme`) own page background tokens; pushing a
  // CMS hex here was overriding cream oklch with flat grays on production Sanity docs.
  if (brand.surface?.hex) {
    vars['--site-surface'] = brand.surface.hex
  }

  if (brand.heroTone?.hex) {
    vars['--site-hero-tone'] = brand.heroTone.hex
  }

  return vars
}

function slugifySectionToken(value) {
  return toRuntimeToken(value)
}

export function getSectionDomId(section, index) {
  if (section?.anchor) return slugifySectionToken(section.anchor)
  if (section?.id) return slugifySectionToken(section.id)

  const token = slugifySectionToken(section?.title || section?.eyebrow || section?.question || '')
  return token ? `${section.type}-${token}` : `${section.type}-${index + 1}`
}
