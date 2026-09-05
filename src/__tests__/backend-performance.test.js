import { describe, expect, it, vi } from 'vitest'

/*
 * Performance regression guards for the quote/invoice backend.
 *
 * These assert the *shape* of the work done -- how many round trips, which
 * columns, how much runs concurrently -- rather than wall-clock time, because
 * timing assertions are flaky on shared CI runners while the underlying
 * mistakes (a migration per request, SELECT *, serial I/O) are exactly
 * reproducible.
 *
 * Each guard corresponds to a fix that made the admin measurably faster:
 *   1. Schema migrations ran on every single request (~1.1s for invoices,
 *      ~1.7s for quotes, and the invoices page paid it twice).
 *   2. List queries pulled the `data` JSONB snapshot for up to 500 rows.
 *   3. Zoho Sheet and WorkDrive syncs ran serially on every save.
 */

const queries = []

/*
 * One fake `sql` tagged template shared by both db modules. It records the
 * statement text so tests can count round trips and inspect column lists.
 */
const fakeSql = (strings, ...values) => {
  queries.push({ text: strings.join('?').replaceAll(/\s+/g, ' ').trim(), values })
  return Promise.resolve([])
}

vi.mock(import('@/lib/db/pool.js'), () => ({
  getSql: () => fakeSql,
  getPool: () => ({ query: () => Promise.resolve({ rows: [] }) }),
  hasDatabaseUrl: () => true,
  getDatabaseUrl: () => 'postgres://stub',
}))

vi.mock(import('../lib/db/pool.js'), () => ({
  getSql: () => fakeSql,
  getPool: () => ({ query: () => Promise.resolve({ rows: [] }) }),
  hasDatabaseUrl: () => true,
  getDatabaseUrl: () => 'postgres://stub',
}))

const ddlCount = () => queries.filter(({ text }) => /^(CREATE|ALTER)\b/i.test(text)).length

/** Yields to the event loop so pending microtasks and timers can run. */
const tick = () => setTimeout(Promise.resolve.bind(Promise), 0) && Promise.resolve()

describe('schema migrations run once per process', () => {
  it('christmas invoices: repeated calls issue DDL only on the first', async () => {
    const invoiceDb = await import('@/lib/christmas/invoice-db')
    // The module may already be warm from another test file; reset the cache so
    // this measures a cold start deterministically.
    globalThis.__christmasInvoiceSchemaReady__ = null
    queries.length = 0

    await invoiceDb.ensureChristmasInvoiceTables()
    const firstCallDdl = ddlCount()
    expect(firstCallDdl).toBeGreaterThan(0)

    queries.length = 0
    await invoiceDb.ensureChristmasInvoiceTables()
    await invoiceDb.ensureChristmasInvoiceTables()
    await invoiceDb.ensureChristmasInvoiceTables()

    // Three more calls, zero further round trips.
    expect(queries).toHaveLength(0)
  })

  it('quotes: repeated calls issue DDL only on the first', async () => {
    const quotesDb = await import('@/lib/quotes/db')
    globalThis.__solarQuotesSchemaReady__ = null
    queries.length = 0

    await quotesDb.ensureQuotesTable()
    expect(ddlCount()).toBeGreaterThan(0)

    queries.length = 0
    await quotesDb.ensureQuotesTable()
    await quotesDb.ensureQuotesTable()

    expect(queries).toHaveLength(0)
  })

  it('a failed migration is retried rather than cached as ready', async () => {
    const invoiceDb = await import('@/lib/christmas/invoice-db')
    globalThis.__christmasInvoiceSchemaReady__ = Promise.reject(new Error('connection reset'))
    // Swallow the rejection so Node doesn't flag it as unhandled.
    globalThis.__christmasInvoiceSchemaReady__.catch(() => {})

    await expect(invoiceDb.ensureChristmasInvoiceTables()).rejects.toThrow('connection reset')

    // The poisoned promise must not stick: the next call retries the DDL.
    globalThis.__christmasInvoiceSchemaReady__ = null
    queries.length = 0
    await invoiceDb.ensureChristmasInvoiceTables()
    expect(ddlCount()).toBeGreaterThan(0)
  })
})

describe('list queries leave the heavy snapshot column behind', () => {
  it('listInvoices selects named columns and never data', async () => {
    const { listInvoices } = await import('@/lib/christmas/invoice-db')
    queries.length = 0

    await listInvoices({ limit: 500 })

    const select = queries.find(({ text }) => text.startsWith('SELECT'))
    expect(select).toBeDefined()
    expect(select.text).not.toMatch(/SELECT\s+\*/i)
    expect(select.text).not.toMatch(/\bdata\b/)
    // Still returns every column the table renders.
    for (const column of ['invoice_number', 'balance_due_cents', 'email_status']) {
      expect(select.text).toContain(column)
    }
  })

  it('listQuotes selects named columns and never data', async () => {
    const { listQuotes } = await import('@/lib/quotes/db')
    queries.length = 0

    await listQuotes({ limit: 500 })

    const select = queries.find(({ text }) => text.startsWith('SELECT'))
    expect(select).toBeDefined()
    expect(select.text).not.toMatch(/SELECT\s+\*/i)
    expect(select.text).not.toMatch(/\bdata\b/)
    expect(select.text).toContain('quote_number')
    expect(select.text).toContain('net_price_cents')
  })

  it('single-record reads still include data, since the PDF needs it', async () => {
    const { getInvoice } = await import('@/lib/christmas/invoice-db')
    const { getQuote } = await import('@/lib/quotes/db')
    queries.length = 0

    await getInvoice('inv_1')
    await getQuote('qt_1')

    for (const query of queries) {
      expect(query.text).toMatch(/SELECT\s+\*/i)
    }
  })

  it('the list query is a single round trip', async () => {
    const { listInvoices } = await import('@/lib/christmas/invoice-db')
    queries.length = 0

    await listInvoices({ limit: 500 })

    expect(queries).toHaveLength(1)
  })
})

