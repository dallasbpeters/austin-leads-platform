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

/** Headers for row 1 of the Quotes worksheet (order is documentation; matching is by name). */
export const QUOTE_SHEET_COLUMNS = [
  // Meta
  'Quote Number',
  'Date',
  'Updated At',
  'Status',
  'Quote ID',
  'Emailed To',
  // Customer & property
  'Customer',
  'Email',
  'Phone',
  'Address',
  'City',
  'State',
  'ZIP',
  'Utility',
  // Equipment (combined description + qty)
  'Solar Panels',
  'Inverter',
  'Battery',
  'Racking',
  'Monitoring',
  // Pricing & energy inputs
  'System Price',
  'Annual Production (kWh)',
  'Annual Consumption (kWh)',
  'Utility Rate ($/kWh)',
  'Rate Escalation',
  'Buyback Rate ($/kWh)',
  // Computed
  'System Size (kW)',
  'Rebate',
  'Discount',
  'Net Price',
  'First Year Savings',
  '25-Year Savings',
  'Net Lifetime Savings',
  'Average Annual Savings',
  'Payback Years',
  'Consumption Offset %',
  'CO2 Offset (tons)',
]

const blank = (value) => (value == null || value === '' ? '' : value)

/** Combine equipment description + qty into one cell, e.g. "Mission Solar · 435W · Qty 21". */
const equipmentCell = (...parts) =>
  parts
    .map((part) => (part == null || part === '' ? '' : String(part).trim()))
    .filter(Boolean)
    .join(' · ')

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
  const assumptions = computed.assumptions || {}

  return {
    'Quote Number': quote.quoteNumber,
    Date: new Date(quote.createdAt || Date.now()).toISOString().slice(0, 10),
    'Updated At': quote.updatedAt ? new Date(quote.updatedAt).toISOString().slice(0, 19) : '',
    Status: quote.status || 'draft',
    'Quote ID': quote.id || '',
    'Emailed To': quote.emailedTo || inputs.customerEmail || quote.customerEmail || '',

    Customer: quote.customerName || inputs.customerName || '',
    Email: quote.customerEmail || inputs.customerEmail || '',
    Phone: quote.customerPhone || inputs.customerPhone || '',
    Address: quote.propertyAddress || inputs.propertyAddress || '',
    City: quote.propertyCity || inputs.propertyCity || '',
    State: quote.propertyState || inputs.propertyState || '',
    ZIP: quote.propertyZip || inputs.propertyZip || '',
    Utility: quote.utilityProvider || inputs.utilityProvider || '',

    'Solar Panels': equipmentCell(
      inputs.panelMakeModel,
      inputs.panelWatts ? `${inputs.panelWatts}W` : '',
      inputs.panelQuantity ? `Qty ${inputs.panelQuantity}` : '',
    ),
    Inverter: equipmentCell(
      inputs.inverterMakeModel,
      inputs.inverterQuantity ? `Qty ${inputs.inverterQuantity}` : '',
    ),
    Battery: equipmentCell(
      inputs.batteryMakeModel,
      inputs.batteryQuantity ? `Qty ${inputs.batteryQuantity}` : '',
    ),
    Racking: equipmentCell(
      inputs.rackingSystem,
      inputs.rackingQuantity ? `Qty ${inputs.rackingQuantity}` : '',
    ),
    Monitoring: equipmentCell(
      inputs.monitoringSystem,
      inputs.monitoringQuantity ? `Qty ${inputs.monitoringQuantity}` : '',
    ),

    'System Price': computed.systemPrice ?? inputs.systemPrice ?? '',
    'Annual Production (kWh)': computed.annualProductionKwh ?? inputs.annualProductionKwh ?? '',
    'Annual Consumption (kWh)': blank(inputs.annualConsumptionKwh),
    'Utility Rate ($/kWh)': blank(inputs.utilityRate ?? assumptions.utilityRate),
    'Rate Escalation': blank(inputs.rateEscalation ?? assumptions.rateEscalation),
    'Buyback Rate ($/kWh)': blank(inputs.buybackRate ?? assumptions.buybackRate),

    'System Size (kW)': computed.systemSizeKw ?? '',
    Rebate: computed.rebate ?? 0,
    Discount: computed.discount > 0 ? computed.discount : '',
    'Net Price': computed.netSystemPrice ?? '',
    'First Year Savings': computed.firstYearSavings ?? '',
    '25-Year Savings': computed.lifetimeSavings ?? '',
    'Net Lifetime Savings': computed.netLifetimeSavings ?? '',
    'Average Annual Savings': computed.averageAnnualSavings ?? '',
    'Payback Years': computed.paybackYears ?? '',
    'Consumption Offset %': computed.consumptionOffsetPct ?? '',
    'CO2 Offset (tons)': computed.co2OffsetTons ?? '',
  }
}

