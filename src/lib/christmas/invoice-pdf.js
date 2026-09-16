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
  Font,
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

// Registered as two families (rather than weight variants on one family) to
// mirror the previous Helvetica / Helvetica-Bold split — fontkit's weight
// matching inside @react-pdf/renderer is unreliable, so a dedicated "Bold"
// family sidesteps it entirely.
const SWITZER_DIR = path.join(process.cwd(), 'public', 'fonts')

Font.register({
  family: 'Switzer',
  src: path.join(SWITZER_DIR, 'Switzer-Variable.ttf'),
})

Font.register({
  family: 'Switzer Bold',
  src: path.join(SWITZER_DIR, 'Switzer-Variable.ttf'),
})

// ─── Brand palette (from the tx-christmaslights theme) ────────────────────────

const SPRUCE = '#0d3b1c' // deep pine header
const PINE = '#14532d' // secondary deep pine green
const ORANGE = '#DB2626' // primary orange-red
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
  const relative = String(logoUrl || '/christmas-logo-reversed.svg').trim() || '/christmas-logo-reversed.svg'
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

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date()
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/Chicago' }).format(
    safeDate,
  )
}

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
function StringLights({ width = 500, height = 30 }) {
  const bulbs = [RED, GREEN, GOLD, BLUE, RED, GREEN, GOLD, BLUE, ORANGE, GREEN, GOLD]
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
        h(Rect, { x: x - 2, y: cordY - 1, width: 4, height: 5, rx: 1, fill: '#A6A6A6' }),
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

/*
 * Three densities. A quote is rendered at the first one that fits inside the
 * page budget (see `renderChristmasInvoicePdf`), so a long list of lights
 * tightens up instead of spilling onto another page.
 */
const DENSITIES = [
  {
    rowPadding: 4.5,
    tableFont: 8,
    bodyFont: 8,
    noticeFont: 7.5,
    logo: 68,
    headerPad: 8,
    gap: 8,
    details: true,
  },
  {
    rowPadding: 3.2,
    tableFont: 7.4,
    bodyFont: 7.4,
    noticeFont: 7,
    logo: 56,
    headerPad: 6,
    gap: 6,
    details: true,
  },
  {
    rowPadding: 2.4,
    tableFont: 6.9,
    bodyFont: 7,
    noticeFont: 6.6,
    logo: 48,
    headerPad: 5,
    gap: 5,
    details: true,
  },
  // Last resort for a very long list: the details column goes, since its words are already in the description.
  {
    rowPadding: 2,
    tableFont: 6.6,
    bodyFont: 6.8,
    noticeFont: 6.4,
    logo: 44,
    headerPad: 4,
    gap: 4,
    details: false,
  },
]

/** The density the document being built is using — set alongside `s`. */
let density = DENSITIES[0]

const createStyles = (d) =>
  StyleSheet.create({
    /* paddingBottom clears the footer, which is pinned to the bottom of every page. */
    page: { fontSize: 9, color: INK, backgroundColor: CREAM, fontFamily: 'Switzer', paddingBottom: 44 },
    headerBand: {
      backgroundColor: SPRUCE,
      paddingHorizontal: 20,
      paddingTop: d.headerPad,
      paddingBottom: d.headerPad + 1,
    },
    lightsStrip: { flexDirection: 'row', justifyContent: 'center', marginBottom: 2 },
    slimHeaderBand: {
      backgroundColor: SPRUCE,
      paddingHorizontal: 20,
      paddingVertical: 9,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    slimHeaderTitle: { color: CREAM_TEXT, fontSize: 10, fontFamily: 'Switzer Bold', letterSpacing: 0.5 },
    slimHeaderMeta: { color: MUTED_CREAM, fontSize: 8.5 },
    headerRow: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between' },
    brandBlock: { flex: 1, paddingRight: 12, flexDirection: 'row', alignItems: 'center' },
    logoChip: {
      marginRight: 12,
      maxWidth: 230,
    },
    logo: { width: d.logo, height: d.logo, objectFit: 'contain' },
    brandMeta: { flex: 1 },
    brandName: { color: CREAM_TEXT, fontSize: 16, fontFamily: 'Switzer Bold' },
    brandTagline: { color: MUTED_CREAM, fontSize: 9.5, marginTop: 2, lineHeight: 1.4 },
    contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    contactIcon: { width: 12, alignItems: 'center' },
    contactText: { color: MUTED_CREAM, fontSize: 8, marginLeft: 5 },
    invoiceBox: {
      width: 200,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    invoiceTitle: {
      fontSize: 18,
      fontWeight: 800,
      fontFamily: 'Switzer Bold',
      color: CREAM,
      letterSpacing: 1.5,
    },
    invoiceMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    metaLabel: { fontSize: 7, color: CREAM, letterSpacing: 0.5 },
    metaValue: { fontSize: 8, fontFamily: 'Switzer Bold', color: CREAM, marginTop: 1 },
    quoteValidText: { fontSize: 7, color: MUTED_CREAM, marginTop: 4 },

    body: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
    billToRow: { flexDirection: 'row', justifyContent: 'space-between' },
    billToBlock: { flex: 1, paddingRight: 16 },
    label: { fontSize: 8, fontFamily: 'Switzer Bold', color: ORANGE, letterSpacing: 1.5 },
    customerName: { fontSize: 12.5, fontFamily: 'Switzer Bold', color: INK, marginTop: 3 },
    customerDetail: { fontSize: 8.5, color: MUTED, marginTop: 1, lineHeight: 1.45 },
    metaBlock: { width: 210 },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 2.5,
      borderBottomWidth: 1,
      borderBottomColor: LINE,
    },
    metaBlockLabel: { fontSize: 8.5, color: MUTED, letterSpacing: 0.5 },
    metaBlockValue: { fontSize: 8.5, fontFamily: 'Switzer Bold', color: INK },

    table: {
      marginTop: d.gap,
      backgroundColor: PAPER,
      borderWidth: 1,
      borderColor: LINE,
      borderRadius: 4,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: PINE,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    th: { color: '#ffffff', fontSize: 8, fontFamily: 'Switzer Bold', letterSpacing: 0.5 },
    thDesc: { flex: 1, paddingRight: 8 },
    thFeet: { width: 48, textAlign: 'right', paddingRight: 8 },
    thUnit: { width: 60, textAlign: 'right', paddingRight: 8 },
    thPrice: { width: 62, textAlign: 'right', paddingRight: 8 },
    thEarlyPrice: { width: 62, textAlign: 'right', paddingRight: 8 },
    thNotes: { width: 100 },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: d.rowPadding,
      paddingHorizontal: 10,
      borderTopWidth: 1,
      borderTopColor: LINE,
    },
    tableRowAlt: { backgroundColor: PANEL },
    tdDesc: { flex: 1, fontSize: d.tableFont, paddingRight: 8 },
    tdFeet: { width: 48, textAlign: 'right', fontSize: d.tableFont, paddingRight: 8 },
    tdUnit: { width: 60, textAlign: 'right', fontSize: d.tableFont, paddingRight: 8 },
    tdPrice: {
      width: 62,
      textAlign: 'right',
      fontSize: d.tableFont,
      fontFamily: 'Switzer Bold',
      paddingRight: 8,
    },
    tdEarlyPrice: {
      width: 62,
      textAlign: 'right',
      fontSize: 8.5,
      fontFamily: 'Switzer Bold',
      color: PINE,
      paddingRight: 8,
    },
    tdNotes: { width: 100, fontSize: 7.5, color: MUTED },
    emptyTable: { padding: 14, alignItems: 'center' },
    emptyTableText: { fontSize: 9.5, color: MUTED },

    pricingSection: { marginTop: d.gap },
    pricingLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
    pricingLabel: { fontSize: 8.5, color: MUTED },
    pricingValue: { fontSize: 8.5, fontFamily: 'Switzer Bold', color: INK },
    contractCostBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: PINE,
      borderRadius: 4,
      paddingVertical: 7,
      paddingHorizontal: 10,
      marginTop: 7,
    },
    contractCostLabel: { color: '#ffffff', fontSize: 9, fontFamily: 'Switzer Bold', letterSpacing: 1 },
    contractCostValue: { color: '#ffffff', fontSize: 13, fontFamily: 'Switzer Bold' },
    saveBanner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: GOLD,
      borderRadius: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      marginTop: 6,
    },
    saveBannerText: { fontSize: 8, fontFamily: 'Switzer Bold', color: INK },

    paymentTermsBlock: { marginTop: d.gap },
    paymentTermsTable: {
      marginTop: 6,
      borderWidth: 1,
      borderColor: LINE,
      borderRadius: 4,
      overflow: 'hidden',
    },
    paymentTermsRow: {
      flexDirection: 'row',
      backgroundColor: '#fff6b8',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderTopWidth: 1,
      borderTopColor: '#e8d97a',
    },
    paymentTermsRowFirst: { borderTopWidth: 0 },
    paymentTermsLabel: { flex: 1, fontSize: 8.5, color: INK },
    paymentTermsAmount: {
      width: 90,
      fontSize: 8.5,
      fontFamily: 'Switzer Bold',
      color: INK,
      textAlign: 'right',
    },

    totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    totalsCard: { width: 240 },
    totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
    totalLabel: { fontSize: 9.5, color: MUTED },
    totalValue: { fontSize: 9.5, fontFamily: 'Switzer Bold', color: INK },
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
    balanceLabel: { color: '#ffffff', fontSize: 10, fontFamily: 'Switzer Bold', letterSpacing: 1 },
    balanceValue: { color: '#ffffff', fontSize: 13, fontFamily: 'Switzer Bold' },

    notesBlock: { marginTop: d.gap - 2 },
    mockupPicture: { marginTop: 10, width: '100%', maxHeight: 560, objectFit: 'contain', borderRadius: 6 },
    mockupCaption: { fontSize: 8.5, color: MUTED, lineHeight: 1.4, marginTop: 8 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: {
      fontSize: 8,
      fontFamily: 'Switzer Bold',
      color: PINE,
      letterSpacing: 1.5,
      marginLeft: 6,
    },
    termsText: { fontSize: d.bodyFont, color: MUTED, lineHeight: 1.3, marginTop: 3 },
    notesText: { fontSize: d.bodyFont, color: INK, lineHeight: 1.3, marginTop: 3 },

    closingBlock: {},
    noticeSection: { marginTop: d.gap - 2, flexDirection: 'row', gap: 6 },
    noticeBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: INK,
      paddingVertical: 3.5,
      paddingHorizontal: 8,
    },
    noticeBoxNoBorderTop: {},
    noticeHeading: { fontSize: d.noticeFont, fontFamily: 'Switzer Bold', color: INK, lineHeight: 1.25 },
    noticeBody: { fontSize: d.noticeFont - 0.4, color: INK, lineHeight: 1.3, marginTop: 2 },

    footerBand: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: SPRUCE,
      paddingVertical: 8,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    footerLeft: { flexDirection: 'row', alignItems: 'center' },
    footerText: { color: MUTED_CREAM, fontSize: 9.5 },
    footerRight: { color: GOLD, fontSize: 10, fontFamily: 'Switzer Bold', letterSpacing: 0.5 },
    footerPage: { color: MUTED_CREAM, fontSize: 8, marginRight: 10 },
  })