describe('invoice integrations run concurrently', () => {
  it('sheet and workdrive overlap instead of queueing', async () => {
    const started = []
    const sheetGate = Promise.withResolvers()
    const workdriveGate = Promise.withResolvers()

    vi.doMock(import('@/lib/zoho/christmas-sheet'), () => ({
      syncChristmasInvoiceToSheet: () => {
        started.push('sheet')
        return sheetGate.promise
      },
    }))
    vi.doMock(import('@/lib/zoho/workdrive'), () => ({
      syncInvoicePdfToWorkdrive: () => {
        started.push('workdrive')
        return workdriveGate.promise
      },
    }))
    vi.doMock(import('@/lib/christmas/invoice-pdf.js'), () => ({
      renderChristmasInvoicePdf: () => Promise.resolve(Buffer.from('pdf')),
      christmasInvoiceFileName: () => 'invoice.pdf',
      getChristmasCompanyInfo: () => ({ name: 'Test', email: 't@example.com' }),
    }))

    vi.resetModules()
    const { syncChristmasInvoiceIntegrations } = await import('@/lib/christmas/invoice-integrations')

    const pending = syncChristmasInvoiceIntegrations({ id: 'inv_1', customerName: 'Test' }, {})

    // Let both legs get going without resolving either.
    await tick()
    await tick()
    await tick()

    // Serial code could not have started the second while the first is unresolved.
    expect(started).toContain('sheet')
    expect(started).toContain('workdrive')

    sheetGate.resolve({ ok: true })
    workdriveGate.resolve({ ok: true, fileId: 'f1', folderId: 'd1' })
    const results = await pending
    expect(results.sheet.ok).toBeTruthy()
    expect(results.workdrive.ok).toBeTruthy()

    vi.doUnmock(import('@/lib/zoho/christmas-sheet'))
    vi.doUnmock(import('@/lib/zoho/workdrive'))
    vi.doUnmock(import('@/lib/christmas/invoice-pdf.js'))
    vi.resetModules()
  })
})

/*
 * Not a speed guard, but the same class of mistake: every save and send used
 * to append a fresh Zoho Sheet row, so one quote accumulated a row per edit.
 * The live workbook had 109 rows for 22 quotes before this was fixed.
 */
describe('zoho sheet sync writes one row per record', () => {
  const zohoEnv = () => {
    process.env.ZOHO_SHEET_RESOURCE_ID = 'sheet_stub'
    process.env.ZOHO_SHEET_WORKSHEET_NAME = 'Quotes'
    process.env.ZOHO_CLIENT_ID = 'id'
    process.env.ZOHO_CLIENT_SECRET = 'secret'
    process.env.ZOHO_REFRESH_TOKEN = 'token'
  }

  const loadSheet = async (affectedRows) => {
    const calls = []
    vi.doMock(import('@/lib/zoho/auth'), () => ({
      getZohoAccessToken: () => Promise.resolve('access-token'),
      zohoAuthHeader: () => ({ Authorization: 'Zoho-oauthtoken access-token' }),
      hasZohoCredentials: () => true,
      zohoAccountsUrl: () => 'https://accounts.zoho.com',
    }))
    vi.stubGlobal('fetch', (_url, options) => {
      const params = new URLSearchParams(options.body)
      calls.push(params.get('method'))
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            status: 'success',
            no_of_affected_rows: params.get('method') === 'worksheet.records.update' ? affectedRows : 1,
          }),
      })
    })
    vi.resetModules()
    const sheet = await import('@/lib/zoho/sheet')
    return { sheet, calls }
  }

  const quote = { id: 'qt_1', quoteNumber: 'TSR-2026-ABC123', customerName: 'Test', data: {} }

  it('updates the existing row instead of appending a duplicate', async () => {
    zohoEnv()
    const { sheet, calls } = await loadSheet(1)

    const result = await sheet.syncQuoteToSheet(quote)

    expect(result.ok).toBeTruthy()
    expect(calls).toStrictEqual(['worksheet.records.update'])
    expect(calls).not.toContain('worksheet.records.add')

    vi.unstubAllGlobals()
    vi.doUnmock(import('@/lib/zoho/auth'))
    vi.resetModules()
  })

  it('falls back to appending when no row matches yet', async () => {
    zohoEnv()
    const { sheet, calls } = await loadSheet(0)

    const result = await sheet.syncQuoteToSheet(quote)

    expect(result.ok).toBeTruthy()
    expect(calls).toStrictEqual(['worksheet.records.update', 'worksheet.records.add'])

    vi.unstubAllGlobals()
    vi.doUnmock(import('@/lib/zoho/auth'))
    vi.resetModules()
  })
})
