import { hasJobberCredentials } from './auth.js'
import { assertNoJobberUserErrors, executeJobberQuery } from './client.js'
import { getJobberConnection, isJobberConnected, markInvoiceJobberSynced } from './db.js'

/*
 * Push a saved Christmas invoice into Jobber as a real Client + Invoice, so
 * the business doesn't have to re-key the same data there by hand.
 *
 * Verified against the live API (2026-08) rather than trusting the schema
 * dump used to plan this — several assumed mutations don't actually exist
 * for Invoices on this account/API version:
 *   - No `search` query — client dedup uses `similarClients(emails: [...])`.
 *   - No `invoiceCreatePaymentRecord` — the deposit is NOT recorded in
 *     Jobber; only line items + totals are (surfaced correctly in the UI,
 *     but Jobber's own balance-due won't reflect a deposit collected here).
 *   - No `invoiceCreateLineItems` / `invoiceDeleteLineItems` /
 *     `invoiceEditLineItems` — line items are set once at `invoiceCreate`
 *     and cannot be changed afterward via this API. Re-saving an
 *     already-pushed invoice only updates top-level fields (subject,
 *     dates) via `invoiceEdit`; line item edits in this app will NOT
 *     propagate to Jobber.
 * (Quotes have full line-item CRUD on this API — `quoteCreateLineItems` /
 * `quoteEditLineItems` / `quoteDeleteLineItems` all exist — worth
 * revisiting if line-item edits need to sync.)
 */

const FIND_CLIENT_QUERY = `
  query FindSimilarClientsByEmail($emails: [String!]!) {
    similarClients(emails: $emails, first: 5) {
      nodes {
        id
        emails { address }
      }
    }
  }
`

const CREATE_CLIENT_MUTATION = `
  mutation CreateClient($input: ClientCreateInput!) {
    clientCreate(input: $input) {
      client { id }
      userErrors { message path }
    }
  }
`

const CREATE_INVOICE_MUTATION = `
  mutation CreateInvoice($input: InvoiceCreateInput!) {
    invoiceCreate(input: $input) {
      invoice { id invoiceNumber }
      userErrors { message path }
    }
  }
`

const EDIT_INVOICE_MUTATION = `
  mutation EditInvoice($invoiceId: EncodedId!, $input: InvoiceEditInput!) {
    invoiceEdit(invoiceId: $invoiceId, input: $input) {
      invoice { id }
      userErrors { message path }
    }
  }
`

/**
 * Coerces `value` into a valid ISO8601DateTime for Jobber. Handles a native
 * `Date` (e.g. if a caller ever forwards a raw Postgres DATE value again),
 * an already-ISO string, or a plain 'YYYY-MM-DD' string — always by parsing
 * and re-emitting via `toISOString()` rather than naive string concatenation,
 * so a malformed input never silently turns into a bad string Jobber rejects.
 */
const toJobberDateTime = (value) => {
  if (!value) {
    return null
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const splitLegacyName = (fullName) => {
  const trimmed = String(fullName || '').trim()
  const spaceIndex = trimmed.indexOf(' ')
  if (spaceIndex === -1) {
    return { firstName: trimmed || 'Customer', lastName: '' }
  }
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) }
}

/** Prefers the real first/last name fields; only splits the old combined name as a fallback. */
const resolveCustomerName = (invoice, inputs) => {
  const firstName = invoice.customerFirstName || inputs.customerFirstName
  const lastName = invoice.customerLastName || inputs.customerLastName
  if (firstName || lastName) {
    return { firstName: firstName || 'Customer', lastName: lastName || '' }
  }
  return splitLegacyName(invoice.customerName || inputs.customerName)
}

async function findExistingJobberClient(email) {
  if (!email) {
    return null
  }
  const data = await executeJobberQuery(FIND_CLIENT_QUERY, { emails: [email] })
  const match = (data?.similarClients?.nodes || []).find((node) =>
    (node?.emails || []).some((entry) => entry.address?.toLowerCase() === email.toLowerCase()),
  )
  return match?.id || null
}

async function createJobberClient(invoice, inputs) {
  const { firstName, lastName } = resolveCustomerName(invoice, inputs)
  const email = invoice.customerEmail || inputs.customerEmail
  const phone = invoice.customerPhone || inputs.customerPhone
  const address = invoice.propertyAddress || inputs.propertyAddress

  const input = {
    firstName,
    lastName,
    emails: email ? [{ address: email, primary: true }] : undefined,
    phones: phone ? [{ number: phone, primary: true }] : undefined,
    billingAddress: address
      ? {
          street1: address,
          city: invoice.propertyCity || inputs.propertyCity || undefined,
          province: invoice.propertyState || inputs.propertyState || undefined,
          postalCode: invoice.propertyZip || inputs.propertyZip || undefined,
        }
      : undefined,
  }

  const data = await executeJobberQuery(CREATE_CLIENT_MUTATION, { input })
  assertNoJobberUserErrors('clientCreate', data)
  return data.clientCreate.client.id
}