/*
 * The styles for the document being built. Swapped right before the element
 * tree is created (which is synchronous, so a second render in the same
 * process can never steal another document's styles).
 */
let s = createStyles(DENSITIES[0])

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

/** The full letterhead band — page 1 only. */
function buildFullHeader(invoice, company, logo, inputs) {
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
          h(Text, { style: s.brandName }, 'Texas Christmas Lights'),
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
        h(
          View,
          { style: s.invoiceMetaRow },
          h(
            View,
            null,
            h(Text, { style: s.metaLabel }, 'PROJECT #'),
            h(Text, { style: s.metaValue }, ph(inputs.projectNumber, '—')),
          ),
          h(
            View,
            null,
            h(Text, { style: s.metaLabel }, 'CREATED BY'),
            h(Text, { style: s.metaValue }, ph(inputs.quoteCreatedBy, '—')),
          ),
        ),
        inputs.quoteValidDays
          ? h(Text, { style: s.quoteValidText }, `This quote is good for ${inputs.quoteValidDays} days`)
          : null,
      ),
    ),
  )
}

/** Slim continuation band for page 2 and beyond, so the quote keeps its top margin without a second letterhead. */
function buildSlimHeader(invoice, customerName) {
  return h(
    View,
    { style: s.slimHeaderBand },
    h(Text, { style: s.slimHeaderTitle }, `Invoice ${invoice.invoiceNumber}`),
    h(Text, { style: s.slimHeaderMeta }, `${customerName || 'Customer'} · continued`),
  )
}

