/*
 * Zoho WorkDrive — saves each quote PDF under:
 *   {parent}/{Customer Name}/Quotes/{file}.pdf
 *
 * Required env vars:
 *   ZOHO_WORKDRIVE_PARENT_FOLDER_ID  Parent folder that holds customer folders
 * Optional:
 *   ZOHO_WORKDRIVE_API_URL           Default https://www.zohoapis.com/workdrive
 */

import { getZohoAccessToken, hasZohoCredentials, zohoAuthHeader } from './auth.js'

export function hasZohoWorkdriveConfig() {
  return Boolean(process.env.ZOHO_WORKDRIVE_PARENT_FOLDER_ID?.trim()) && hasZohoCredentials()
}

export function getZohoWorkdriveConfigStatus() {
  if (!process.env.ZOHO_WORKDRIVE_PARENT_FOLDER_ID?.trim()) {
    return { ok: false, reason: 'ZOHO_WORKDRIVE_PARENT_FOLDER_ID is not set' }
  }
  if (!hasZohoCredentials()) {
    return {
      ok: false,
      reason: 'Zoho OAuth incomplete — set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN',
    }
  }
  return { ok: true }
}

const apiUrl = () =>
  (process.env.ZOHO_WORKDRIVE_API_URL || 'https://www.zohoapis.com/workdrive').replace(/\/$/, '')

const parentFolderId = () => process.env.ZOHO_WORKDRIVE_PARENT_FOLDER_ID.trim()

const sanitizeFolderName = (name) =>
  String(name || 'Unknown Client')
    .trim()
    .replaceAll(/[\\/:*?"<>|]/g, '')
    .slice(0, 120) || 'Unknown Client'

async function listChildFolders(token, folderId) {
  const folders = []
  let offset = 0
  const limit = 50
  for (let page = 0; page < 20; page += 1) {
    const url = `${apiUrl()}/api/v1/files/${folderId}/files?filter%5Btype%5D=folder&page%5Blimit%5D=${limit}&page%5Boffset%5D=${offset}`
    const response = await fetch(url, {
      headers: { ...zohoAuthHeader(token), Accept: 'application/vnd.api+json' },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(
        `WorkDrive folder list failed (${response.status}): ${JSON.stringify(payload.errors || payload)}`,
      )
    }
    const items = payload.data || []
    folders.push(...items)
    if (items.length < limit) {
      break
    }
    offset += limit
  }
  return folders
}

async function createFolder(token, name, parentId) {
  const response = await fetch(`${apiUrl()}/api/v1/files`, {
    method: 'POST',
    headers: {
      ...zohoAuthHeader(token),
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'files',
        attributes: { name, parent_id: parentId },
      },
    }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.data?.id) {
    throw new Error(
      `WorkDrive folder create failed (${response.status}): ${JSON.stringify(payload.errors || payload)}`,
    )
  }
  return payload.data
}

async function findOrCreateChildFolder(token, parentId, name) {
  const safeName = sanitizeFolderName(name)
  const existing = await listChildFolders(token, parentId)
  const match = existing.find((folder) => folder.attributes?.name?.toLowerCase() === safeName.toLowerCase())
  if (match) {
    return { id: match.id, name: match.attributes.name, created: false }
  }
  const created = await createFolder(token, safeName, parentId)
  return { id: created.id, name: created.attributes?.name || safeName, created: true }
}

/**
 * Ensure {parent}/{Customer Name}/Quotes exists and return the Quotes folder.
 */
export async function findOrCreateClientQuotesFolder(clientName) {
  if (!hasZohoWorkdriveConfig()) {
    throw new Error('Zoho WorkDrive is not configured. Set ZOHO_WORKDRIVE_PARENT_FOLDER_ID.')
  }

  const token = await getZohoAccessToken()
  const customerFolder = await findOrCreateChildFolder(token, parentFolderId(), clientName)
  const quotesFolder = await findOrCreateChildFolder(token, customerFolder.id, 'Quotes')
  return {
    customerFolderId: customerFolder.id,
    customerFolderName: customerFolder.name,
    folderId: quotesFolder.id,
    folderName: `${customerFolder.name}/Quotes`,
    createdCustomer: customerFolder.created,
    createdQuotes: quotesFolder.created,
  }
}

/** @deprecated Prefer findOrCreateClientQuotesFolder */
export async function findOrCreateClientFolder(clientName) {
  const nested = await findOrCreateClientQuotesFolder(clientName)
  return {
    id: nested.folderId,
    name: nested.folderName,
    created: nested.createdCustomer || nested.createdQuotes,
  }
}

/**
 * Upload a PDF buffer into the given folder.
 */
export async function uploadPdfToFolder({ folderId, fileName, buffer }) {
  const token = await getZohoAccessToken()

  const form = new FormData()
  form.append('content', new Blob([buffer], { type: 'application/pdf' }), fileName)

  const url = `${apiUrl()}/api/v1/upload?parent_id=${encodeURIComponent(folderId)}&filename=${encodeURIComponent(fileName)}&override-name-exist=false`
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...zohoAuthHeader(token), Accept: 'application/vnd.api+json' },
    body: form,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      `WorkDrive upload failed (${response.status}): ${JSON.stringify(payload.errors || payload)}`,
    )
  }
  const attributes = payload.data?.[0]?.attributes || {}
  let resourceId = attributes.resource_id || null
  if (!resourceId && attributes['File INFO']) {
    try {
      resourceId = JSON.parse(attributes['File INFO']).RESOURCE_ID || null
    } catch {
      resourceId = null
    }
  }
  return { fileId: resourceId, raw: payload }
}

