/*
 * Single-page quote PDF for Texas Solar and Roofing Pros.
 *
 * Rendered with @react-pdf/renderer (serverless-friendly; no headless
 * browser). Written with React.createElement instead of JSX so the module
 * can also be executed by plain Node scripts.
 *
 * Brand assets are read from /public/images (override with QUOTE_LOGO_PATH /
 * QUOTE_HERO_IMAGE_PATH). Empty form fields render as [PLACEHOLDERS] so the
 * template is always previewable.
 *
 * NOTE: There is intentionally no federal tax credit line anywhere in this
 * document — the credit expired Dec 31, 2025. The only incentive shown is
 * the Austin Energy rebate when the customer's utility is Austin Energy.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'

import { createElement as h } from 'react'

import { Document, Image, Page, Path, Polygon, StyleSheet, Svg, Text, View, pdf } from '@react-pdf/renderer'

import { MONTH_LABELS } from './calc.js'

// ─── Brand ───────────────────────────────────────────────────────────────────

const NAVY = '#16324f'
const GREEN = '#4f7942'
const AMBER = '#f5a623'
const INK = '#1d2733'
const MUTED = '#5b6b7b'
const PAPER = '#ffffff'
const PANEL = '#f4f6f8'
const LINE = '#dde4ea'

export function getCompanyInfo() {
  return {
    name: process.env.QUOTE_COMPANY_NAME || 'Texas Solar and Roofing Pros',
    tagline: process.env.QUOTE_COMPANY_TAGLINE || 'Local. Trusted. Texas Proud.',
    phone: process.env.QUOTE_COMPANY_PHONE || '',
    email: process.env.QUOTE_COMPANY_EMAIL || '',
    website: process.env.QUOTE_COMPANY_WEBSITE || '',
  }
}

function assetPath(envVar, fallbackRelative) {
  const custom = process.env[envVar]?.trim()
  const candidate = custom || path.join(process.cwd(), fallbackRelative)
  return existsSync(candidate) ? candidate : null
}

const getLogoPath = () => assetPath('QUOTE_LOGO_PATH', '/public/images/tx-solar-logo.png')
const getHeroPath = () => assetPath('QUOTE_HERO_IMAGE_PATH', 'public/images/quote-assets/hero.jpg')
const getDefaultLayoutPath = () =>
  assetPath('QUOTE_LAYOUT_IMAGE_PATH', 'public/images/quote-assets/system-layout-default.png')

// ─── Formatting helpers ──────────────────────────────────────────────────────

const money = (value) =>
  Number(value) > 0
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(Number(value))
    : '[$ AMOUNT]'

const num = (value) => (Number(value) > 0 ? new Intl.NumberFormat('en-US').format(Number(value)) : '—')

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/Chicago' }).format(
    value ? new Date(value) : new Date(),
  )

// Placeholder helper: empty form fields render like the blank template.
const ph = (value, placeholder) => {
  const text = value === null || value === undefined ? '' : String(value).trim()
  return text || placeholder
}

// ─── Icons (lucide outlines drawn as SVG paths) ──────────────────────────────

const ICON_PATHS = {
  dollar: ['M12 2v20', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  battery: ['M2 7h16v10H2z', 'M22 11v2'],
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5', 'M9 21v-7h6v7'],
  trendUp: ['M2 17l7-7 4 4 9-9', 'M15 5h7v7'],
  sun: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M12 2v2',
    'M12 20v2',
    'M2 12h2',
    'M20 12h2',
    'M4.9 4.9l1.4 1.4',
    'M17.7 17.7l1.4 1.4',
    'M17.7 6.3l1.4-1.4',
    'M4.9 19.1l1.4-1.4',
  ],
  chart: ['M3 3v18h18', 'M8 17v-6', 'M13 17V7', 'M18 17v-9'],
  wallet: ['M3 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M3 6V5a2 2 0 0 1 2-2h12', 'M16 12h4'],
  award: ['M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12z', 'M8.5 14 7 22l5-3 5 3-1.5-8'],
  leaf: ['M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16z', 'M4 21c3-5 7-9 12-12'],
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
  ],
  mail: ['M2 4h20v16H2z', 'M22 6l-10 7L2 6'],
  globe: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M2 12h20', 'M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z'],
  shield: ['M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z', 'M9 12l2 2 4-4'],
  mapPin: [
    'M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z',
    'M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  ],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  zap: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
}

function Icon(name, { size = 12, color = GREEN, strokeWidth = 2 } = {}) {
  const paths = ICON_PATHS[name]
  if (!paths) {
    return null
  }
  return h(
    Svg,
    { width: size, height: size, viewBox: '0 0 24 24' },
    ...paths.map((d, index) =>
      h(Path, {
        key: index,
        d,
        stroke: color,
        strokeWidth,
        fill: 'none',
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
      }),
    ),
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: INK,
    backgroundColor: PAPER,
    padding: 0,
  },
  row: { flexDirection: 'row' },

  // Header — full bleed, company data row, angled QUOTE box
  headerRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 8,
    borderWidth: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 14,
    paddingVertical: 10,
    borderWidth: 0,
  },
  logo: { width: 96, marginRight: 14, borderWidth: 0 },
  brandName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 },
  tagline: { fontSize: 8.5, color: AMBER, marginTop: 4, fontFamily: 'Helvetica-Oblique' },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  contactIcon: { width: 14, marginRight: 5 },
  contactText: { fontSize: 8.5, color: INK },
  quoteBox: {
    backgroundColor: NAVY,
    color: PAPER,
    paddingVertical: 16,
    paddingLeft: 40,
    paddingRight: 18,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 185,
    position: 'relative',
    borderWidth: 0,
    overflow: 'hidden',
  },
  quoteMask: { position: 'absolute', left: 0, top: 0, borderWidth: 0 },
  quoteTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: PAPER },
  quoteRule: { borderBottomWidth: 2.5, borderBottomColor: AMBER, width: 74, marginVertical: 4 },
  quoteMeta: { fontSize: 8.5, color: PAPER, marginTop: 2.5 },

  // Angled photo masks — no borders; masks cover rectangular image edges
  photoWrap: {
    flex: 1.25,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: PAPER,
  },
  photoMaskLeft: { position: 'absolute', left: 0, top: 0, borderWidth: 0 },
  photoMaskRight: { position: 'absolute', right: 0, top: 0, borderWidth: 0 },

  // Section header bars
  barNavy: {
    backgroundColor: NAVY,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barGreen: {
    backgroundColor: GREEN,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: PAPER,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionBody: {
    backgroundColor: PANEL,
    padding: 10,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },

  // Top band
  label: {
    fontSize: 6.5,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: 'Helvetica-Bold',
  },
  value: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: INK, marginTop: 1.5 },
  heroImage: {
    width: '100%',
    height: 168,
    objectFit: 'cover',
    borderWidth: 0,
  },

  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5.5 },
  summaryIcon: { width: 16, alignItems: 'center', marginRight: 6 },
  summaryLabel: { fontSize: 7, color: MUTED },
  summaryValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: NAVY },

  // System overview
  overviewIntro: { fontSize: 8, color: INK, lineHeight: 1.5, marginBottom: 8 },
  benefitCell: { flexDirection: 'row', width: '50%', paddingRight: 10, marginBottom: 5 },
  benefitIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  benefitTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: INK },
  benefitText: { fontSize: 7, color: MUTED, marginTop: 1, lineHeight: 1.4 },

  // Equipment table
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: GREEN,
    paddingBottom: 3,
    marginBottom: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingVertical: 3.5,
  },
  thEquip: { width: '28%', fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY },
  thDesc: { width: '60%', fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY },
  thQty: { width: '12%', fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, textAlign: 'right' },
  tdEquip: { width: '28%', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  tdDesc: { width: '60%', fontSize: 8 },
  tdQty: { width: '12%', fontSize: 8, textAlign: 'right' },

  // Chart
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', height: 96, marginTop: 6 },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartBar: { width: '58%', backgroundColor: GREEN, borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  chartLabel: { fontSize: 6, color: MUTED, marginTop: 2 },
  chartNote: { fontSize: 6.5, color: MUTED, marginTop: 5, fontFamily: 'Helvetica-Oblique' },

  // Investment summary
  investLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  investLabel: { fontSize: 8, color: '#c9d4de' },
  investValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: PAPER },
  investDivider: { borderBottomWidth: 1, borderBottomColor: '#3d5a76', marginVertical: 4 },
  investTotalLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: PAPER },
  investTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: AMBER },
  investNote: { fontSize: 6.5, color: '#9fb2c2', marginTop: 5, fontFamily: 'Helvetica-Oblique' },

  paper: { backgroundColor: PAPER, borderWidth: 0, padding: 10 },
  panel: { backgroundColor: PANEL, padding: 10, borderRadius: 3, borderWidth: 0 },
  panelTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cashLabel: { fontSize: 8, color: MUTED, textAlign: 'center' },
  cashValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
    textAlign: 'center',
    marginTop: 3,
  },
  benefitValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: AMBER },
  mutedSmall: { fontSize: 8, color: MUTED },

  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  builtIcon: { width: 26, marginRight: 8, marginTop: 2 },
  builtTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: NAVY, letterSpacing: 0.5 },
  builtLine: { fontSize: 7.5, color: INK, marginTop: 1.5 },
  thanks: { fontSize: 8, fontFamily: 'Helvetica-Oblique', color: INK, lineHeight: 1.5 },
  signRule: { borderBottomWidth: 1, borderBottomColor: INK, width: 150, marginBottom: 3, marginTop: 16 },
  signLabel: { fontSize: 7, color: MUTED },
})

// ─── Small building blocks ───────────────────────────────────────────────────

const SectionBar = (title, variant = 'navy') =>
  h(View, { style: variant === 'green' ? s.barGreen : s.barNavy }, h(Text, { style: s.barText }, title))

const Field = (label, value) =>
  h(
    View,
    { style: { marginBottom: 7 } },
    h(Text, { style: s.label }, label),
    h(Text, { style: s.value }, value || '—'),
  )

const SummaryRow = (icon, label, value) =>
  h(
    View,
    { style: s.summaryRow },
    h(View, { style: s.summaryIcon }, Icon(icon, { size: 12, color: NAVY, strokeWidth: 2 })),
    h(
      View,
      { style: { flex: 1 } },
      h(Text, { style: s.summaryLabel }, label),
      h(Text, { style: s.summaryValue }, value),
    ),
  )

const Benefit = (icon, title, text) =>
  h(
    View,
    { style: s.benefitCell },
    h(View, { style: s.benefitIcon }, Icon(icon, { size: 11 })),
    h(
      View,
      { style: { flex: 1 } },
      h(Text, { style: s.benefitTitle }, title),
      h(Text, { style: s.benefitText }, text),
    ),
  )

const EquipmentRow = (equipment, description, qty) =>
  h(
    View,
    { style: s.tableRow },
    h(Text, { style: s.tdEquip }, equipment),
    h(Text, { style: s.tdDesc }, description || '—'),
    h(Text, { style: s.tdQty }, qty === null || qty === undefined || qty === '' ? '—' : String(qty)),
  )

// ─── Document ────────────────────────────────────────────────────────────────

/**
 * @param {object} quote  Quote record — needs quoteNumber, createdAt and
 *                        data.{inputs,computed}
 * @param {object} [options] Optional configuration object
 * @param {string|Buffer} [options.logo] Override logo (path or buffer)
 * @param {string|Buffer} [options.hero] Override property photo
 * @param {boolean} [options.signatureTags] Embed DocuSeal text tags so the
 *                  customer gets signature + date fields when the PDF is
 *                  sent through the e-sign flow.
 */
