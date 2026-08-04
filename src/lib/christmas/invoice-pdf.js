// oxlint-disable jsdoc/require-param-description
/*
 * Texas Christmas Lights invoice PDF — the "Christmas Lights — Classic"
 * template. Rendered with @react-pdf/renderer (no headless browser) and
 * written with React.createElement instead of JSX so the module can also be
 * executed by plain Node scripts.
 *
 * Themed after the tx-christmaslights public-site palette:
 *   cream page background, deep pine-green header, orange-red primary,
 *   gold accents, and red/green/gold/blue/orange ornament motifs drawn as
 *   inline SVG (so the template carries no external image dependencies).
 *
 * Brand assets come from /public/images (override the logo with
 * CHRISTMAS_INVOICE_LOGO_PATH). Company details come from the invoice
 * settings (or CHRISTMAS_COMPANY_* env vars). Empty form fields render as
 * [PLACEHOLDERS] so the template is always previewable.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'

import { createElement as h } from 'react'

import {
  Circle,
  Document,
  G,
  Image,
  Line,
  Page,
  Path,
  Polygon,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer'

import { computeChristmasInvoice } from './invoice-calc.js'

// ─── Brand palette (from the tx-christmaslights theme) ────────────────────────

const SPRUCE = '#0d3b1c' // deep pine header
const PINE = '#14532d' // secondary deep pine green
const ORANGE = '#ea580c' // primary orange-red
const RED = '#dc2626' // christmas red
const GOLD = '#e3a90d' // gold
const BLUE = '#2563eb' // accent blue
const GREEN = '#16a34a' // ornament green
const CREAM = '#FAFAFA' // page background
const PAPER = '#ffffff' // card/table surfaces
const PANEL = '#f4efe4' // warm panel rows
const INK = '#16301e' // body text (dark pine)
const MUTED = '#68746c' // muted text
const LINE = '#e6e0d2' // warm hairlines
const CREAM_TEXT = '#f2f7f2' // text on pine
const MUTED_CREAM = '#cfe3d4' // muted text on pine

export function getChristmasCompanyInfo() {
  return {
    name: process.env.CHRISTMAS_COMPANY_NAME || 'Texas Christmas Lights',
    tagline:
      process.env.CHRISTMAS_COMPANY_TAGLINE || 'Professional installation in Austin and surrounding areas',
    phone: process.env.CHRISTMAS_COMPANY_PHONE || '',
    email: process.env.CHRISTMAS_COMPANY_EMAIL || 'info@tx-christmaslights.com',
    website: process.env.CHRISTMAS_COMPANY_WEBSITE || 'www.tx-christmaslights.com',
    logoUrl: process.env.CHRISTMAS_INVOICE_LOGO_PATH || '/christmas-logo.svg',
  }
}

// `logoUrl` (from invoice settings) is a path relative to /public, e.g.
// "/images/tx-christmas-logo-full.png" — resolve it to a real file on disk.
function resolveLogoPath(logoUrl) {
  const relative = String(logoUrl || '/christmas-logo.svg').trim() || '/christmas-logo.svg'
  const candidate = path.join(process.cwd(), 'public', relative.replace(/^\/+/, ''))
  return existsSync(candidate) ? candidate : null
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0) / 100)

const num = (value) => new Intl.NumberFormat('en-US').format(Number(value || 0))

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/Chicago' }).format(
    value ? new Date(value) : new Date(),
  )

const ph = (value, placeholder) => {
  const text = value === null || value === undefined ? '' : String(value).trim()
  return text || placeholder
}

// ─── Christmas SVG motifs (drawn inline for the PDF) ─────────────────────────

function Ornament({ size = 14, color = RED }) {
  return h(
    Svg,
    { viewBox: '0 0 24 24', width: size, height: size },
    h(Circle, { cx: 12, cy: 15, r: 8, fill: color }),
    h(Circle, { cx: 9.6, cy: 12.6, r: 2.3, fill: '#ffffff', opacity: 0.45 }),
    h(Rect, { x: 10, y: 3, width: 4, height: 4.6, rx: 1, fill: GOLD }),
    h(Path, { d: 'M12 1.5v1.5', stroke: GOLD, strokeWidth: 1.5 }),
  )
}

function Star({ size = 12, color = GOLD }) {
  return h(
    Svg,
    { viewBox: '0 0 24 24', width: size, height: size },
    h(Polygon, {
      points: '12 2 14.6 8.7 21.8 9.2 16.2 14 17.8 21 12 17.3 6.2 21 7.8 14 2.2 9.2 9.4 8.7',
      fill: color,
    }),
  )
}

function Snowflake({ size = 10, color = MUTED_CREAM }) {
  const arms = [
    [12, 2, 12, 22],
    [2, 12, 22, 12],
    [4.9, 4.9, 19.1, 19.1],
    [19.1, 4.9, 4.9, 19.1],
  ]
  return h(
    Svg,
    { viewBox: '0 0 24 24', width: size, height: size },
    ...arms.map(([x1, y1, x2, y2], index) =>
      h(Line, { key: index, x1, y1, x2, y2, stroke: color, strokeWidth: 1.4 }),
    ),
    h(Line, { x1: 12, y1: 2, x2: 12, y2: 22, stroke: color, strokeWidth: 1.4 }),
  )
}

/**
 * A strand of holiday bulbs with a sagging cord, drawn across a strip.
 */
