/*
 * Side-effect sync for saved Christmas invoices: Zoho Sheet row + WorkDrive
 * PDF upload (folder {Customer Name}/Invoices). Each integration is
 * best-effort and reported independently so a Zoho failure never blocks the
 * invoice save.
 *
 * Jobber is deliberately NOT included here — it's pushed on-demand only, via
 * the "Push to Jobber" button (POST /api/christmas/invoices/[id]/jobber →
 * src/lib/jobber/sync.js). It's a 14-day trial the business may not keep, so
 * nothing about routine save/update/send should depend on Jobber staying
 * connected or working.
 */

import { markInvoiceSheetSynced, markInvoiceUploaded } from './invoice-db.js'
import { christmasInvoiceFileName, renderChristmasInvoicePdf } from './invoice-pdf.js'
import { getChristmasInvoiceSettings } from './invoice-settings.js'
import { syncChristmasInvoiceToSheet } from '@/lib/zoho/christmas-sheet'
import { syncInvoicePdfToWorkdrive } from '@/lib/zoho/workdrive'

/**
 * @param {object} invoice The saved invoice record to sync out to Zoho
 * @param {object} [settings] Resolved invoice settings (fetched if omitted)
 * @param {{ includeWorkdrive?: boolean }} [options] Set includeWorkdrive false to skip the PDF upload
 */
export async function syncChristmasInvoiceIntegrations(invoice, settings = null, options = {}) {
  const includeWorkdrive = options.includeWorkdrive !== false
  const config = settings || (await getChristmasInvoiceSettings())

  const sheet = await syncChristmasInvoiceToSheet({
    invoice,
    resourceId: config.sheetResource || config.sheetResourceId,
    worksheetName: config.sheetWorksheetName,
  })
  if (sheet.ok) {
    await markInvoiceSheetSynced(invoice.id)
  }

  let workdrive
  if (includeWorkdrive) {
    try {
      const buffer = await renderChristmasInvoicePdf(invoice, { company: config })
      const fileName = christmasInvoiceFileName(invoice)
      workdrive = await syncInvoicePdfToWorkdrive({
        clientName: invoice.customerName,
        fileName,
        buffer,
        parentFolderId: config.workdriveFolder,
      })
      if (workdrive.ok) {
        await markInvoiceUploaded(invoice.id, { fileId: workdrive.fileId, folderId: workdrive.folderId })
      }
    } catch (error) {
      console.error('[christmas/invoices] workdrive sync failed', error)
      workdrive = { ok: false, error: error.message }
    }
  } else {
    workdrive = { skipped: true, reason: 'WorkDrive not requested' }
  }

  return { sheet, workdrive }
}