function buildEquipmentRows(inputs) {
  const qty = (value) => (value === null || value === undefined || value === '' ? '[QTY]' : String(value))
  return [
    EquipmentRow(
      'Solar Panels',
      ph(
        [inputs.panelMakeModel, inputs.panelWatts ? `${inputs.panelWatts}W` : ''].filter(Boolean).join(' — '),
        '[PANEL MAKE & MODEL]',
      ),
      qty(inputs.panelQuantity),
    ),
    EquipmentRow(
      'Inverter',
      ph(inputs.inverterMakeModel, '[INVERTER MAKE & MODEL]'),
      qty(inputs.inverterQuantity),
    ),
    EquipmentRow(
      'Battery(ies)',
      ph(inputs.batteryMakeModel, '[BATTERY MAKE & MODEL]'),
      qty(inputs.batteryQuantity),
    ),
    EquipmentRow('Racking', ph(inputs.rackingSystem, '[RACKING SYSTEM]'), qty(inputs.rackingQuantity)),
    EquipmentRow(
      'Monitoring',
      ph(inputs.monitoringSystem, '[MONITORING SYSTEM]'),
      qty(inputs.monitoringQuantity),
    ),
    EquipmentRow('Warranty', ph(inputs.warrantyDetails, '[WARRANTY DETAILS]'), ''),
  ]
}

