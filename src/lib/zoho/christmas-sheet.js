/*
 * Zoho Sheet sync — appends one row per Christmas invoice so the client can
 * browse invoices in a familiar spreadsheet.
 *
 * Uses the Zoho Sheet API v2 `worksheet.records.add` method (same flow as
 * src/lib/zoho/sheet.js). Create a worksheet with row-1 headers matching
 * CHRISTMAS_INVOICE_SHEET_COLUMNS below.
 *
 * Required env vars:
 *   ZOHO_SHEET_RESOURCE_ID   (or CHRISTMAS_SHEET_RESOURCE_ID)
 * Optional:
 *   ZOHO_SHEET_WORKSHEET_NAME (or CHRISTMAS_SHEET_WORKSHEET_NAME, default 'Christmas Invoices')
 */

import { getZohoAccessToken, hasZohoCredentials, zohoAuthHeader } from './auth.js'

// Up to this many line items get their own pair of columns
// (ITEM_1_DESCRIPTION, ITEM_1_PRICE, ITEM_2_DESCRIPTION, ...) — invoices with
// more items just leave the extra slots blank.
export const CHRISTMAS_INVOICE_MAX_SHEET_ITEMS = 9

const itemColumnNames = (itemNumber) => [`ITEM_${itemNumber}_DESCRIPTION`, `ITEM_${itemNumber}_PRICE`]

export const CHRISTMAS_INVOICE_SHEET_COLUMNS = [
  // Meta
  'Invoice Number',
  'Date',
  'Updated At',
  'Status',
  'Invoice ID',
  // Customer & property
  'Customer',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Address',
  'City',
  'State',
  'ZIP',
  // Template & package
  'Template',
  'Package',
  'Install Date',
  // Money
  'Subtotal',
  'Deposit',
  'Balance Due',
  // Payload
  'Line Items',
  ...Array.from({ length: CHRISTMAS_INVOICE_MAX_SHEET_ITEMS }, (_, index) =>
    itemColumnNames(index + 1),
  ).flat(),
  'Notes',
  'WorkDrive Folder',
]

const money = (cents) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100)

const blank = (value) => (value === null || value === undefined || value === '' ? '' : value)

/** Parses `value` to a `Date`, or `null` if it's missing/unparseable. */
const safeDate = (value) => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** One item's [description, price] columns — blank pair if there's no item in that slot. */
const itemToColumnEntries = (item, itemNumber) => {
  const [descriptionColumn, priceColumn] = itemColumnNames(itemNumber)
  if (!item) {
    return [
      [descriptionColumn, ''],
      [priceColumn, ''],
    ]
  }
  return [
    [descriptionColumn, blank(item.description)],
    [priceColumn, item.priceCents ? money(item.priceCents) : ''],
  ]
}

