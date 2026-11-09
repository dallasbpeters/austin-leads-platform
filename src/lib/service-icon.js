import {
  BatteryChargingIcon,
  BuildingsIcon,
  CarIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CoinsIcon,
  HouseLineIcon,
  LightbulbIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SnowflakeIcon,
  SolarPanelIcon,
  SolarRoofIcon,
  SunHorizonIcon,
  ThermometerIcon,
  ToolboxIcon,
  WarningIcon,
  WindIcon,
  WrenchIcon,
} from '@phosphor-icons/react/ssr'

/*
 * Phosphor icons (phosphoricons.com, MIT) for the service cards, drawn in the
 * duotone weight. The Sanity `icon` field still stores the names it always has
 * (service slugs such as `solarbattery`, or Iconoir names such as `Rain`); this
 * maps each to a Phosphor icon and falls back to words in the card's own text.
 * The /ssr entry renders without React context, so server components can use it.
 */
const ICONS_BY_NAME = {
  // Service slugs (publicSiteServiceIconOptions)
  audit: MagnifyingGlassIcon,
  commercialroofing: BuildingsIcon,
  detachreset: SolarRoofIcon,
  ducts: WindIcon,
  electrical: LightningIcon,
  evcharger: CarIcon,
  hailinspection: SnowflakeIcon,
  heatpump: ThermometerIcon,
  insulation: HouseLineIcon,
  metalroofing: HouseLineIcon,
  rodent: WarningIcon,
  shingles: HouseLineIcon,
  solarbattery: BatteryChargingIcon,
  stormdamage: CloudLightningIcon,
  windows: HouseLineIcon,
  // Iconoir names found in existing documents
  rain: CloudRainIcon,
  droplet: CloudRainIcon,
  warningtriangle: WarningIcon,
  flash: LightningIcon,
  sunlight: SunHorizonIcon,
  homeshield: ShieldCheckIcon,
  wrench: WrenchIcon,
}

const ICONS_BY_KEYWORD = [
  [SolarRoofIcon, ['detach', 'reset', 'reroof']],
  [ToolboxIcon, ['repair', 'maintenance', 'service', 'troubleshoot']],
  [BatteryChargingIcon, ['battery', 'storage', 'backup']],
  [SolarPanelIcon, ['solar', 'panel']],
  [LightningIcon, ['electrical', 'outlet']],
  [CarIcon, ['charger', 'ev ']],
  [SnowflakeIcon, ['hail']],
  [CloudLightningIcon, ['storm', 'rain', 'leak']],
  [ShieldCheckIcon, ['insurance', 'warranty', 'claim']],
  [HouseLineIcon, ['roof', 'shingle', 'metal', 'window']],
  [ThermometerIcon, ['heat pump', 'hvac', 'duct']],
  [CoinsIcon, ['rebate', 'incentive', 'financing', 'cost']],
  [MagnifyingGlassIcon, ['audit', 'inspection']],
  [LightbulbIcon, ['efficiency', 'lighting']],
]

/** The icon for a card: its Sanity icon name first, then words in its text, else a sunrise. */
export function resolveServiceIcon(name, text = '') {
  const key = String(name || '')
    .replaceAll(/[^a-z]/giu, '')
    .toLowerCase()
  if (ICONS_BY_NAME[key]) {
    return ICONS_BY_NAME[key]
  }
  const haystack = String(text).toLowerCase()
  const match = ICONS_BY_KEYWORD.find(([, words]) => words.some((word) => haystack.includes(word)))
  return match ? match[0] : SunHorizonIcon
}