const ContactRow = (icon, text) =>
  h(
    View,
    { style: s.contactRow },
    h(View, { style: s.contactIcon }, Icon(icon, { size: 10, color: NAVY, strokeWidth: 2 })),
    h(Text, { style: s.contactText }, text),
  )

// Height of the header band — the QUOTE box mask must match it.
const QUOTE_BOX_HEIGHT = 112

function buildHeader(quote, company, logo) {
  return h(
    View,
    { style: s.headerRow },
    h(
      View,
      { style: s.headerLeft },
      logo ? h(Image, { src: logo, style: s.logo }) : null,
      h(
        View,
        null,
        h(Text, { style: s.brandName }, company.name),
        ContactRow('phone', ph(company.phone, '(512) 775-0561')),
        ContactRow('mail', ph(company.email, 'info@texassolarandroofingpros.com')),
        ContactRow('globe', ph(company.website, 'www.texassolarandroofingpros.com')),
        h(Text, { style: s.tagline }, company.tagline),
      ),
    ),
    h(
      View,
      { style: [s.quoteBox, { minHeight: QUOTE_BOX_HEIGHT }] },
      // Angled left edge: oversized white triangle so no box border shows through.
      h(
        Svg,
        {
          style: s.quoteMask,
          width: 36,
          height: QUOTE_BOX_HEIGHT + 2,
          viewBox: `0 0 36 ${QUOTE_BOX_HEIGHT + 2}`,
        },
        h(Polygon, {
          points: `-1,-1 -1,${QUOTE_BOX_HEIGHT + 2} 36,${QUOTE_BOX_HEIGHT + 2}`,
          fill: PAPER,
        }),
      ),
      h(Text, { style: s.quoteTitle }, 'QUOTE'),
      h(View, { style: s.quoteRule }),
      h(Text, { style: s.quoteMeta }, quote.quoteNumber),
      h(Text, { style: s.quoteMeta }, formatDate(quote.createdAt)),
      h(Text, { style: s.quoteMeta }, 'Valid for 30 Days'),
    ),
  )
}

