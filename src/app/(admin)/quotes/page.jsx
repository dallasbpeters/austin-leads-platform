import QuotesClient from '@/components/admin/quotes-client'
import { safeAuth } from '@/lib/auth/session'
import { ensureQuotesTable, hasQuoteDatabase, listQuotes } from '@/lib/quotes/db'

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

  if (dbConfigured) {
    try {
      await ensureQuotesTable()
      quotes = await listQuotes({ limit: 200 })
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
      dupeId={dupeId}
      editId={editId}
      initialQuotes={quotes}
      zohoAuthEnabled={zohoAuthEnabled}
      zohoConnected={Boolean(session?.user?.zohoConnected)}
    />
  )
}
