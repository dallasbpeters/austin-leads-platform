/*
 * Zoho Sheet sync — appends one row per quote so the client can browse
 * quotes in a familiar spreadsheet.
 *
 * Required env vars:
 *   ZOHO_SHEET_RESOURCE_ID       The spreadsheet's resource id (from its URL)
 * Optional:
 *   ZOHO_SHEET_WORKSHEET_NAME    Default 'Quotes'
 *   ZOHO_SHEET_API_URL           Default https://sheet.zoho.com
 *
 * Uses the Zoho Sheet API v2 `worksheet.records.add` method, which matches
 * column headers (row 1 of the worksheet) to the JSON keys sent. Create the
 * worksheet with headers matching QUOTE_SHEET_COLUMNS below.
 */

import { getZohoAccessToken, hasZohoCredentials, zohoAuthHeader } from './auth.js'

export const QUOTE_SHEET_COLUMNS = [
  'Quote Number',
  'Date',
  'Status',
  'Customer',
  'Email',
  'Phone',
  'Address',
  'City',
  'Utility',
  'System Size (kW)',
  'Annual Production (kWh)',
  'System Price',
  'Rebate',
  'Net Price',
  'First Year Savings',
  '25-Year Savings',
  'Emailed To',
]

export function hasZohoSheetConfig() {
  return Boolean(process.env.ZOHO_SHEET_RESOURCE_ID?.trim()) && hasZohoCredentials()
}

export function getZohoSheetConfigStatus() {
  if (!process.env.ZOHO_SHEET_RESOURCE_ID?.trim()) {
    return { ok: false, reason: 'ZOHO_SHEET_RESOURCE_ID is not set' }
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

export function quoteToSheetRecord(quote) {
  const { inputs = {}, computed = {} } = quote.data || {}
  return {
    'Quote Number': quote.quoteNumber,
    Date: new Date(quote.createdAt || Date.now()).toISOString().slice(0, 10),
    Status: quote.status || 'draft',
    Customer: quote.customerName || '',
    Email: quote.customerEmail || '',
    Phone: quote.customerPhone || '',
    Address: quote.propertyAddress || '',
    City: quote.propertyCity || '',
    Utility: quote.utilityProvider || '',
    'System Size (kW)': computed.systemSizeKw ?? '',
    'Annual Production (kWh)': computed.annualProductionKwh ?? '',
    'System Price': computed.systemPrice ?? '',
    Rebate: computed.rebate ?? 0,
    'Net Price': computed.netSystemPrice ?? '',
    'First Year Savings': computed.firstYearSavings ?? '',
    '25-Year Savings': computed.lifetimeSavings ?? '',
    'Emailed To': quote.emailedTo || inputs.customerEmail || '',
  }
}

export async function appendQuoteToSheet(quote) {
  if (!hasZohoSheetConfig()) {
    throw new Error('Zoho Sheet is not configured. Set ZOHO_SHEET_RESOURCE_ID.')
  }

  const token = await getZohoAccessToken()
  const resourceId = process.env.ZOHO_SHEET_RESOURCE_ID.trim()
  const worksheetName = process.env.ZOHO_SHEET_WORKSHEET_NAME?.trim() || 'Quotes'

  const body = new URLSearchParams({
    method: 'worksheet.records.add',
    worksheet_name: worksheetName,
    header_row: '1',
    json_data: JSON.stringify([quoteToSheetRecord(quote)]),
  })

  const response = await fetch(`${sheetApiUrl()}/api/v2/${resourceId}`, {
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
        ? ' Usually a bad ZOHO_SHEET_RESOURCE_ID (must be the id after /sheet/open/ in the sheet URL). List workbooks with method workbook.list if unsure.'
        : payload.error_code === 2863
          ? ' Worksheet name not found — set ZOHO_SHEET_WORKSHEET_NAME to match the tab (default Quotes).'
          : payload.error_code === 2403
            ? ' Re-generate the refresh token with scopes ZohoSheet.dataAPI.UPDATE,ZohoSheet.dataAPI.READ,WorkDrive.files.CREATE,WorkDrive.files.READ'
            : ''
    throw new Error(`Zoho Sheet append failed (${response.status}): ${detail}.${hint}`)
  }
  return payload
}

/**
 * Best-effort sheet sync for save/send flows.
 * Never throws — returns { ok } | { skipped, reason } | { ok: false, error }.
 */
export async function syncQuoteToSheet(quote) {
  const status = getZohoSheetConfigStatus()
  if (!status.ok) {
    return { skipped: true, reason: status.reason }
  }
  try {
    await appendQuoteToSheet(quote)
    return { ok: true }
  } catch (error) {
    console.error('[quotes] zoho sheet sync failed', error)
    return { ok: false, error: error.message }
  }
}
