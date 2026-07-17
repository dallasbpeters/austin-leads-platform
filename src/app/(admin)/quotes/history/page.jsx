import QuotesHistoryClient from '@/components/admin/quotes-history-client'
import { ensureQuotesTable, hasQuoteDatabase, listQuotes } from '@/lib/quotes/db'

export const metadata = {
  title: 'Quote History | Austin Leads Admin',
}

export default async function QuotesHistoryPage() {
  const dbConfigured = hasQuoteDatabase()
  let quotes = []
  let dbError = null

  if (dbConfigured) {
    try {
      await ensureQuotesTable()
      quotes = await listQuotes({ limit: 500 })
    } catch (error) {
      dbError = { message: error?.message || String(error) }
      console.error('[quotes/history] failed to load quotes', error)
    }
  }

  return <QuotesHistoryClient initialQuotes={quotes} dbConfigured={dbConfigured} dbError={dbError} />
}