function buildTopBand(inputs, computed, hero) {
  const addressLine1 = ph(inputs.propertyAddress, '[PROPERTY ADDRESS]')
  const addressLine2 = [inputs.propertyCity, inputs.propertyState, inputs.propertyZip]
    .filter(Boolean)
    .join(', ')

  return h(
    View,
    { style: [s.row, { marginBottom: 10 }] },
    h(
      View,
      { style: [s.paper, { flex: 0.95, marginRight: 8 }] },
      Field('Prepared For', ph(inputs.customerName, '[CUSTOMER NAME]')),
      Field('Property', `${addressLine1}${addressLine2 ? `\n${addressLine2}` : ''}`),
      Field('Utility Provider', ph(inputs.utilityProvider, '[UTILITY COMPANY]')),
    ),
    hero
      ? h(
          View,
          { style: [s.photoWrap, { marginRight: 8 }] },
          h(Image, { src: hero, style: s.heroImage }),
          // Oversized angled masks so rectangular image edges never show as a border.
          h(
            Svg,
            { style: s.photoMaskLeft, width: 28, height: 170, viewBox: '0 0 28 170' },
            h(Polygon, { points: '-1,-1 28,-1 -1,170', fill: PAPER }),
          ),
          h(
            Svg,
            { style: s.photoMaskRight, width: 28, height: 170, viewBox: '0 0 28 170' },
            h(Polygon, { points: '29,-1 29,170 -1,170', fill: PAPER }),
          ),
        )
      : null,
    h(
      View,
      { style: [s.paper, { flex: 1.15, paddingBottom: 4 }] },
      h(Text, { style: s.panelTitle }, 'Project Summary'),
      SummaryRow(
        'sun',
        'System Size (DC)',
        Number(computed.systemSizeKw) > 0 ? `${computed.systemSizeKw} kW` : '[SYSTEM SIZE] kW',
      ),
      SummaryRow('chart', 'Estimated Annual Production', `${num(computed.annualProductionKwh)} kWh`),
      SummaryRow('wallet', 'Estimated First Year Savings', money(computed.firstYearSavings)),
      SummaryRow('award', '25-Year Estimated Savings', money(computed.lifetimeSavings)),
      SummaryRow('leaf', 'CO2 Offset (25 Years)', `${num(computed.co2OffsetTons)} Tons`),
    ),
  )
}

