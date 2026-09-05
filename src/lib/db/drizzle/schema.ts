import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const documentAuditEvents = pgTable(
  'document_audit_events',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    requestId: text('request_id'),
    clientId: text('client_id'),
    actorEmail: text('actor_email'),
    eventType: text('event_type').notNull(),
    eventSummary: text('event_summary').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb().default({}).notNull(),
  },
  (table) => [
    index('document_audit_events_request_idx').using(
      'btree',
      table.requestId.asc().nullsLast().op('text_ops'),
      table.createdAt.desc().nullsFirst().op('text_ops'),
    ),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [documentSignatureRequests.id],
      name: 'document_audit_events_request_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [documentClients.id],
      name: 'document_audit_events_client_id_fkey',
    }).onDelete('set null'),
  ],
)

export const leadSubmissions = pgTable('lead_submissions', {
  id: text().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  status: text().default('new').notNull(),
  sourceType: text('source_type').notNull(),
  sourceSection: text('source_section'),
  serviceInterest: text('service_interest'),
  siteSlug: text('site_slug').notNull(),
  siteName: text('site_name').notNull(),
  sourceDomain: text('source_domain').notNull(),
  pagePath: text('page_path').notNull(),
  pageTitle: text('page_title'),
  fullName: text('full_name').notNull(),
  email: text().notNull(),
  phone: text(),
  notes: text(),
  metadata: jsonb().default({}).notNull(),
  pipelineStage: text('pipeline_stage').default('new').notNull(),
  priority: text().default('normal').notNull(),
  assignedTo: text('assigned_to'),
  lastContactedAt: timestamp('last_contacted_at', { withTimezone: true, mode: 'string' }),
  followUpAt: timestamp('follow_up_at', { withTimezone: true, mode: 'string' }),
  internalNotes: text('internal_notes'),
})

export const domainRecords = pgTable('domain_records', {
  domain: text().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  siteSlug: text('site_slug').notNull(),
  tier: text().default('landing').notNull(),
  redirectTarget: text('redirect_target'),
  projectId: text('project_id'),
  verified: boolean().default(false).notNull(),
  verificationStatus: text('verification_status').default('pending').notNull(),
  dnsInstructions: jsonb('dns_instructions').default([]).notNull(),
  apexName: text('apex_name'),
  gitBranch: text('git_branch'),
  source: text().default('local').notNull(),
})

export const christmasInvoices = pgTable(
  'christmas_invoices',
  {
    id: text().primaryKey().notNull(),
    invoiceNumber: text('invoice_number').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    status: text().default('draft').notNull(),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email'),
    customerPhone: text('customer_phone'),
    propertyAddress: text('property_address'),
    propertyCity: text('property_city'),
    propertyState: text('property_state').default('TX'),
    propertyZip: text('property_zip'),
    invoiceDate: date('invoice_date'),
    dueDate: date('due_date'),
    installDate: date('install_date'),
    templateKey: text('template_key').default('christmas-classic').notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    subtotalCents: bigint('subtotal_cents', { mode: 'number' }).default(0).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    depositCents: bigint('deposit_cents', { mode: 'number' }).default(0).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    balanceDueCents: bigint('balance_due_cents', { mode: 'number' }).default(0).notNull(),
    data: jsonb().default({}).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    emailedTo: text('emailed_to'),
    zohoSheetSyncedAt: timestamp('zoho_sheet_synced_at', { withTimezone: true, mode: 'string' }),
    workdriveFileId: text('workdrive_file_id'),
    workdriveFolderId: text('workdrive_folder_id'),
    customerFirstName: text('customer_first_name'),
    customerLastName: text('customer_last_name'),
    jobberClientId: text('jobber_client_id'),
    jobberInvoiceId: text('jobber_invoice_id'),
    jobberSyncedAt: timestamp('jobber_synced_at', { withTimezone: true, mode: 'string' }),
    resendEmailId: text('resend_email_id'),
    emailStatus: text('email_status'),
    emailCheckedAt: timestamp('email_checked_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index('christmas_invoices_created_at_idx').using(
      'btree',
      table.createdAt.desc().nullsFirst().op('timestamptz_ops'),
    ),
    index('christmas_invoices_customer_name_idx').using(
      'btree',
      table.customerName.asc().nullsLast().op('text_ops'),
    ),
    index('christmas_invoices_resend_email_id_idx').using(
      'btree',
      table.resendEmailId.asc().nullsLast().op('text_ops'),
    ),
    unique('christmas_invoices_invoice_number_key').on(table.invoiceNumber),
  ],
)