const worksheetName = () => process.env.ZOHO_SHEET_WORKSHEET_NAME?.trim() || 'Quotes'

async function postSheetCommand(params) {
  if (!hasZohoSheetConfig()) {
    throw new Error('Zoho Sheet is not configured. Set ZOHO_SHEET_RESOURCE_ID.')
  }

  const token = await getZohoAccessToken()
  const resourceId = process.env.ZOHO_SHEET_RESOURCE_ID.trim()
  const response = await fetch(`${sheetApiUrl()}/api/v2/${resourceId}`, {
    method: 'POST',
    headers: {
      ...zohoAuthHeader(token),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })

  return { response, payload: await response.json().catch(() => ({})) }
}

function assertSheetSuccess(response, payload, action) {
  if (response.ok && payload.status !== 'failure') {
    return
  }
  const detail = payload.error_message || JSON.stringify(payload)
  const hint =
    payload.error_code === 2866 || response.status === 500
      ? ' Usually a bad ZOHO_SHEET_RESOURCE_ID (must be the id after /sheet/open/ in the sheet URL). List workbooks with method workbook.list if unsure.'
      : payload.error_code === 2863
        ? ' Worksheet name not found — set ZOHO_SHEET_WORKSHEET_NAME to match the tab (default Quotes).'
        : payload.error_code === 2403
          ? ' Re-generate the refresh token with scopes ZohoSheet.dataAPI.UPDATE,ZohoSheet.dataAPI.READ,WorkDrive.files.CREATE,WorkDrive.files.READ'
          : ''
  throw new Error(`Zoho Sheet ${action} failed (${response.status}): ${detail}.${hint}`)
}

/** Appends a brand-new row — used only when no existing row matches the quote. */
export async function appendQuoteToSheet(quote) {
  const { response, payload } = await postSheetCommand({
    method: 'worksheet.records.add',
    worksheet_name: worksheetName(),
    header_row: '1',
    json_data: JSON.stringify([quoteToSheetRecord(quote)]),
  })
  assertSheetSuccess(response, payload, 'append')
  return payload
}

/*
 * Matched on "Quote Number" rather than "Quote ID". Zoho Sheet maps records by
 * header name and silently drops any field whose column is missing, and the
 * live workbook has no "Quote ID" column -- so matching on it would never hit.
 * Quote numbers are unique (the DB has a UNIQUE constraint), which makes them a
 * safe key.
 */
const quoteMatchCriteria = (quote) =>
  `"Quote Number"="${String(quote.quoteNumber).replaceAll('"', String.raw`\"`)}"`

/**
 * Updates the row matching this quote's number. Returns the raw payload —
 * check `no_of_affected_rows` to see whether a row matched.
 */
export async function updateQuoteInSheet(quote) {
  const { response, payload } = await postSheetCommand({
    method: 'worksheet.records.update',
    worksheet_name: worksheetName(),
    criteria: quoteMatchCriteria(quote),
    first_match_only: 'true',
    data: JSON.stringify(quoteToSheetRecord(quote)),
  })
  assertSheetSuccess(response, payload, 'update')
  return payload
}

/**
 * Upserts one row per quote: updates the existing row if there is one,
 * otherwise appends. Every save and every send used to append, so a single
 * quote could accumulate a dozen rows in the sheet.
 */
export async function upsertQuoteInSheet(quote) {
  if (!quote.quoteNumber) {
    return appendQuoteToSheet(quote)
  }

  const updatePayload = await updateQuoteInSheet(quote)
  if (Number(updatePayload.no_of_affected_rows) > 0) {
    return updatePayload
  }

  return appendQuoteToSheet(quote)
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
    await upsertQuoteInSheet(quote)
    return { ok: true }
  } catch (error) {
    console.error('[quotes] zoho sheet sync failed', error)
    return { ok: false, error: error.message }
  }
}