/*
 * A fixed band that draws nothing on page 1 (the full letterhead is already
 * there) and the slim band on every page after it, so a quote that runs long
 * never starts a page with text against the paper's edge. It carries no image:
 * react-pdf resolves images before layout, and `render` runs after.
 */
function buildContinuationHeader(invoice) {
  return h(View, {
    fixed: true,
    render: ({ pageNumber }) => (pageNumber === 1 ? null : buildSlimHeader(invoice, invoice.customerName)),
  })
}

function buildBillTo(inputs, customerName) {
  const addressParts = [
    inputs.propertyAddress,
    [inputs.propertyCity, inputs.propertyState, inputs.propertyZip].filter(Boolean).join(', '),
  ].filter(Boolean)

  return h(
    View,
    { style: s.billToRow, wrap: false },
    h(
      View,
      { style: s.billToBlock },
      h(Text, { style: s.label }, 'BILL TO'),
      h(Text, { style: s.customerName }, ph(customerName, '[CUSTOMER NAME]')),
      h(Text, { style: s.customerDetail }, ph(addressParts.join('\n') || ' ', '[PROPERTY ADDRESS]')),
      h(Text, { style: s.customerDetail }, ph(inputs.customerPhone, '[PHONE]')),
      h(Text, { style: s.customerDetail }, ph(inputs.customerEmail, '[EMAIL]')),
    ),
    h(
      View,
      { style: s.metaBlock },
      labelValue('Color lights', ph(inputs.colorLights, '—')),
      labelValue('Install date', ph(inputs.installDate, '—')),
      labelValue('Package', ph(inputs.packageLabel, '—')),
      labelValue('Template', ph(getTemplateLabel(inputs.templateKey), '—')),
    ),
  )
}

