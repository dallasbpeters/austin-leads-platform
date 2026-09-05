/*
 * Side-effect sync for saved quotes: Zoho Sheet, CRM, WorkDrive.
 * Each integration is best-effort and reported independently.
 */

import { syncQuoteToSheet } from '@/lib/zoho/sheet'
import { syncQuotePdfToWorkdrive } from '@/lib/zoho/workdrive'
import { syncQuoteToCrm } from './crm.js'
import { markQuoteSheetSynced, markQuoteUploaded } from './db.js'
import { quotePdfFileName, renderQuotePdf } from './pdf.js'

/**
 * @param {object} quote
 * @param {{ includeWorkdrive?: boolean }} [options]
 */
export async function syncQuoteIntegrations(quote, options = {}) {
  const includeWorkdrive = options.includeWorkdrive !== false
  const results = {
    sheet: null,
    crm: null,
    workdrive: null,
  }

  results.sheet = await syncQuoteToSheet(quote)
  if (results.sheet.ok) {
    await markQuoteSheetSynced(quote.id)
  }

  results.crm = await syncQuoteToCrm(quote)

  if (includeWorkdrive) {
    try {
      const buffer = await renderQuotePdf(quote)
      const fileName = quotePdfFileName(quote)
      results.workdrive = await syncQuotePdfToWorkdrive({
        clientName: quote.customerName || quote.data?.inputs?.customerName,
        fileName,
        buffer,
      })
      if (results.workdrive.ok) {
        await markQuoteUploaded(quote.id, {
          fileId: results.workdrive.fileId,
          folderId: results.workdrive.folderId,
        })
      }
    } catch (error) {
      console.error('[quotes] workdrive sync failed', error)
      results.workdrive = { ok: false, error: error.message }
    }
  } else {
    results.workdrive = { skipped: true, reason: 'WorkDrive not requested' }
  }

  return results
}
