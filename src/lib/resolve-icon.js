import { createElement } from 'react'

import IconoirLazyIcon from '../components/iconoir-lazy-icon'
import { iconoirRegistry } from '../components/iconoir-registry'
import { iconoirIconNames } from './iconoir-icon-names'

/*
 * Single place that turns an icon name stored in Sanity into an Iconoir
 * component. The `icon` fields in `page-type.js` offer two kinds of values
 * from the same dropdown (`publicSiteIconOptions`):
 *
 *   1. Service slugs from `publicSiteServiceIconOptions` -- lowercase keys like
 *      `shingles` or `evcharger` that are not Iconoir names at all.
 *   2. Iconoir names from `publicSiteIconoirOptions` -- PascalCase keys like
 *      `SunLight` that map straight onto the registry.
 *
 * Older documents can also hold Iconify ids (`solar:leaf-linear`) or loose
 * lowercase/kebab-case spellings, because the fields were free text before the
 * dropdowns existed. Every caller resolving a CMS icon name should go through
 * `resolveIconoirIcon` so all four forms behave the same everywhere.
 */

/** Service slugs (`publicSiteServiceIconOptions`) mapped to registry names. */
export const serviceIconNameMap = {
  audit: 'AreaSearch',
  commercialroofing: 'HomeShield',
  detachreset: 'Wrench',
  ducts: 'AirConditioner',
  electrical: 'Flash',
  evcharger: 'Car',
  hailinspection: 'AreaSearch',
  heatpump: 'AirConditioner',
  insulation: 'HomeShield',
  metalroofing: 'HomeShield',
  rodent: 'WarningTriangle',
  shingles: 'HomeShield',
  solarbattery: 'BatteryCharging',
  stormdamage: 'Thunderstorm',
  windows: 'WindowTabs',
}

/** Legacy Iconify ids and loose keywords left in older documents. */
export const legacyIconNameMap = {
  hail: 'Thunderstorm',
  roofing: 'HomeShield',
  solar: 'SunLight',
  'solar:chart-square-linear': 'StatUp',
  'solar:history-linear': 'Clock',
  'solar:home-linear': 'HomeShield',
  'solar:leaf-linear': 'Leaf',
  'solar:map-point-linear': 'Thunderstorm',
  'solar:wad-of-money-linear': 'SunLight',
  'solar:wallet-money-linear': 'Wallet',
}

/*
 * Lowercased, punctuation-stripped index of every Iconoir name, so
 * `sun-light`, `sunlight`, and `Sun Light` all reach `SunLight`. Built once on
 * first use; the names collide with nothing when normalized this way.
 */
const iconNameSet = new Set(iconoirIconNames)
let normalizedNameIndex = null

function getNormalizedNameIndex() {
  if (!normalizedNameIndex) {
    normalizedNameIndex = new Map()
    for (const name of iconoirIconNames) {
      normalizedNameIndex.set(normalizeIconName(name), name)
    }
  }

  return normalizedNameIndex
}

function normalizeIconName(value) {
  return String(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, '')
}

function toComponent(value) {
  return typeof value === 'function' || (typeof value === 'object' && value !== null) ? value : null
}

/* One stable component per name, so React does not remount the icon on each render. */
const lazyIconComponents = new Map()

function toIconComponent(name) {
  const registered = toComponent(iconoirRegistry[name])
  if (registered) {
    return registered
  }

  if (!lazyIconComponents.has(name)) {
    lazyIconComponents.set(name, (props) => createElement(IconoirLazyIcon, { ...props, name }))
  }

  return lazyIconComponents.get(name)
}

/**
 * Resolve an Iconoir icon component from a name stored in Sanity.
 * Accepts registry names, service slugs, legacy Iconify ids, and loose
 * spellings. Returns null when the name resolves to nothing, so callers can
 * keep their own fallbacks (text inference, number badges, no icon).
 */
export function resolveIconoirIcon(iconName) {
  if (!iconName || typeof iconName !== 'string') {
    return null
  }

  const name = iconName.trim()
  if (!name) {
    return null
  }

  // Exact Iconoir name wins, so `Windows` stays the Windows logo while the
  // `windows` service slug below stays the home-window icon.
  if (iconNameSet.has(name)) {
    return toIconComponent(name)
  }

  const aliased = serviceIconNameMap[name.toLowerCase()] || legacyIconNameMap[name.toLowerCase()]
  if (aliased) {
    return toIconComponent(aliased)
  }

  const normalized = getNormalizedNameIndex().get(normalizeIconName(name))
  return normalized ? toIconComponent(normalized) : null
}