/**
 * Save a quote PDF to WorkDrive under {Customer Name}/Quotes/.
 */
export async function saveQuotePdfToWorkdrive({ clientName, fileName, buffer }) {
  const folder = await findOrCreateClientQuotesFolder(clientName)
  const upload = await uploadPdfToFolder({ folderId: folder.folderId, fileName, buffer })
  return {
    folderId: folder.folderId,
    folderName: folder.folderName,
    customerFolderId: folder.customerFolderId,
    fileId: upload.fileId,
  }
}

/**
 * Best-effort WorkDrive sync — never throws.
 */
export async function syncQuotePdfToWorkdrive({ clientName, fileName, buffer }) {
  const status = getZohoWorkdriveConfigStatus()
  if (!status.ok) {
    return { skipped: true, reason: status.reason }
  }
  try {
    const saved = await saveQuotePdfToWorkdrive({ clientName, fileName, buffer })
    return {
      ok: true,
      folder: saved.folderName,
      folderId: saved.folderId,
      fileId: saved.fileId,
    }
  } catch (error) {
    console.error('[quotes] workdrive upload failed', error)
    return { ok: false, error: error.message }
  }
}

// ─── Christmas invoices ──────────────────────────────────────────────────────

/**
 * Ensure {parent}/{Customer Name}/Invoices exists and return the Invoices
 * folder. `parentOverride` lets the Christmas flow use its own parent folder
 * (from CHRISTMAS_WORKDRIVE_PARENT_FOLDER_ID or invoice settings); it falls
 * back to ZOHO_WORKDRIVE_PARENT_FOLDER_ID.
 */
export async function findOrCreateClientInvoicesFolder(clientName, parentOverride) {
  const root =
    (parentOverride || process.env.CHRISTMAS_WORKDRIVE_PARENT_FOLDER_ID || '').trim() ||
    process.env.ZOHO_WORKDRIVE_PARENT_FOLDER_ID?.trim()

  if (!root) {
    throw new Error('Zoho WorkDrive is not configured. Set ZOHO_WORKDRIVE_PARENT_FOLDER_ID.')
  }

  const token = await getZohoAccessToken()
  const customerFolder = await findOrCreateChildFolder(token, root, clientName)
  const invoicesFolder = await findOrCreateChildFolder(token, customerFolder.id, 'Invoices')
  return {
    customerFolderId: customerFolder.id,
    customerFolderName: customerFolder.name,
    folderId: invoicesFolder.id,
    folderName: `${customerFolder.name}/Invoices`,
    createdCustomer: customerFolder.created,
    createdInvoices: invoicesFolder.created,
  }
}

/**
 * Save a Christmas invoice PDF to WorkDrive under {Customer Name}/Invoices/.
 */
export async function saveInvoicePdfToWorkdrive({
  clientName,
  fileName,
  buffer,
  parentFolderId: invoiceParentFolderId,
}) {
  const folder = await findOrCreateClientInvoicesFolder(clientName, invoiceParentFolderId)
  const upload = await uploadPdfToFolder({ folderId: folder.folderId, fileName, buffer })
  return {
    folderId: folder.folderId,
    folderName: folder.folderName,
    customerFolderId: folder.customerFolderId,
    fileId: upload.fileId,
  }
}

/**
 * Best-effort Christmas invoice WorkDrive sync — never throws.
 */
export async function syncInvoicePdfToWorkdrive({
  clientName,
  fileName,
  buffer,
  parentFolderId: invoiceParentFolderId,
}) {
  const status = getZohoWorkdriveConfigStatus()
  if (!status.ok && !invoiceParentFolderId?.trim()) {
    return { skipped: true, reason: status.reason }
  }
  try {
    const saved = await saveInvoicePdfToWorkdrive({
      clientName,
      fileName,
      buffer,
      parentFolderId: invoiceParentFolderId,
    })
    return {
      ok: true,
      folder: saved.folderName,
      folderId: saved.folderId,
      fileId: saved.fileId,
    }
  } catch (error) {
    console.error('[christmas/invoices] workdrive upload failed', error)
    return { ok: false, error: error.message }
  }
}
