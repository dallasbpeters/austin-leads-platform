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

export const CHRISTMAS_INVOICE_SHEET_COLUMNS = [
  // Meta
  'Invoice Number',
  'Date',
  'Updated At',
  'Status',
  'Invoice ID',
  // Customer & property
  'Customer',
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

const blank = (value) => (value == null || value === '' ? '' : value)

export function invoiceToSheetRecord(invoice) {
  const { inputs = {}, computed = {} } = invoice.data || {}
  const lineItems = Array.isArray(computed.lineItems) ? computed.lineItems : []

  const lineItemsCell = lineItems
    .map((item) =>
      [
        item.description,
        item.quantity && item.quantity !== 1 ? `Qty ${item.quantity}` : '',
        item.unitPriceCents ? `@ ${money(item.unitPriceCents)}` : '',
        item.amountCents ? `= ${money(item.amountCents)}` : '',
      ]
        .filter(Boolean)
        .join(' '),
    )
    .join(' | ')

  return {
    'Invoice Number': invoice.invoiceNumber,
    Date: String(invoice.invoiceDate || invoice.createdAt || Date.now()).slice(0, 10),
    'Updated At': invoice.updatedAt ? String(invoice.updatedAt).slice(0, 19).replace('T', ' ') : '',
    Status: invoice.status || 'draft',
    'Invoice ID': invoice.id || '',

    Customer: invoice.customerName || inputs.customerName || '',
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

export async function appendChristmasInvoiceToSheet({ invoice, resourceId, worksheetName }) {
  const effectiveResource =
    resourceId ||
    process.env.CHRISTMAS_SHEET_RESOURCE_ID?.trim() ||
    process.env.ZOHO_SHEET_RESOURCE_ID?.trim()
  if (!effectiveResource) {
    throw new Error(
      'Zoho Sheet is not configured. Set ZOHO_SHEET_RESOURCE_ID or CHRISTMAS_SHEET_RESOURCE_ID.',
    )
  }

  const token = await getZohoAccessToken()
  const effectiveWorksheet = worksheetName || 'Christmas Invoices'

  const body = new URLSearchParams({
    method: 'worksheet.records.add',
    worksheet_name: effectiveWorksheet,
    header_row: '1',
    json_data: JSON.stringify([invoiceToSheetRecord(invoice)]),
  })

  const response = await fetch(`${sheetApiUrl()}/api/v2/${effectiveResource}`, {
    method: 'POST',
    headers: {
      ...zohoAuthHeader(token),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.status === 'failure') {
    const detail = payload.error_message || JSON.stringify(payload)
    const hint =
      payload.error_code === 2866 || response.status === 500
        ? ' Usually a bad sheet resource id (must be the id after /sheet/open/ in the sheet URL).'
        : payload.error_code === 2863
          ? ' Worksheet name not found — set ZOHO_SHEET_WORKSHEET_NAME / CHRISTMAS_SHEET_WORKSHEET_NAME to match the tab.'
          : ''
    throw new Error(`Zoho Sheet append failed (${response.status}): ${detail}.${hint}`)
  }
  return payload
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
    await appendChristmasInvoiceToSheet({ invoice, resourceId, worksheetName })
    return { ok: true }
  } catch (error) {
    console.error('[christmas/invoices] zoho sheet sync failed', error)
    return { ok: false, error: error.message }
  }
}