/** Compact "Category · Location · Color · N" annotation line under the description. */
const lineItemMeta = (item) => {
  const nrLabel = item.nr === 'N' ? 'New' : item.nr === 'R' ? 'Reuse' : ''
  return [item.category, item.location, item.color, nrLabel].filter(Boolean).join(' · ')
}

function buildLineItemsTable(computed) {
  const items = computed.lineItems || []
  const header = () =>
    h(
      View,
      // Repeats at the top of the table on every page it continues onto.
      { style: s.tableHeader, fixed: true },
      h(Text, { style: [s.th, s.thFeet] }, 'FEET/QTY'),
      h(Text, { style: [s.th, s.thDesc] }, 'DESCRIPTION'),
      h(Text, { style: [s.th, s.thUnit] }, 'UNIT PRICE'),
      h(Text, { style: [s.th, s.thPrice] }, 'PRICE'),
      h(Text, { style: [s.th, s.thEarlyPrice] }, 'EARLY PRICE'),
      density.details ? h(Text, { style: [s.th, s.thNotes] }, 'DETAILS/NOTES') : null,
    )

  return h(
    View,
    { style: s.table },
    header(),
    items.length
      ? items.map((item, index) =>
          h(
            View,
            {
              key: item.key || index,
              style: [s.tableRow, index % 2 === 1 ? s.tableRowAlt : null],
              wrap: false,
            },
            h(Text, { style: s.tdFeet }, num(item.quantity)),
            h(Text, { style: s.tdDesc }, item.description),
            h(Text, { style: s.tdUnit }, money(item.unitPriceCents)),
            h(Text, { style: s.tdPrice }, money(item.priceCents)),
            h(Text, { style: s.tdEarlyPrice }, money(item.earlyPriceCents)),
            density.details ? h(Text, { style: s.tdNotes }, lineItemMeta(item) || '—') : null,
          ),
        )
      : h(
          View,
          { style: s.emptyTable },
          h(Text, { style: s.emptyTableText }, 'No line items — add items in the invoice builder.'),
        ),
  )
}

