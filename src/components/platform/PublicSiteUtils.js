import { toRuntimeToken } from '@/lib/sanity/stega'

export const CONSULTATION_ANCHOR_ID = 'consultation'

/** Collage art for TX Christmas hero + `/api/og` (also `public/images/…`). */
export const TX_CHRISTMAS_PUBLIC_COLLAGE_SRC = '/images/tx-christmas-hero-collage.png'

/** Wordmark PNG for nav + Open Graph `og:logo`. */
export const TX_CHRISTMAS_PUBLIC_LOGO_SRC = '/images/tx-christmas-logo-full.png'

/** Values that match `[data-public-site="…"]` blocks in *-theme.css. */
const KNOWN_PUBLIC_SITE_ATTRS = new Set(['texas-solar-and-roofing-pros', 'txchristmaslights'])

/**
 * `data-public-site` on `<html>` (public routes) so tenant CSS scopes match
 * the Medium-style pattern and portals inherit tokens. Operator shells omit
 * this attribute; see `proxy.js` + `src/app/layout.jsx`.
 */
export function getPublicDataSiteAttribute(site) {
  if (isTxChristmasLightsSite(site)) return 'txchristmaslights'
  const explicit = typeof site?.themeSlug === 'string' ? site.themeSlug.trim().replace(/-theme$/, '') : ''
  if (explicit && KNOWN_PUBLIC_SITE_ATTRS.has(explicit)) return explicit
  return 'texas-solar-and-roofing-pros'
}

/**
 * Texas Christmas Lights tenant (slug or `themeSlug` override).
 */
export function isTxChristmasLightsSite(site) {
  const explicit = typeof site?.themeSlug === 'string' ? site.themeSlug.trim() : ''
  const slug = typeof site?.slug === 'string' ? site.slug.trim() : ''
  return (explicit || slug) === 'txchristmaslights'
}

/**
 * Sites whose theme file fully defines the hsl() pieces (`--color-primary-h`, …)
 * used by globals + legacy sections. Sanity `brand.primary` HSL must not be
 * inlined on the wrapper — it would override scoped theme tokens (e.g. solar hue
 * stuck in CMS replacing Christmas tokens).
 */
function siteUsesThemeOwnedHslRamp(site) {
  return isTxChristmasLightsSite(site)
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
 *   1. `src/styles/*-theme.css` defines defaults for `[data-public-site="…"]` —
 *      these are the source of truth for `--background`, `--foreground`, etc.
 *   2. This helper returns only the keys Sanity actually has a value for (e.g. HSL brand ramps),
 *      except on `txchristmaslights` where the theme file owns `--color-*-h/s/l` (see `siteUsesThemeOwnedHslRamp`).
 *   3. Optional `brand.surface.hex` sets `--site-surface` only (never replaces `--background`)
 *      so page backgrounds stay on the curated theme tokens unless a component reads `--site-surface`.
 *
 * To expose a new Sanity-driven token, add the field to `siteType.js`,
 * extend the GROQ projection in `content.js`, and add a branch below.
 */
export function getSiteBrandStyleVars(site) {
  const brand = site?.brand
  if (!brand) return {}

  const skipBrandHsl = siteUsesThemeOwnedHslRamp(site)

  const vars = {
    ...(skipBrandHsl
      ? {}
      : {
          ...brandColorHSLVars(brand.primary, 'primary'),
          ...brandColorHSLVars(brand.secondary, 'secondary'),
          ...brandColorHSLVars(brand.accent, 'tertiary'),
        }),
  }

  // Surface chip is optional UI chrome only — do not overwrite `--background`.
  // Theme files for `[data-public-site="txchristmaslights"]` own page background tokens; pushing a
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
