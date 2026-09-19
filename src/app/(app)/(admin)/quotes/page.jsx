import QuotesClient from '@/components/admin/quotes-client'
import { safeAuth } from '@/lib/auth/session'
import { ensureQuotesTable, getQuote, hasQuoteDatabase, listQuotes } from '@/lib/quotes/db'

export const metadata = {
  title: 'Quotes | Austin Leads Admin',
}

export default async function QuotesPage({ searchParams }) {
  const params = await searchParams
  const editId = typeof params?.edit === 'string' ? params.edit : null
  const dupeId = typeof params?.dupe === 'string' ? params.dupe : null
  const session = await safeAuth()

  const dbConfigured = hasQuoteDatabase()
  let quotes = []
  let dbError = null

  // The quote behind ?edit= / ?dupe=, loaded by id so the builder can open it
  // even when it falls outside the recent-quote list below.
  let preloadQuote = null

  if (dbConfigured) {
    try {
      await ensureQuotesTable()
      const [list, target] = await Promise.all([
        listQuotes({ limit: 200 }),
        editId || dupeId ? getQuote(editId || dupeId) : null,
      ])
      quotes = list
      preloadQuote = target
    } catch (error) {
      dbError = { message: error?.message || String(error) }
      console.error('[quotes] failed to load quotes', error)
    }
  }

  const zohoAuthEnabled = Boolean(
    (process.env.AUTH_ZOHO_ID || process.env.ZOHO_CLIENT_ID) &&
    (process.env.AUTH_ZOHO_SECRET || process.env.ZOHO_CLIENT_SECRET),
  )

  return (
    <QuotesClient
      dbConfigured={dbConfigured}
      dbError={dbError}
      editId={editId}
      initialQuotes={quotes}
      preloadQuote={preloadQuote}
      zohoAuthEnabled={zohoAuthEnabled}
      zohoConnected={Boolean(session?.user?.zohoConnected) && !session?.user?.zohoNeedsReauth}
    />
  )
}