function StringLights({ width = 300, height = 30 }) {
  const bulbs = [RED, GREEN, GOLD, BLUE, ORANGE]
  const spacing = width / (bulbs.length + 1)
  const cordY = 8
  const bulbY = cordY + 7

  let pathD = `M 0 ${cordY}`
  bulbs.forEach((_, index) => {
    const x = spacing * (index + 1)
    const prev = index === 0 ? 0 : spacing * index
    pathD += ` Q ${(prev + x) / 2} ${cordY + 8} ${x} ${cordY}`
  })
  pathD += ` L ${width} ${cordY}`

  return h(
    Svg,
    { width, height, viewBox: `0 0 ${width} ${height}` },
    h(Path, { d: pathD, stroke: '#27432e', strokeWidth: 1.6, fill: 'none' }),
    ...bulbs.map((color, index) => {
      const x = spacing * (index + 1)
      return h(
        G,
        { key: index },
        h(Circle, { cx: x, cy: bulbY, r: 5, fill: color }),
        h(Circle, { cx: x - 1.7, cy: bulbY - 1.9, r: 1.5, fill: '#ffffff', opacity: 0.55 }),
        h(Rect, { x: x - 2, y: cordY - 1, width: 4, height: 5, rx: 1, fill: '#2a2a2a' }),
      )
    }),
  )
}