/**
 * Materials + sales tax, leading into the Total Contract Cost. Per-line
 * regular/early pricing already lives in the line items table (PRICE / EARLY
 * PRICE columns), so this only needs the one aggregate MATERIALS figure
 * rather than repeating a full regular-vs-early breakdown.
 */
function buildPricingBreakdown(computed) {
  return h(
    View,
    { style: s.pricingSection, wrap: false },
    h(
      View,
      { style: s.pricingLine },
      h(Text, { style: s.pricingLabel }, 'MATERIALS'),
      h(Text, { style: s.pricingValue }, money(computed.materialsTotalCents)),
    ),
    h(
      View,
      { style: s.pricingLine },
      h(Text, { style: s.pricingLabel }, `SALES TAX (${computed.salesTaxRatePercent}%)`),
      h(Text, { style: s.pricingValue }, money(computed.salesTaxCents)),
    ),
    h(
      View,
      { style: s.contractCostBar },
      h(Text, { style: s.contractCostLabel }, 'TOTAL CONTRACT COST'),
      h(Text, { style: s.contractCostValue }, money(computed.totalContractCostCents)),
    ),
    computed.payInFullDiscountPercent > 0
      ? h(
          View,
          { style: s.saveBanner },
          h(
            Text,
            { style: s.saveBannerText },
            `SAVE ${computed.payInFullDiscountPercent}% (${money(computed.payInFullSavingsCents)}) BY PAYING IN FULL TODAY`,
          ),
          h(Text, { style: s.saveBannerText }, money(computed.payInFullAmountCents)),
        )
      : null,
  )
}

function buildPaymentTermsTable(computed) {
  const milestones = computed.paymentMilestones || []
  if (!milestones.length) {
    return null
  }
  return h(
    View,
    { style: s.paymentTermsBlock, wrap: false },
    h(
      View,
      { style: s.sectionTitleRow },
      Star({ size: 10 }),
      h(Text, { style: s.sectionTitle }, 'PAYMENT TERMS'),
    ),
    h(
      View,
      { style: s.paymentTermsTable },
      ...milestones.map((milestone, index) => {
        const dueText = milestone.date ? ` — due ${formatDate(milestone.date)}` : ''
        return h(
          View,
          {
            key: milestone.key || index,
            style: [s.paymentTermsRow, index === 0 ? s.paymentTermsRowFirst : null],
          },
          h(
            Text,
            { style: s.paymentTermsLabel },
            `${ph(milestone.label, 'Payment')} (${milestone.percent}%)${dueText}`,
          ),
          h(Text, { style: s.paymentTermsAmount }, money(milestone.amountCents)),
        )
      }),
    ),
  )
}

/**
 * Legacy subtotal/deposit/balance block — only shown when this quote has no
 * payment milestones, since Total Contract Cost + the Payment Terms table
 * already cover "what's owed and when" and showing both would read as two
 * conflicting totals on the same page.
 */