function buildOverviewAndEquipment(inputs) {
  return h(
    View,
    { style: [s.row, { marginBottom: 10 }] },
    h(
      View,
      { style: { flex: 1, marginRight: 8 } },
      SectionBar('System Overview', 'navy'),
      h(
        View,
        { style: s.sectionBody },
        h(
          Text,
          { style: s.overviewIntro },
          'This custom solar and battery storage system is designed to reduce your electric bills, provide backup power during outages, and increase your energy independence.',
        ),
        h(
          View,
          { style: [s.row, { flexWrap: 'wrap' }] },
          Benefit('dollar', 'Lower Electric Bills', 'Lock in lower energy costs for the future.'),
          Benefit('battery', 'Backup Power', 'Keep your home running when the grid goes down.'),
          Benefit('home', 'Energy Independence', 'Produce and store your own clean energy.'),
          Benefit('trendUp', 'Increase Home Value', 'Solar + storage is a smart investment.'),
        ),
      ),
    ),
    h(
      View,
      { style: { flex: 1.2 } },
      SectionBar('System Equipment', 'green'),
      h(
        View,
        { style: s.sectionBody },
        h(
          View,
          { style: s.tableHeader },
          h(Text, { style: s.thEquip }, 'EQUIPMENT'),
          h(Text, { style: s.thDesc }, 'DESCRIPTION'),
          h(Text, { style: s.thQty }, 'QTY'),
        ),
        ...buildEquipmentRows(inputs),
      ),
    ),
  )
}