const OrnamentRow = ({ size = 12, marginRight = 8 }) =>
  h(
    View,
    { style: { flexDirection: 'row', alignItems: 'center' } },
    h(View, { style: { marginRight } }, Ornament({ size, color: RED })),
    h(View, { style: { marginRight } }, Ornament({ size, color: GOLD })),
    Ornament({ size, color: GREEN }),
  )

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { fontSize: 9, color: INK, backgroundColor: CREAM, fontFamily: 'Helvetica' },
  headerBand: {
    backgroundColor: SPRUCE,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  lightsStrip: { flexDirection: 'row', justifyContent: 'center', marginBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between' },
  brandBlock: { flex: 1, paddingRight: 12, flexDirection: 'row', alignItems: 'center' },
  logoChip: {
    backgroundColor: CREAM,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    maxWidth: 230,
  },
  logo: { width: 200, height: 44, objectFit: 'contain' },
  brandMeta: { flex: 1 },
  brandName: { color: CREAM_TEXT, fontSize: 16, fontFamily: 'Helvetica-Bold' },
  brandTagline: { color: MUTED_CREAM, fontSize: 7.5, marginTop: 3, lineHeight: 1.5 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  contactIcon: { width: 12, alignItems: 'center' },
  contactText: { color: MUTED_CREAM, fontSize: 8, marginLeft: 5 },
  invoiceBox: {
    width: 200,
    backgroundColor: CREAM,
    borderRadius: 4,
    borderTopWidth: 4,
    borderTopColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  invoiceTitle: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: PINE, letterSpacing: 2 },
  invoiceMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  metaLabel: { fontSize: 7, color: MUTED, letterSpacing: 0.5 },
  metaValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: INK, marginTop: 1 },

  body: { paddingHorizontal: 20, paddingTop: 14, flexGrow: 1 },
  billToRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billToBlock: { flex: 1, paddingRight: 16 },
  label: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: ORANGE, letterSpacing: 1.5 },
  customerName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: INK, marginTop: 4 },
  customerDetail: { fontSize: 9, color: MUTED, marginTop: 2, lineHeight: 1.6 },
  metaBlock: { width: 210 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  metaBlockLabel: { fontSize: 7.5, color: MUTED, letterSpacing: 0.5 },
  metaBlockValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: INK },

  table: {
    marginTop: 14,
    backgroundColor: PAPER,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PINE,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  th: { color: '#ffffff', fontSize: 7.5, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  thDesc: { flex: 1 },
  thQty: { width: 46, textAlign: 'right' },
  thUnit: { width: 78, textAlign: 'right' },
  thAmount: { width: 88, textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  tableRowAlt: { backgroundColor: PANEL },
  tdDesc: { flex: 1, fontSize: 8.5, paddingRight: 8 },
  tdQty: { width: 46, textAlign: 'right', fontSize: 8.5 },
  tdUnit: { width: 78, textAlign: 'right', fontSize: 8.5 },
  tdAmount: { width: 88, textAlign: 'right', fontSize: 8.5, fontFamily: 'Helvetica-Bold' },
  emptyTable: { padding: 14, alignItems: 'center' },
  emptyTableText: { fontSize: 8, color: MUTED },

  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  totalsCard: { width: 240 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { fontSize: 8.5, color: MUTED },
  totalValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: INK },
  balanceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ORANGE,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  balanceLabel: { color: '#ffffff', fontSize: 9, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  balanceValue: { color: '#ffffff', fontSize: 13, fontFamily: 'Helvetica-Bold' },

  notesBlock: { marginTop: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: PINE,
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  includedRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 7 },
  includedChip: {
    backgroundColor: PAPER,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  includedText: { fontSize: 7.5, color: PINE },
  termsText: { fontSize: 8, color: MUTED, lineHeight: 1.6, marginTop: 7 },
  notesText: { fontSize: 8, color: INK, lineHeight: 1.6, marginTop: 7 },

  footerBand: {
    backgroundColor: SPRUCE,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: MUTED_CREAM, fontSize: 7.5 },
  footerRight: { color: GOLD, fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
})

// ─── Small building blocks ───────────────────────────────────────────────────

const ContactRow = (icon, text) =>
  h(
    View,
    { style: s.contactRow },
    h(View, { style: s.contactIcon }, icon),
    h(Text, { style: s.contactText }, text),
  )

const labelValue = (label, value) =>
  h(
    View,
    { style: s.metaRow },
    h(Text, { style: s.metaBlockLabel }, label),
    h(Text, { style: s.metaBlockValue }, value),
  )

// ─── Sections ────────────────────────────────────────────────────────────────

function buildHeader(invoice, company, logo) {
  return h(
    View,
    { style: s.headerBand },
    h(View, { style: s.lightsStrip }, StringLights({ width: 300, height: 26 })),
    h(
      View,
      { style: s.headerRow },
      h(
        View,
        { style: s.brandBlock },
        logo ? h(View, { style: s.logoChip }, h(Image, { src: logo, style: s.logo })) : null,
        h(
          View,
          { style: s.brandMeta },
          h(Text, { style: s.brandName }, company.name),
          h(
            Text,
            { style: s.brandTagline },
            ph(company.tagline, 'Professional installation in Austin and surrounding areas'),
          ),
          ContactRow(Ornament({ size: 8, color: GOLD }), ph(company.phone, '(512) 775-0561')),
          ContactRow(Ornament({ size: 8, color: RED }), ph(company.email, 'info@tx-christmaslights.com')),
          ContactRow(Ornament({ size: 8, color: GREEN }), ph(company.website, 'www.tx-christmaslights.com')),
        ),
      ),
      h(
        View,
        { style: s.invoiceBox },
        h(Text, { style: s.invoiceTitle }, 'INVOICE'),
        h(
          View,
          { style: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 } },
          h(
            View,
            null,
            h(Text, { style: s.metaLabel }, 'NUMBER'),
            h(Text, { style: s.metaValue }, invoice.invoiceNumber),
          ),
          OrnamentRow({ size: 12 }),
        ),
        h(
          View,
          { style: s.invoiceMetaRow },
          h(
            View,
            null,
            h(Text, { style: s.metaLabel }, 'DATE'),
            h(Text, { style: s.metaValue }, formatDate(invoice.invoiceDate)),
          ),
          h(
            View,
            null,
            h(Text, { style: s.metaLabel }, 'DUE'),
            h(Text, { style: s.metaValue }, formatDate(invoice.dueDate)),
          ),
        ),
      ),
    ),
  )
}

function buildBillTo(inputs) {
  const addressParts = [
    inputs.propertyAddress,
    [inputs.propertyCity, inputs.propertyState, inputs.propertyZip].filter(Boolean).join(', '),
  ].filter(Boolean)

  return h(
    View,
    { style: s.billToRow },
    h(
      View,
      { style: s.billToBlock },
      h(Text, { style: s.label }, 'BILL TO'),
      h(Text, { style: s.customerName }, ph(inputs.customerName, '[CUSTOMER NAME]')),
      h(Text, { style: s.customerDetail }, ph(addressParts.join('\n') || ' ', '[PROPERTY ADDRESS]')),
      h(Text, { style: s.customerDetail }, ph(inputs.customerPhone, '[PHONE]')),
      h(Text, { style: s.customerDetail }, ph(inputs.customerEmail, '[EMAIL]')),
    ),
    h(
      View,
      { style: s.metaBlock },
      labelValue('Install date', ph(inputs.installDate, '—')),
      labelValue('Package', ph(inputs.packageLabel, '—')),
      labelValue('Template', ph(getTemplateLabel(inputs.templateKey), '—')),
    ),
  )
}

function buildLineItemsTable(computed) {
  const items = computed.lineItems || []
  const header = () =>
    h(
      View,
      { style: s.tableHeader },
      h(Text, { style: [s.th, s.thDesc] }, 'DESCRIPTION'),
      h(Text, { style: [s.th, s.thQty] }, 'QTY'),
      h(Text, { style: [s.th, s.thUnit] }, 'UNIT PRICE'),
      h(Text, { style: [s.th, s.thAmount] }, 'AMOUNT'),
    )

  return h(
    View,
    { style: s.table },
    header(),
    items.length
      ? items.map((item, index) =>
          h(
            View,
            { key: item.key || index, style: [s.tableRow, index % 2 === 1 ? s.tableRowAlt : null] },
            h(Text, { style: s.tdDesc }, item.description),
            h(Text, { style: s.tdQty }, num(item.quantity)),
            h(Text, { style: s.tdUnit }, money(item.unitPriceCents)),
            h(Text, { style: s.tdAmount }, money(item.amountCents)),
          ),
        )
      : h(
          View,
          { style: s.emptyTable },
          h(Text, { style: s.emptyTableText }, 'No line items — add items in the invoice builder.'),
        ),
  )
}

function buildTotals(computed) {
  const totalLine = (label, value) =>
    h(
      View,
      { style: s.totalLine },
      h(Text, { style: s.totalLabel }, label),
      h(Text, { style: s.totalValue }, value),
    )

  return h(
    View,
    { style: s.totalsRow },
    h(
      View,
      { style: s.totalsCard },
      totalLine('Subtotal', money(computed.subtotalCents)),
      h(
        View,
        { style: s.totalLine },
        h(Text, { style: s.totalLabel }, 'Deposit applied'),
        h(Text, { style: s.totalValue }, `- ${money(computed.depositCents)}`),
      ),
      h(
        View,
        { style: s.balanceLine },
        h(Text, { style: s.balanceLabel }, 'BALANCE DUE'),
        h(Text, { style: s.balanceValue }, money(computed.balanceDueCents)),
      ),
    ),
  )
}

function buildNotes(preset) {
  const included = preset?.included || []
  return h(
    View,
    { style: s.notesBlock },
    h(
      View,
      { style: s.sectionTitleRow },
      Star({ size: 10 }),
      h(Text, { style: s.sectionTitle }, 'INCLUDED WITH EVERY PACKAGE'),
    ),
    h(
      View,
      { style: s.includedRow },
      ...included.map((item) =>
        h(View, { key: item, style: s.includedChip }, h(Text, { style: s.includedText }, item)),
      ),
    ),
    h(
      Text,
      { style: s.termsText },
      'A deposit holds your install window. The balance is due on the day of installation, before we leave. ' +
        'Deposits are non-refundable within 14 days of your scheduled install date, but we can reschedule at no ' +
        'charge with at least 7 days\u2019 notice.',
    ),
  )
}

function buildFooter(company) {
  return h(
    View,
    { style: s.footerBand },
    h(
      View,
      { style: s.footerLeft },
      h(View, { style: { marginRight: 8 } }, Snowflake({ size: 10 })),
      h(
        Text,
        { style: s.footerText },
        `${company.name} · Austin, TX · Thank you for choosing us this holiday season.`,
      ),
    ),
    h(Text, { style: s.footerRight }, 'MERRY & BRIGHT'),
  )
}

const getTemplateLabel = (key) => {
  if (key === 'christmas-classic' || !key) {
    return 'Christmas Lights — Classic'
  }
  return key
}

// ─── Document ────────────────────────────────────────────────────────────────

/**
 * @param {object} invoice Invoice record — needs invoiceNumber, invoiceDate,
 *                         dueDate and data.{inputs,computed}
 * @param {object} [options]
 * @param {object} [options.company] Override company info (from settings)
 * @param {string|Buffer} [options.logo] Override logo (path or buffer)
 */
export function ChristmasInvoiceDocument(invoice, options = {}) {
  const company = options.company || getChristmasCompanyInfo()
  const logo = options.logo || resolveLogoPath(company.logoUrl)
  const inputs = invoice.data?.inputs || {}
  const computed = invoice.data?.computed || computeChristmasInvoice(inputs)
  const templateKey = inputs.templateKey || invoice.templateKey || 'christmas-classic'

  if (templateKey !== 'christmas-classic') {
    console.warn(`[christmas/invoice-pdf] unknown template "${templateKey}" — using christmas-classic.`)
  }

  const preset = {
    included: ['Professional installation', 'Mid-season bulb service', 'Post-holiday removal'],
  }

  return h(
    Document,
    { title: `Invoice ${invoice.invoiceNumber} — ${inputs.customerName || ''}` },
    h(
      Page,
      { size: 'LETTER', style: s.page },
      buildHeader(invoice, company, logo),
      h(
        View,
        { style: s.body },
        buildBillTo(inputs),
        buildLineItemsTable(computed),
        buildTotals(computed),
        buildNotes(preset),
        h(Text, { style: s.notesText }, ph(inputs.notes, '')),
      ),
      buildFooter(company),
    ),
  )
}

/**
 * Render an invoice to a PDF Buffer.
 */
export async function renderChristmasInvoicePdf(invoice, options = {}) {
  const instance = pdf(ChristmasInvoiceDocument(invoice, options))
  const blob = await instance.toBlob().catch(() => null)
  if (blob) {
    return Buffer.from(await blob.arrayBuffer())
  }
  const buffer = await instance.toBuffer()
  if (Buffer.isBuffer(buffer)) {
    return buffer
  }
  const { finished } = await import('node:stream/promises')
  const chunks = []
  buffer.on('data', (chunk) => chunks.push(chunk))
  await finished(buffer)
  return Buffer.concat(chunks)
}

export function christmasInvoiceFileName(invoice) {
  const name = String(invoice.customerName || 'Customer')
    .trim()
    .replaceAll(/[^a-zA-Z0-9 _-]/g, '')
    .replaceAll(/\s+/g, ' ')
  return `${name} - Invoice ${invoice.invoiceNumber}.pdf`
}