export function invoiceToSheetRecord(invoice) {
  const { inputs = {}, computed = {} } = invoice.data || {}
  const lineItems = Array.isArray(computed.lineItems) ? computed.lineItems : []
  const numberedItemColumns = Object.fromEntries(
    Array.from({ length: CHRISTMAS_INVOICE_MAX_SHEET_ITEMS }, (_, index) =>
      itemToColumnEntries(lineItems[index], index + 1),
    ).flat(),
  )

  const lineItemsCell = lineItems
    .map((item) => {
      const nrLabel = item.nr === 'N' ? 'New' : item.nr === 'R' ? 'Reuse' : ''
      const meta = [item.category, item.location, item.color, nrLabel].filter(Boolean).join(' · ')
      return [
        meta ? `[${meta}]` : '',
        item.description,
        item.quantity && item.quantity !== 1 ? `Qty ${item.quantity}` : '',
        item.unitPriceCents ? `@ ${money(item.unitPriceCents)}` : '',
        item.amountCents ? `= ${money(item.amountCents)}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    })
    .join(' | ')

  return {
    'Invoice Number': invoice.invoiceNumber,
    Date: (safeDate(invoice.invoiceDate) || safeDate(invoice.createdAt) || new Date())
      .toISOString()
      .slice(0, 10),
    'Updated At': safeDate(invoice.updatedAt)?.toISOString().slice(0, 19).replace('T', ' ') || '',
    Status: invoice.status || 'draft',
    'Invoice ID': invoice.id || '',

    Customer: invoice.customerName || inputs.customerName || '',
    'First Name': invoice.customerFirstName || inputs.customerFirstName || '',
    'Last Name': invoice.customerLastName || inputs.customerLastName || '',
    Email: invoice.customerEmail || inputs.customerEmail || '',
    Phone: invoice.customerPhone || inputs.customerPhone || '',
    Address: invoice.propertyAddress || inputs.propertyAddress || '',
    City: invoice.propertyCity || inputs.propertyCity || '',
    State: invoice.propertyState || inputs.propertyState || 'TX',
    ZIP: invoice.propertyZip || inputs.propertyZip || '',

    Template: invoice.templateKey || inputs.templateKey || 'christmas-classic',
    Package: blank(inputs.packageLabel),
    'Install Date': blank(inputs.installDate),

    Subtotal: money(computed.subtotalCents),
    Deposit: money(computed.depositCents),
    'Balance Due': money(computed.balanceDueCents),

    'Line Items': lineItemsCell,
    ...numberedItemColumns,
    Notes: blank(inputs.notes),
    'WorkDrive Folder': blank(invoice.workdriveFolderId),
  }
}

export function hasChristmasSheetConfig() {
  const resource =
    process.env.CHRISTMAS_SHEET_RESOURCE_ID?.trim() || process.env.ZOHO_SHEET_RESOURCE_ID?.trim()
  return Boolean(resource) && hasZohoCredentials()
}

export function getChristmasSheetConfigStatus() {
  const resource =
    process.env.CHRISTMAS_SHEET_RESOURCE_ID?.trim() || process.env.ZOHO_SHEET_RESOURCE_ID?.trim()
  if (!resource) {
    return { ok: false, reason: 'ZOHO_SHEET_RESOURCE_ID (or CHRISTMAS_SHEET_RESOURCE_ID) is not set' }
  }
  if (!hasZohoCredentials()) {
    return {
      ok: false,
      reason: 'Zoho OAuth incomplete — set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN',
    }
  }
  return { ok: true }
}

const sheetApiUrl = () => (process.env.ZOHO_SHEET_API_URL || 'https://sheet.zoho.com').replace(/\/$/, '')

const resolveResourceId = (resourceId) =>
  resourceId || process.env.CHRISTMAS_SHEET_RESOURCE_ID?.trim() || process.env.ZOHO_SHEET_RESOURCE_ID?.trim()

const sheetErrorHint = (payload, response) =>
  payload.error_code === 2866 || response.status === 500
    ? ' Usually a bad sheet resource id (must be the id after /sheet/open/ in the sheet URL).'
    : payload.error_code === 2863
      ? ' Worksheet name not found — set ZOHO_SHEET_WORKSHEET_NAME / CHRISTMAS_SHEET_WORKSHEET_NAME to match the tab.'
      : ''

async function postSheetCommand(resourceId, token, params) {
  const response = await fetch(`${sheetApiUrl()}/api/v2/${resourceId}`, {
    method: 'POST',
    headers: {
      ...zohoAuthHeader(token),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })
  const payload = await response.json().catch(() => ({}))
  return { response, payload }
}

const assertSheetSuccess = (response, payload, action) => {
  if (!response.ok || payload.status === 'failure') {
    const detail = payload.error_message || JSON.stringify(payload)
    throw new Error(
      `Zoho Sheet ${action} failed (${response.status}): ${detail}.${sheetErrorHint(payload, response)}`,
    )
  }
}

/** Appends a brand-new row — used only when no existing row matches the invoice. */
export async function appendChristmasInvoiceToSheet({ invoice, resourceId, worksheetName }) {
  const effectiveResource = resolveResourceId(resourceId)
  if (!effectiveResource) {
    throw new Error(
      'Zoho Sheet is not configured. Set ZOHO_SHEET_RESOURCE_ID or CHRISTMAS_SHEET_RESOURCE_ID.',
    )
  }

  const token = await getZohoAccessToken()
  const { response, payload } = await postSheetCommand(effectiveResource, token, {
    method: 'worksheet.records.add',
    worksheet_name: worksheetName || 'Christmas Invoices',
    header_row: '1',
    json_data: JSON.stringify([invoiceToSheetRecord(invoice)]),
  })
  assertSheetSuccess(response, payload, 'append')
  return payload
}

/**
 * Updates the row matching this invoice's "Invoice ID" (if any). Returns the
 * raw payload — check `no_of_affected_rows` to see whether a row matched.
 */
export async function updateChristmasInvoiceInSheet({ invoice, resourceId, worksheetName }) {
  const effectiveResource = resolveResourceId(resourceId)
  if (!effectiveResource) {
    throw new Error(
      'Zoho Sheet is not configured. Set ZOHO_SHEET_RESOURCE_ID or CHRISTMAS_SHEET_RESOURCE_ID.',
    )
  }

  const token = await getZohoAccessToken()
  const criteria = `"Invoice ID"="${String(invoice.id).replaceAll('"', '\\"')}"`
  const { response, payload } = await postSheetCommand(effectiveResource, token, {
    method: 'worksheet.records.update',
    worksheet_name: worksheetName || 'Christmas Invoices',
    criteria,
    first_match_only: 'true',
    data: JSON.stringify(invoiceToSheetRecord(invoice)),
  })
  assertSheetSuccess(response, payload, 'update')
  return payload
}

/**
 * Upserts one row per invoice: updates the existing row (matched by
 * "Invoice ID") if one exists, otherwise appends a new row. Keeps re-syncs
 * (save, send, resend) from piling up duplicate rows per invoice.
 */
export async function upsertChristmasInvoiceInSheet({ invoice, resourceId, worksheetName }) {
  if (!invoice.id) {
    return appendChristmasInvoiceToSheet({ invoice, resourceId, worksheetName })
  }

  const updatePayload = await updateChristmasInvoiceInSheet({ invoice, resourceId, worksheetName })
  if (Number(updatePayload.no_of_affected_rows) > 0) {
    return updatePayload
  }

  return appendChristmasInvoiceToSheet({ invoice, resourceId, worksheetName })
}

/**
 * Best-effort sheet sync for create/update flows. Never throws.
 */
export async function syncChristmasInvoiceToSheet({ invoice, resourceId, worksheetName }) {
  const status = getChristmasSheetConfigStatus()
  if (!status.ok && !resourceId?.trim()) {
    return { skipped: true, reason: status.reason }
  }
  try {
    await upsertChristmasInvoiceInSheet({ invoice, resourceId, worksheetName })
    return { ok: true }
  } catch (error) {
    console.error('[christmas/invoices] zoho sheet sync failed', error)
    return { ok: false, error: error.message }
  }
}
