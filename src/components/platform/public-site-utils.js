import { toRuntimeToken } from '@/lib/sanity/stega'

export const CONSULTATION_ANCHOR_ID = 'consultation'

/** Hero backdrop when CMS has no media (photo collage — not the precomposed OG art). */
export const TX_CHRISTMAS_PUBLIC_HERO_FALLBACK_SRC = '/images/tx-christmas-hero-collage.png'

/** Precomposed 1200×630-style share image (copy + logo baked in) — `/api/og` only, full-bleed with no overlay. */
export const TX_CHRISTMAS_PUBLIC_OG_IMAGE_SRC = '/images/tx-christmas-og.png'

/** Wordmark PNG for nav (not used on generated OG when using {@link TX_CHRISTMAS_PUBLIC_OG_IMAGE_SRC}). */
export const TX_CHRISTMAS_PUBLIC_LOGO_SRC = '/images/tx-christmas-logo-full.png'

/** Values that match `[data-public-site="…"]` blocks in *-theme.css. */
const KNOWN_PUBLIC_SITE_ATTRS = new Set(['texas-solar-and-roofing-pros', 'txchristmaslights'])

/**
 * `data-public-site` on `<html>` (public routes) so tenant CSS scopes match
 * the Medium-style pattern and portals inherit tokens. Operator shells omit
 * this attribute; see `src/proxy.js` + `src/app/layout.jsx`.
 */
export function getPublicDataSiteAttribute(site) {
  if (isTxChristmasLightsSite(site)) {
    return 'txchristmaslights'
  }
  const explicit = typeof site?.themeSlug === 'string' ? site.themeSlug.trim().replace(/-theme$/, '') : ''
  if (explicit && KNOWN_PUBLIC_SITE_ATTRS.has(explicit)) {
    return explicit
  }
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
 * Sites whose theme file owns its own base color tokens (`--color-primary`, …).
 * Sanity `brand.primary` must not be inlined on the wrapper for these — it would
 * override scoped theme tokens (e.g. solar hue stuck in CMS replacing Christmas
 * tokens).
 */
function siteUsesThemeOwnedColorRamp(site) {
  return isTxChristmasLightsSite(site)
}

/**
 * Convert a Sanity color object (from @sanity/color-input) into a CSS variable
 * override for the one base token that drives the whole color cascade. Theme
 * files derive every numbered shade and shadcn slot (--color-primary-700,
 * --primary, --ring, ...) from that base with `oklch(from var(--color-primary)
 * …)`, so overriding the base re-tints the palette in one shot.
 *
 * The hex is handed to CSS as-is; relative color syntax converts it to OKLCH at
 * use time, which is why no color math is needed here.
 */
export function brandColorVars(color, prefix) {
  const hex = typeof color?.hex === 'string' ? color.hex.trim() : ''
  if (!hex) {
    return {}
  }
  return { [`--color-${prefix}`]: hex }
}

/**
 * Build the inline style overrides that inject Sanity-defined brand colors
 * onto the public-site wrapper element.
 *
 * Cascade contract:
 *   1. `src/styles/*-theme.css` defines defaults for `[data-public-site="…"]` —
 *      these are the source of truth for `--background`, `--foreground`, etc.
 *   2. This helper returns only the keys Sanity actually has a value for (e.g. base brand colors),
 *      except on `txchristmaslights` where the theme file owns `--color-primary`/`-secondary`/`-tertiary` (see `siteUsesThemeOwnedColorRamp`).
 *   3. Optional `brand.surface.hex` sets `--site-surface` only (never replaces `--background`)
 *      so page backgrounds stay on the curated theme tokens unless a component reads `--site-surface`.
 *
 * To expose a new Sanity-driven token, add the field to `siteType.js`,
 * extend the GROQ projection in `content.js`, and add a branch below.
 */
export function getSiteBrandStyleVars(site) {
  const brand = site?.brand
  if (!brand) {
    return {}
  }

  const skipBrandColors = siteUsesThemeOwnedColorRamp(site)

  const vars = skipBrandColors
    ? {}
    : {
        ...brandColorVars(brand.primary, 'primary'),
        ...brandColorVars(brand.secondary, 'secondary'),
        ...brandColorVars(brand.accent, 'tertiary'),
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
  if (section?.anchor) {
    return slugifySectionToken(section.anchor)
  }
  if (section?.id) {
    return slugifySectionToken(section.id)
  }

  const token = slugifySectionToken(section?.title || section?.eyebrow || section?.question || '')
  return token ? `${section.type}-${token}` : `${section.type}-${index + 1}`
}