function buildSystemLayoutAndChart(inputs, computed, layoutPath) {
  const monthly = computed.monthlyProductionKwh || []
  const maxMonthly = Math.max(1, ...monthly)
  const layoutSrc = inputs.systemLayoutUrl || layoutPath

  return h(
    View,
    { style: [s.row, { marginBottom: 10 }] },
    // ── Left: System Layout ──────────────────────────────────────────
    h(
      View,
      { style: { flex: 0.85, marginRight: 8 } },
      SectionBar('System Layout', 'green'),
      h(
        View,
        { style: [s.sectionBody, { alignItems: 'center', justifyContent: 'center', minHeight: 120 }] },
        layoutSrc
          ? h(Image, { src: layoutSrc, style: { width: '100%', objectFit: 'contain', maxHeight: 130 } })
          : h(
              View,
              { style: { alignItems: 'center', justifyContent: 'center', height: 100 } },
              h(Text, { style: { fontSize: 8, color: MUTED } }, 'System layout image'),
              h(Text, { style: { fontSize: 7, color: MUTED, marginTop: 3 } }, 'Upload in quote builder'),
            ),
      ),
    ),
    // ── Right: Monthly Production Chart ──────────────────────────────
    h(
      View,
      { style: { flex: 1.15 } },
      SectionBar('Estimated Monthly Energy Production (kWh)', 'green'),
      h(
        View,
        { style: s.sectionBody },
        h(
          View,
          { style: s.chartArea },
          ...monthly.map((kwh, index) =>
            h(
              View,
              { key: MONTH_LABELS[index], style: s.chartCol },
              h(Text, { style: { fontSize: 5.5, color: MUTED, marginBottom: 1 } }, kwh > 0 ? num(kwh) : ' '),
              h(View, { style: [s.chartBar, { height: `${(kwh / maxMonthly) * 80}%` }] }),
              h(Text, { style: s.chartLabel }, MONTH_LABELS[index]),
            ),
          ),
        ),
        h(
          Text,
          { style: s.chartNote },
          'Production may vary based on weather, shading, and system performance.',
        ),
      ),
    ),
  )
}

function buildInvestmentRow(computed) {
  const benefitRow = (icon, label, value, withDivider) =>
    h(
      View,
      {
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          borderBottomWidth: withDivider ? 1 : 0,
          borderBottomColor: AMBER,
        },
      },
      h(View, { style: { width: 18, marginRight: 8 } }, Icon(icon, { size: 14, color: AMBER })),
      h(Text, { style: { flex: 1, fontSize: 8, color: MUTED } }, label),
      h(Text, { style: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: INK } }, value),
    )

  return h(
    View,
    { style: [s.row, { marginBottom: 8, alignItems: 'stretch' }] },
    // Investment Summary — navy card (no federal tax credit; rebate only when applicable)
    h(
      View,
      { style: { flex: 1.15, marginRight: 8, backgroundColor: NAVY, borderRadius: 3, padding: 10 } },
      h(Text, { style: [s.panelTitle, { color: PAPER, marginBottom: 8 }] }, 'Investment Summary'),
      h(
        View,
        { style: s.investLine },
        h(Text, { style: s.investLabel }, 'System Price'),
        h(Text, { style: s.investValue }, money(computed.systemPrice)),
      ),
      computed.rebate
        ? h(
            View,
            { style: s.investLine },
            h(Text, { style: s.investLabel }, 'Austin Energy Rebate'),
            h(Text, { style: s.investValue }, `- ${money(computed.rebate)}`),
          )
        : null,
      h(View, { style: s.investDivider }),
      h(
        View,
        { style: s.investLine },
        h(Text, { style: s.investTotalLabel }, 'Net System Price'),
        h(Text, { style: s.investTotalValue }, money(computed.netSystemPrice)),
      ),
      computed.rebate
        ? h(Text, { style: s.investNote }, 'Rebate subject to Austin Energy program terms and availability.')
        : null,
    ),
    // Payment Options — green header bar, cash only (no financed column)
    h(
      View,
      { style: { flex: 0.95, marginRight: 8 } },
      SectionBar('Payment Options', 'green'),
      h(
        View,
        {
          style: {
            backgroundColor: PANEL,
            borderBottomLeftRadius: 3,
            borderBottomRightRadius: 3,
            paddingVertical: 16,
            paddingHorizontal: 10,
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
          },
        },
        h(
          Text,
          { style: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 } },
          'CASH PRICE',
        ),
        h(
          Text,
          { style: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: GREEN } },
          money(computed.netSystemPrice),
        ),
        h(View, { style: { marginTop: 8 } }, Icon('dollar', { size: 16, color: GREEN })),
      ),
    ),
    // 25-Year Benefits — amber border + icon rows
    h(
      View,
      {
        style: {
          flex: 1.1,
          borderWidth: 1.5,
          borderColor: AMBER,
          borderRadius: 3,
          padding: 10,
          backgroundColor: PAPER,
        },
      },
      h(Text, { style: [s.panelTitle, { color: AMBER, marginBottom: 4 }] }, '25-Year Benefits'),
      benefitRow('award', 'Total Savings', money(computed.lifetimeSavings), true),
      benefitRow('wallet', 'Average Annual Savings', money(computed.averageAnnualSavings), false),
    ),
  )
}