export const jobberConnections = pgTable('jobber_connections', {
  id: text().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  jobberAccountId: text('jobber_account_id'),
  accountName: text('account_name'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true, mode: 'string' }),
  scope: text(),
  connectedAt: timestamp('connected_at', { withTimezone: true, mode: 'string' }),
  disconnectedAt: timestamp('disconnected_at', { withTimezone: true, mode: 'string' }),
})

export const solarQuotes = pgTable(
  'solar_quotes',
  {
    id: text().primaryKey().notNull(),
    quoteNumber: text('quote_number').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    status: text().default('draft').notNull(),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email'),
    customerPhone: text('customer_phone'),
    propertyAddress: text('property_address'),
    propertyCity: text('property_city'),
    propertyState: text('property_state').default('TX'),
    propertyZip: text('property_zip'),
    utilityProvider: text('utility_provider'),
    systemSizeKw: numeric('system_size_kw'),
    annualProductionKwh: numeric('annual_production_kwh'),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    systemPriceCents: bigint('system_price_cents', { mode: 'number' }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    netPriceCents: bigint('net_price_cents', { mode: 'number' }),
    data: jsonb().default({}).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    emailedTo: text('emailed_to'),
    zohoSheetSyncedAt: timestamp('zoho_sheet_synced_at', { withTimezone: true, mode: 'string' }),
    workdriveFileId: text('workdrive_file_id'),
    workdriveFolderId: text('workdrive_folder_id'),
    resendEmailId: text('resend_email_id'),
    emailStatus: text('email_status'),
    deliveredAt: timestamp('delivered_at', { withTimezone: true, mode: 'string' }),
    openedAt: timestamp('opened_at', { withTimezone: true, mode: 'string' }),
    openCount: integer('open_count').default(0).notNull(),
    signatureRequestId: text('signature_request_id'),
    signatureRequestedAt: timestamp('signature_requested_at', { withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index('solar_quotes_created_at_idx').using(
      'btree',
      table.createdAt.desc().nullsFirst().op('timestamptz_ops'),
    ),
    index('solar_quotes_customer_name_idx').using(
      'btree',
      table.customerName.asc().nullsLast().op('text_ops'),
    ),
    index('solar_quotes_resend_email_id_idx').using(
      'btree',
      table.resendEmailId.asc().nullsLast().op('text_ops'),
    ),
    unique('solar_quotes_quote_number_key').on(table.quoteNumber),
  ],
)

export const christmasInvoiceSettings = pgTable('christmas_invoice_settings', {
  id: text().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  templateKey: text('template_key').default('christmas-classic').notNull(),
  companyName: text('company_name'),
  companyTagline: text('company_tagline'),
  companyPhone: text('company_phone'),
  companyEmail: text('company_email'),
  companyWebsite: text('company_website'),
  logoUrl: text('logo_url'),
  invoiceNumberPrefix: text('invoice_number_prefix').default('TCL'),
  workdriveParentFolderId: text('workdrive_parent_folder_id'),
  sheetResourceId: text('sheet_resource_id'),
  sheetWorksheetName: text('sheet_worksheet_name'),
  terms: text(),
  salesTaxRatePercent: numeric('sales_tax_rate_percent').default('8.25'),
  earlyPaymentDiscountPercent: numeric('early_payment_discount_percent').default('20'),
  payInFullDiscountPercent: numeric('pay_in_full_discount_percent').default('5'),
})

export const jobberWebhookEvents = pgTable(
  'jobber_webhook_events',
  {
    id: text().primaryKey().notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    topic: text().notNull(),
    accountId: text('account_id'),
    itemId: text('item_id'),
    payload: jsonb().default({}).notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true, mode: 'string' }),
    error: text(),
  },
  (table) => [
    index('jobber_webhook_events_received_at_idx').using(
      'btree',
      table.receivedAt.desc().nullsFirst().op('timestamptz_ops'),
    ),
  ],
)

export const leadRoutingSettings = pgTable('lead_routing_settings', {
  id: text().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  emailNotificationsEnabled: boolean('email_notifications_enabled').default(true).notNull(),
  notificationToEmail: text('notification_to_email'),
  fromName: text('from_name'),
  fromEmail: text('from_email'),
  subjectPrefix: text('subject_prefix'),
  resendTemplateId: text('resend_template_id'),
})

export const christmasSlots = pgTable(
  'christmas_slots',
  {
    id: text().primaryKey().notNull(),
    installDate: date('install_date').notNull(),
    seasonYear: integer('season_year').default(2025).notNull(),
    capacity: integer().default(6).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    notes: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [unique('christmas_slots_install_date_key').on(table.installDate)],
)

export const christmasJobs = pgTable(
  'christmas_jobs',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    fullName: text('full_name').notNull(),
    email: text().notNull(),
    address: text().notNull(),
    installDate: date('install_date').notNull(),
    packageSlug: text('package_slug').default('unknown').notNull(),
    stripeSessionId: text('stripe_session_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    depositAmountCents: integer('deposit_amount_cents').default(15000).notNull(),
    depositStatus: text('deposit_status').default('pending').notNull(),
    balanceAmountCents: integer('balance_amount_cents'),
    balanceStatus: text('balance_status').default('unpaid').notNull(),
    status: text().default('booked').notNull(),
    notes: text(),
    siteSlug: text('site_slug').default('txchristmaslights').notNull(),
    phone: text(),
    crew: text(),
    stripeInvoiceId: text('stripe_invoice_id'),
  },
  (table) => [unique('christmas_jobs_stripe_session_id_key').on(table.stripeSessionId)],
)

export const platformUsers = pgTable(
  'platform_users',
  {
    id: text().primaryKey().notNull(),
    email: text().notNull(),
    passwordHash: text('password_hash').notNull(),
    name: text(),
    role: text().default('admin').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('platform_users_email_lower_idx').using('btree', sql`lower(email)`),
    unique('platform_users_email_key').on(table.email),
  ],
)

export const documentClients = pgTable(
  'document_clients',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    status: text().default('active').notNull(),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    company: text(),
    address: text(),
    notes: text(),
    metadata: jsonb().default({}).notNull(),
  },
  (table) => [index('document_clients_email_idx').using('btree', sql`lower(email)`)],
)

export const documentSignatureRequests = pgTable(
  'document_signature_requests',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    status: text().default('draft').notNull(),
    clientId: text('client_id'),
    documentAssetId: text('document_asset_id'),
    title: text().notNull(),
    sourceType: text('source_type').notNull(),
    templateId: text('template_id'),
    fileName: text('file_name'),
    fileSha256: text('file_sha256'),
    docusealSubmissionId: text('docuseal_submission_id'),
    sendChannel: text('send_channel').default('resend').notNull(),
    legalBasis: text('legal_basis').default('esign_consent').notNull(),
    consentText: text('consent_text').notNull(),
    complianceSnapshot: jsonb('compliance_snapshot').default({}).notNull(),
    providerPayload: jsonb('provider_payload').default({}).notNull(),
    createdByEmail: text('created_by_email'),
  },
  (table) => [
    index('document_signature_requests_asset_idx').using(
      'btree',
      table.documentAssetId.asc().nullsLast().op('text_ops'),
    ),
    index('document_signature_requests_client_idx').using(
      'btree',
      table.clientId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [documentClients.id],
      name: 'document_signature_requests_client_id_fkey',
    }).onDelete('set null'),
  ],
)