function buildTotals(computed) {
  if ((computed.paymentMilestones || []).length > 0) {
    return null
  }

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

function buildNotes() {
  return h(
    View,
    { style: s.notesBlock, wrap: false },

    h(
      Text,
      { style: s.termsText },
      'A deposit holds your install window. The balance is due on the day of installation, before we leave. ' +
        'Deposits are non-refundable within 14 days of your scheduled install date, but we can reschedule at no ' +
        'charge with at least 7 days\u2019 notice.',
    ),
  )
}

/** Standard guarantee + scheduling/approval notice, boxed like the printed order form. */
function buildGuaranteeAndApprovalNotice() {
  return h(
    View,
    { style: s.noticeSection },
    h(
      View,
      { style: s.noticeBox, wrap: false },
      h(
        Text,
        { style: s.noticeHeading },
        'Texas Christmas Lights guarantees that your display will be fully functional and looking its best upon completion of installation.',
      ),
      h(
        Text,
        { style: s.noticeBody },
        'If you notice any issues between our proactive service visits, please contact us immediately. There is no additional charge for service required to keep your display working properly, except in cases of vandalism, damage caused by individuals or animals, or extreme weather conditions.',
      ),
    ),
    h(
      View,
      { style: [s.noticeBox, s.noticeBoxNoBorderTop], wrap: false },
      h(
        Text,
        { style: s.noticeHeading },
        'Regarding the scheduling, incentives, and approvals for your project, please note that our schedule fills very quickly.',
      ),
      h(
        Text,
        { style: s.noticeBody },
        'To ensure timely scheduling and to secure any early incentives, please initial the checkboxes for the approved items and sign the attached document.',
      ),
      h(
        Text,
        { style: s.noticeBody },
        'Once completed, please return your order via phone, mail, email, or fax as soon as possible.',
      ),
    ),
  )
}

function buildFooter() {
  return h(
    View,
    { style: s.footerBand, fixed: true },
    h(
      View,
      { style: s.footerLeft },
      h(View, { style: { marginRight: 8 } }, Snowflake({ size: 10 })),
      h(
        Text,
        { style: s.footerText },
        `Texas Christmas Lights · Austin, TX · Thank you for choosing us this holiday season.`,
      ),
    ),
    h(
      View,
      { style: s.footerLeft },
      h(Text, {
        style: s.footerPage,
        // Only worth showing once a quote runs past one page.
        render: ({ pageNumber, totalPages }) => (totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : ''),
      }),
      h(Text, { style: s.footerRight }, 'MERRY & BRIGHT'),
    ),
  )
}

const getTemplateLabel = (key) => {
  if (key === 'christmas-classic' || !key) {
    return 'Christmas Lights — Classic'
  }
  return key
}

/** Second page: the customer's house with their lights, from the lights mockup. */
function buildMockupPage({ picture, invoice, company, logo, inputs }) {
  return h(
    Page,
    { size: 'LETTER', style: s.page },
    buildFullHeader(invoice, company, logo, inputs),
    h(
      View,
      { style: s.body },
      h(
        View,
        { style: s.sectionTitleRow },
        Ornament({ size: 10 }),
        h(Text, { style: s.sectionTitle }, 'YOUR LIGHTS'),
      ),
      h(Image, { src: { data: picture, format: 'jpg' }, style: s.mockupPicture }),
      h(
        Text,
        { style: s.mockupCaption },
        'A preview of your lights, drawn on a photo of your home. Final placement and bulb spacing are confirmed ' +
          'with you on install day.',
      ),
    ),
    buildFooter(company),
  )
}

// ─── Document ────────────────────────────────────────────────────────────────

/**
 * @param {object} invoice Invoice record — needs invoiceNumber, invoiceDate,
 *                         dueDate and data.{inputs,computed}
 * @param {object} [options]
 * @param {object} [options.company] Override company info (from settings)
 * @param {string|Buffer} [options.logo] Override logo (path or buffer)
 * @param {Buffer|null} [options.mockupPicture] Lights mockup JPEG, added as a second page
 */
export function ChristmasInvoiceDocument(invoice, options = {}) {
  // Synchronous: the tree below captures these style objects as it is built.
  density = DENSITIES[Math.min(options.density || 0, DENSITIES.length - 1)]
  s = createStyles(density)
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
    { title: `Invoice ${invoice.invoiceNumber} — ${invoice.customerName || ''}` },
    h(
      Page,
      { size: 'LETTER', style: s.page },
      buildContinuationHeader(invoice),
      buildFullHeader(invoice, company, logo, inputs),
      h(
        View,
        { style: s.body },
        buildBillTo(inputs, invoice.customerName),
        buildLineItemsTable(computed),
        buildPricingBreakdown(computed),
        buildTotals(computed),
        buildPaymentTermsTable(computed),
        h(
          View,
          // Terms, notes and both notices move to the next page as one block, never leaving an orphan behind.
          { style: s.closingBlock, wrap: false },
          buildNotes(preset),
          inputs.notes?.trim() ? h(Text, { style: s.notesText }, inputs.notes.trim()) : null,
          buildGuaranteeAndApprovalNotice(),
        ),
      ),
      buildFooter(company),
    ),
    options.mockupPicture
      ? buildMockupPage({ picture: options.mockupPicture, invoice, company, logo, inputs })
      : null,
  )
}