async function findOrCreateJobberClient(invoice, inputs) {
  const email = invoice.customerEmail || inputs.customerEmail
  const existingId = await findExistingJobberClient(email)
  if (existingId) {
    return existingId
  }
  return createJobberClient(invoice, inputs)
}

/** Category/location/color/N-R don't map to Jobber's Product/Service/Package category enum, so they ride along in `description` instead. */
const lineItemMeta = (item) => {
  const nrLabel = item.nr === 'N' ? 'New' : item.nr === 'R' ? 'Reuse' : ''
  return [item.category, item.location, item.color, nrLabel].filter(Boolean).join(' · ')
}

const buildLineItems = (computed) =>
  (computed?.lineItems || []).map((item) => ({
    name: String(item.description || 'Line item').slice(0, 255),
    description: lineItemMeta(item) || undefined,
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unitPriceCents || 0) / 100,
    taxable: false,
  }))

/**
 * Only top-level fields can be edited post-creation — Jobber's API has no
 * line-item mutations for Invoices, so line item changes here don't
 * propagate. See the module doc comment.
 */
async function editInvoiceInJobber(invoice) {
  const jobberInvoiceId = invoice.jobberInvoiceId

  const editInput = {
    subject: `Invoice ${invoice.invoiceNumber}`,
    issuedDate: toJobberDateTime(invoice.invoiceDate),
    dueDetails: { dueDate: toJobberDateTime(invoice.dueDate) },
  }
  const editData = await executeJobberQuery(EDIT_INVOICE_MUTATION, {
    invoiceId: jobberInvoiceId,
    input: editInput,
  })
  assertNoJobberUserErrors('invoiceEdit', editData)

  await markInvoiceJobberSynced(invoice.id, { clientId: invoice.jobberClientId, invoiceId: jobberInvoiceId })

  return {
    ok: true,
    jobberClientId: invoice.jobberClientId,
    jobberInvoiceId,
    note: 'Only top-level fields (subject, dates) were updated — Jobber has no API for editing invoice line items.',
  }
}

async function createInvoiceInJobber(invoice, inputs, computed) {
  const jobberClientId = await findOrCreateJobberClient(invoice, inputs)

  const invoiceInput = {
    subject: `Invoice ${invoice.invoiceNumber}`,
    clientId: jobberClientId,
    issuedDate: toJobberDateTime(invoice.invoiceDate),
    dueDetails: { dueDate: toJobberDateTime(invoice.dueDate) },
    tax: { taxCalculationMethod: 'EXCLUSIVE' },
    lineItems: buildLineItems(computed),
  }

  const data = await executeJobberQuery(CREATE_INVOICE_MUTATION, { input: invoiceInput })
  assertNoJobberUserErrors('invoiceCreate', data)
  const jobberInvoiceId = data.invoiceCreate.invoice.id

  await markInvoiceJobberSynced(invoice.id, { clientId: jobberClientId, invoiceId: jobberInvoiceId })

  const note = invoice.depositCents
    ? 'Note: Jobber has no API to record the deposit — its balance due does not reflect it.'
    : undefined

  return { ok: true, jobberClientId, jobberInvoiceId, note }
}

/**
 * Best-effort push — never throws. Mirrors the Zoho sync helpers' contract
 * so it can slot into `syncChristmasInvoiceIntegrations` the same way.
 */
export async function syncInvoiceToJobber(invoice) {
  if (!hasJobberCredentials()) {
    return { skipped: true, reason: 'JOBBER_CLIENT_ID / JOBBER_CLIENT_SECRET are not set' }
  }
  const connection = await getJobberConnection().catch(() => null)
  if (!isJobberConnected(connection)) {
    return { skipped: true, reason: 'Jobber is not connected — connect it from invoice settings' }
  }

  const inputs = invoice.data?.inputs || {}
  const computed = invoice.data?.computed || {}

  try {
    if (invoice.jobberInvoiceId) {
      return await editInvoiceInJobber(invoice)
    }
    return await createInvoiceInJobber(invoice, inputs, computed)
  } catch (error) {
    console.error('[jobber] invoice sync failed', { invoiceId: invoice.id, error })
    return { ok: false, error: error.message }
  }
}
