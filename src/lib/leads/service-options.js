export const LEAD_SERVICE_OPTIONS = [
  { value: 'not-sure', label: "I'm not sure yet" },
  { value: 'solar-roofing', label: 'Solar and roofing' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'hail-damage', label: 'Hail damage / insurance claim' },
  { value: 'solar', label: 'Solar' },
  { value: 'solar-battery', label: 'Solar and battery' },
  { value: 'detach-and-reset', label: 'Solar detach and reset' },
  { value: 'energy-audit', label: 'Energy audit' },
  { value: 'insulation-air-sealing', label: 'Insulation and air sealing' },
  { value: 'duct-sealing', label: 'Duct sealing' },
  { value: 'window-replacement', label: 'Window replacement' },
  { value: 'heat-pump', label: 'Heat pump upgrade' },
  { value: 'metal-roofing', label: 'Metal roofing' },
  { value: 'shingle-roofing', label: 'Shingle roofing' },
  { value: 'storm-restoration', label: 'Storm damage restoration' },
  { value: 'commercial-roofing', label: 'Commercial roofing' },
  { value: 'electrical', label: 'Electrical services' },
  { value: 'ev-charger', label: 'Car charger / EV charger' },
]

export function normalizeLeadServiceInterest(value, fallback = 'not-sure') {
  const normalized = typeof value === 'string' ? value.trim() : ''

  if (!normalized) {
    return fallback
  }

  return LEAD_SERVICE_OPTIONS.some((option) => option.value === normalized) ? normalized : fallback
}