export const documentLibraryItems = pgTable(
  'document_library_items',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    clientId: text('client_id'),
    requestId: text('request_id'),
    title: text().notNull(),
    fileName: text('file_name').notNull(),
    fileMimeType: text('file_mime_type').default('application/pdf').notNull(),
    fileBase64: text('file_base64').notNull(),
    fileSha256: text('file_sha256'),
    sourceType: text('source_type').default('upload').notNull(),
    status: text().default('available').notNull(),
    metadata: jsonb().default({}).notNull(),
  },
  (table) => [
    index('document_library_items_client_idx').using(
      'btree',
      table.clientId.asc().nullsLast().op('text_ops'),
    ),
    index('document_library_items_request_idx').using(
      'btree',
      table.requestId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [documentClients.id],
      name: 'document_library_items_client_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [documentSignatureRequests.id],
      name: 'document_library_items_request_id_fkey',
    }).onDelete('set null'),
  ],
)

export const documentRecipients = pgTable(
  'document_recipients',
  {
    id: text().primaryKey().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    status: text().default('pending').notNull(),
    requestId: text('request_id').notNull(),
    clientId: text('client_id'),
    name: text(),
    email: text().notNull(),
    role: text().notNull(),
    signingUrl: text('signing_url'),
    providerSubmitterId: text('provider_submitter_id'),
    resendEmailId: text('resend_email_id'),
    metadata: jsonb().default({}).notNull(),
  },
  (table) => [
    index('document_recipients_request_idx').using('btree', table.requestId.asc().nullsLast().op('text_ops')),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [documentSignatureRequests.id],
      name: 'document_recipients_request_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [documentClients.id],
      name: 'document_recipients_client_id_fkey',
    }).onDelete('set null'),
  ],
)