function buildFooter(company, inputs = {}) {
  const repSignature = inputs.repSignature
  return h(
    View,
    { style: s.footer },
    h(
      View,
      { style: { flex: 1.6, paddingRight: 14 } },
      h(
        Text,
        { style: s.thanks },
        'Thank you for the opportunity to provide this quote. We look forward to helping you power your home with clean, reliable energy for decades to come.',
      ),
      h(
        Text,
        { style: [s.signLabel, { marginTop: 6 }] },
        'High-quality components. Expert installation. Local team. Long-term peace of mind.',
      ),
    ),
    h(
      View,
      { style: { flex: 1, alignItems: 'flex-start' } },
      repSignature
        ? h(Image, {
            src: repSignature,
            style: { width: 160, height: 48, objectFit: 'contain', marginBottom: 2 },
          })
        : h(View, { style: { height: 48 } }),
      h(View, { style: s.signRule }),
      h(Text, { style: s.signLabel }, 'Authorized Representative'),
      h(Text, { style: s.signLabel }, company.name),
      h(Text, { style: [s.signLabel, { marginTop: 8 }] }, formatDate(new Date())),
    ),
  )
}

export function QuoteDocument(quote, options = {}) {
  const company = getCompanyInfo()
  const { inputs = {}, computed = {} } = quote.data || {}
  const logo = options.logo || getLogoPath()
  const hero = options.hero || getHeroPath()
  const layoutPath = options.layout || getDefaultLayoutPath()

  return h(
    Document,
    { title: `Quote ${quote.quoteNumber} — ${inputs.customerName || ''}` },
    h(
      Page,
      { size: 'LEGAL', style: s.page },
      buildHeader(quote, company, logo),
      h(
        View,
        { style: { paddingHorizontal: 14 } },
        buildTopBand(inputs, computed, hero),
        buildOverviewAndEquipment(inputs),
        buildSystemLayoutAndChart(inputs, computed, layoutPath),
        buildInvestmentRow(computed),
        buildFooter(company, inputs),
      ),
    ),
  )
}

/**
 * Render a quote to a PDF Buffer.
 */
export async function renderQuotePdf(quote, options = {}) {
  const instance = pdf(QuoteDocument(quote, options))
  const blob = await instance.toBlob().catch(() => null)
  if (blob) {
    return Buffer.from(await blob.arrayBuffer())
  }
  // Node runtime path (toBlob is browser-oriented in some versions)
  const buffer = await instance.toBuffer()
  if (Buffer.isBuffer(buffer)) {
    return buffer
  }
  // Some versions return a stream — collect chunks without a manual Promise wrapper
  const { finished } = await import('node:stream/promises')
  const chunks = []
  buffer.on('data', (chunk) => chunks.push(chunk))
  await finished(buffer)
  return Buffer.concat(chunks)
}

export function quotePdfFileName(quote) {
  const name = String(quote.customerName || 'Customer')
    .trim()
    .replaceAll(/[^a-zA-Z0-9 _-]/g, '')
    .replaceAll(/\s+/g, ' ')
  return `${name} - Quote ${quote.quoteNumber}.pdf`
}