/*
 * The invoice's lights mockup picture, if it has one. Best-effort: a missing
 * table or database hiccup just renders the invoice without the extra page.
 * Imported lazily so plain Node scripts can render PDFs without a database.
 */
async function loadMockupPicture(invoiceId) {
  if (!invoiceId) {
    return null
  }
  try {
    const { ensureChristmasMockupTables, getInvoiceMockupPicture } = await import('./mockup-db.js')
    await ensureChristmasMockupTables()
    return await getInvoiceMockupPicture(invoiceId)
  } catch (error) {
    console.warn('[christmas/invoice-pdf] mockup picture unavailable', error.message)
    return null
  }
}

/** Pages in a rendered PDF buffer. */
function countPages(buffer) {
  return (buffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length
}

async function renderAtDensity(invoice, options, level) {
  const instance = pdf(ChristmasInvoiceDocument(invoice, { ...options, density: level }))
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

/* A quote is two pages; the lights mockup, when there is one, adds its own. */
const MAX_QUOTE_PAGES = 2

/**
 * Render an invoice to a PDF Buffer. Includes the invoice's lights mockup
 * picture unless `options.mockupPicture` is given (pass null to leave it out).
 *
 * The quote is re-rendered at a tighter density if it runs past two pages, so
 * a long list of lights never turns into a third page of leftovers.
 */
export async function renderChristmasInvoicePdf(invoice, options = {}) {
  const mockupPicture =
    options.mockupPicture === undefined ? await loadMockupPicture(invoice.id) : options.mockupPicture
  const budget = MAX_QUOTE_PAGES + (mockupPicture ? 1 : 0)

  let rendered = null
  for (let level = 0; level < DENSITIES.length; level += 1) {
    rendered = await renderAtDensity(invoice, { ...options, mockupPicture }, level)
    if (countPages(rendered) <= budget) {
      return rendered
    }
  }
  console.warn(
    `[christmas/invoice-pdf] ${invoice.invoiceNumber} still needs ${countPages(rendered)} pages at the tightest density.`,
  )
  return rendered
}

export function christmasInvoiceFileName(invoice) {
  const name = String(invoice.customerName || 'Customer')
    .trim()
    .replaceAll(/[^a-zA-Z0-9 _-]/g, '')
    .replaceAll(/\s+/g, ' ')
  return `${name} - Invoice ${invoice.invoiceNumber}.pdf`
}
