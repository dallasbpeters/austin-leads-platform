import {
  getChristmasInvoiceSettingsRow,
  hasInvoiceDatabase,
  upsertChristmasInvoiceSettingsRow,
} from './invoice-db.js'
import { DEFAULT_INVOICE_TEMPLATE_KEY } from './invoice-templates.js'
import { hasZohoCredentials } from '@/lib/zoho/auth'

const DEFAULT_COMPANY_NAME = 'Texas Christmas Lights'
const DEFAULT_TAGLINE = 'Professional installation in Austin and surrounding areas'
const DEFAULT_COMPANY_EMAIL = 'info@tx-christmaslights.com'
const DEFAULT_COMPANY_WEBSITE = 'www.tx-christmaslights.com'
const DEFAULT_SHEET_WORKSHEET = 'Christmas Invoices'

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getEnvDefaults() {
  return {
    templateKey: normalizeString(process.env.CHRISTMAS_INVOICE_TEMPLATE) || DEFAULT_INVOICE_TEMPLATE_KEY,
    companyName: normalizeString(process.env.CHRISTMAS_COMPANY_NAME) || DEFAULT_COMPANY_NAME,
    companyTagline: normalizeString(process.env.CHRISTMAS_COMPANY_TAGLINE) || DEFAULT_TAGLINE,
    companyPhone: normalizeString(process.env.CHRISTMAS_COMPANY_PHONE),
    companyEmail: normalizeString(process.env.CHRISTMAS_COMPANY_EMAIL) || DEFAULT_COMPANY_EMAIL,
    companyWebsite: normalizeString(process.env.CHRISTMAS_COMPANY_WEBSITE) || DEFAULT_COMPANY_WEBSITE,
    logoUrl: normalizeString(process.env.CHRISTMAS_INVOICE_LOGO_PATH) || '/christmas-logo.png',
    invoiceNumberPrefix: normalizeString(process.env.CHRISTMAS_INVOICE_NUMBER_PREFIX) || 'TCL',
    workdriveParentFolderId: normalizeString(process.env.CHRISTMAS_WORKDRIVE_PARENT_FOLDER_ID),
    sheetResourceId: normalizeString(process.env.CHRISTMAS_SHEET_RESOURCE_ID),
    sheetWorksheetName:
      normalizeString(process.env.CHRISTMAS_SHEET_WORKSHEET_NAME) || DEFAULT_SHEET_WORKSHEET,
    terms: process.env.CHRISTMAS_INVOICE_TERMS || '',
    salesTaxRatePercent: Number(process.env.CHRISTMAS_SALES_TAX_RATE_PERCENT) || 8.25,
    earlyPaymentDiscountPercent: Number(process.env.CHRISTMAS_EARLY_PAYMENT_DISCOUNT_PERCENT) || 20,
    payInFullDiscountPercent: Number(process.env.CHRISTMAS_PAY_IN_FULL_DISCOUNT_PERCENT) || 5,
  }
}

/**
 * Resolve effective settings: DB row (single-row id='default') overrides env
 * defaults, mirroring the lead routing settings pattern. Also returns an
 * integration-readiness envelope so the admin UI can show real status.
 */
const mergeSettingsRecord = (record, envDefaults) => ({
  title: 'Christmas Invoice Settings',
  templateKey: normalizeString(record?.templateKey) || envDefaults.templateKey,
  companyName: normalizeString(record?.companyName) || envDefaults.companyName,
  companyTagline: normalizeString(record?.companyTagline) || envDefaults.companyTagline,
  companyPhone: normalizeString(record?.companyPhone) || envDefaults.companyPhone,
  companyEmail: normalizeString(record?.companyEmail) || envDefaults.companyEmail,
  companyWebsite: normalizeString(record?.companyWebsite) || envDefaults.companyWebsite,
  logoUrl: normalizeString(record?.logoUrl) || envDefaults.logoUrl,
  invoiceNumberPrefix: normalizeString(record?.invoiceNumberPrefix) || envDefaults.invoiceNumberPrefix,
  workdriveParentFolderId:
    normalizeString(record?.workdriveParentFolderId) || envDefaults.workdriveParentFolderId,
  sheetResourceId: normalizeString(record?.sheetResourceId) || envDefaults.sheetResourceId,
  sheetWorksheetName: normalizeString(record?.sheetWorksheetName) || envDefaults.sheetWorksheetName,
  terms: record?.terms === null || record?.terms === undefined ? envDefaults.terms : String(record.terms),
  salesTaxRatePercent: record?.salesTaxRatePercent ?? envDefaults.salesTaxRatePercent,
  earlyPaymentDiscountPercent: record?.earlyPaymentDiscountPercent ?? envDefaults.earlyPaymentDiscountPercent,
  payInFullDiscountPercent: record?.payInFullDiscountPercent ?? envDefaults.payInFullDiscountPercent,
})

export async function getChristmasInvoiceSettings() {
  const envDefaults = getEnvDefaults()
  const record = hasInvoiceDatabase() ? await getChristmasInvoiceSettingsRow().catch(() => null) : null
  const settings = mergeSettingsRecord(record, envDefaults)

  const zohoConfigured = hasZohoCredentials()
  const workdriveFolder =
    settings.workdriveParentFolderId || normalizeString(process.env.ZOHO_WORKDRIVE_PARENT_FOLDER_ID)
  const sheetResource = settings.sheetResourceId || normalizeString(process.env.ZOHO_SHEET_RESOURCE_ID)

  return {
    ...settings,
    canSave: hasInvoiceDatabase(),
    documentSource: record ? 'database' : 'env',
    zohoConfigured,
    workdriveReady: Boolean(workdriveFolder && zohoConfigured),
    workdriveFolder,
    sheetReady: Boolean(sheetResource && zohoConfigured),
    sheetResource: sheetResource || '',
  }
}

export async function saveChristmasInvoiceSettings(input) {
  if (!hasInvoiceDatabase()) {
    throw new Error('Invoice settings database is not configured.')
  }

  const record = {
    templateKey: normalizeString(input.templateKey) || DEFAULT_INVOICE_TEMPLATE_KEY,
    companyName: normalizeString(input.companyName) || DEFAULT_COMPANY_NAME,
    companyTagline: normalizeString(input.companyTagline),
    companyPhone: normalizeString(input.companyPhone),
    companyEmail: normalizeString(input.companyEmail),
    companyWebsite: normalizeString(input.companyWebsite),
    logoUrl: normalizeString(input.logoUrl),
    invoiceNumberPrefix: normalizeString(input.invoiceNumberPrefix) || 'TCL',
    workdriveParentFolderId: normalizeString(input.workdriveParentFolderId),
    sheetResourceId: normalizeString(input.sheetResourceId),
    sheetWorksheetName: normalizeString(input.sheetWorksheetName) || DEFAULT_SHEET_WORKSHEET,
    terms: typeof input.terms === 'string' ? input.terms.trim() : '',
    salesTaxRatePercent: input.salesTaxRatePercent,
    earlyPaymentDiscountPercent: input.earlyPaymentDiscountPercent,
    payInFullDiscountPercent: input.payInFullDiscountPercent,
  }

  if (!record.companyName) {
    throw new Error('Company name is required.')
  }

  await upsertChristmasInvoiceSettingsRow(record)

  return getChristmasInvoiceSettings()
}
