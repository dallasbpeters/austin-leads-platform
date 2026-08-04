/*
 * Side-effect sync for saved Christmas invoices: Zoho Sheet row + WorkDrive
 * PDF upload (folder {Customer Name}/Invoices). Each integration is
 * best-effort and reported independently so a Zoho failure never blocks the
 * invoice save.
 */

import { markInvoiceSheetSynced, markInvoiceUploaded } from './invoice-db.js'
import { christmasInvoiceFileName, renderChristmasInvoicePdf } from './invoice-pdf.js'
import { getChristmasInvoiceSettings } from './invoice-settings.js'
import { syncChristmasInvoiceToSheet } from '@/lib/zoho/christmas-sheet'
import { syncInvoicePdfToWorkdrive } from '@/lib/zoho/workdrive'

/**
 * @param {object} invoice
 * @param {object} [settings] Resolved invoice settings (fetched if omitted)
 * @param {{ includeWorkdrive?: boolean }} [options]
 */
export async function syncChristmasInvoiceIntegrations(invoice, settings = null, options = {}) {
  const includeWorkdrive = options.includeWorkdrive !== false
  const config = settings || (await getChristmasInvoiceSettings())
  const results = { sheet: null, workdrive: null }

  results.sheet = await syncChristmasInvoiceToSheet({
    invoice,
    resourceId: config.sheetResource || config.sheetResourceId,
    worksheetName: config.sheetWorksheetName,
  })
  if (results.sheet.ok) {
    await markInvoiceSheetSynced(invoice.id)
  }

  if (includeWorkdrive) {
    try {
      const buffer = await renderChristmasInvoicePdf(invoice, { company: config })
      const fileName = christmasInvoiceFileName(invoice)
      results.workdrive = await syncInvoicePdfToWorkdrive({
        clientName: invoice.customerName,
        fileName,
        buffer,
        parentFolderId: config.workdriveFolder,
      })
      if (results.workdrive.ok) {
        await markInvoiceUploaded(invoice.id, {
          fileId: results.workdrive.fileId,
          folderId: results.workdrive.folderId,
        })
      }
    } catch (error) {
      console.error('[christmas/invoices] workdrive sync failed', error)
      results.workdrive = { ok: false, error: error.message }
    }
  } else {
    results.workdrive = { skipped: true, reason: 'WorkDrive not requested' }
  }

  return results
}
