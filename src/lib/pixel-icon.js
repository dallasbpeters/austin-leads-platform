import {
  BatteryFull,
  Building,
  Car,
  Cloud,
  CloudSun,
  Coins,
  Home,
  Lightbulb,
  Search,
  Shield,
  SmartHome,
  Snowflake,
  Sun,
  Thermometer,
  Tools,
  WarningDiamond,
  Wind,
  WindowFrame,
  Zap,
} from 'pixelarticons/react'

/*
 * Pixelarticons (pixelarticons.com, MIT) for the service cards. The Sanity
 * `icon` field still stores the same names it always has (service slugs such
 * as `solarbattery`, or Iconoir names such as `Rain`); this maps each one to a
 * pixel icon, and falls back to keywords in the card's own text.
 */
const ICONS_BY_NAME = {
  // Service slugs (publicSiteServiceIconOptions)
  audit: Search,
  commercialroofing: Building,
  detachreset: Tools,
  ducts: Wind,
  electrical: Zap,
  evcharger: Car,
  hailinspection: Snowflake,
  heatpump: Thermometer,
  insulation: SmartHome,
  metalroofing: Home,
  rodent: WarningDiamond,
  shingles: Home,
  solarbattery: BatteryFull,
  stormdamage: Cloud,
  windows: WindowFrame,
  // Iconoir names found in existing documents
  rain: Cloud,
  droplet: Cloud,
  warningtriangle: WarningDiamond,
  flash: Zap,
  sunlight: Sun,
  homeshield: Shield,
  wrench: Tools,
}

const ICONS_BY_KEYWORD = [
  [Tools, ['detach', 'reset', 'repair', 'maintenance', 'service']],
  [BatteryFull, ['battery', 'storage', 'backup']],
  [Sun, ['solar', 'panel']],
  [Zap, ['electrical', 'panel upgrade', 'outlet']],
  [Car, ['charger', 'ev ']],
  [Snowflake, ['hail']],
  [Cloud, ['storm', 'rain', 'leak']],
  [Shield, ['insurance', 'warranty', 'claim']],
  [Home, ['roof', 'shingle', 'metal']],
  [Thermometer, ['heat pump', 'hvac', 'duct']],
  [Coins, ['rebate', 'incentive', 'financing', 'cost']],
  [Search, ['audit', 'inspection']],
  [WindowFrame, ['window']],
  [Lightbulb, ['efficiency', 'lighting']],
]

/** The pixel icon for a card: its Sanity icon name first, then words in its text, else a sun behind a cloud. */
export function resolvePixelIcon(name, text = '') {
  const key = String(name || '')
    .replaceAll(/[^a-z]/giu, '')
    .toLowerCase()
  if (ICONS_BY_NAME[key]) {
    return ICONS_BY_NAME[key]
  }
  const haystack = String(text).toLowerCase()
  const match = ICONS_BY_KEYWORD.find(([, words]) => words.some((word) => haystack.includes(word)))
  return match ? match[0] : CloudSun
}
