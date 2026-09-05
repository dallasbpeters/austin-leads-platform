-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "document_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"client_id" text,
	"actor_email" text,
	"event_type" text NOT NULL,
	"event_summary" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"source_type" text NOT NULL,
	"source_section" text,
	"service_interest" text,
	"site_slug" text NOT NULL,
	"site_name" text NOT NULL,
	"source_domain" text NOT NULL,
	"page_path" text NOT NULL,
	"page_title" text,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"pipeline_stage" text DEFAULT 'new' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"assigned_to" text,
	"last_contacted_at" timestamp with time zone,
	"follow_up_at" timestamp with time zone,
	"internal_notes" text
);
--> statement-breakpoint
CREATE TABLE "domain_records" (
	"domain" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"site_slug" text NOT NULL,
	"tier" text DEFAULT 'landing' NOT NULL,
	"redirect_target" text,
	"project_id" text,
	"verified" boolean DEFAULT false NOT NULL,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"dns_instructions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"apex_name" text,
	"git_branch" text,
	"source" text DEFAULT 'local' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "christmas_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"customer_phone" text,
	"property_address" text,
	"property_city" text,
	"property_state" text DEFAULT 'TX',
	"property_zip" text,
	"invoice_date" date,
	"due_date" date,
	"install_date" date,
	"template_key" text DEFAULT 'christmas-classic' NOT NULL,
	"subtotal_cents" bigint DEFAULT 0 NOT NULL,
	"deposit_cents" bigint DEFAULT 0 NOT NULL,
	"balance_due_cents" bigint DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sent_at" timestamp with time zone,
	"emailed_to" text,
	"zoho_sheet_synced_at" timestamp with time zone,
	"workdrive_file_id" text,
	"workdrive_folder_id" text,
	"customer_first_name" text,
	"customer_last_name" text,
	"jobber_client_id" text,
	"jobber_invoice_id" text,
	"jobber_synced_at" timestamp with time zone,
	"resend_email_id" text,
	"email_status" text,
	"email_checked_at" timestamp with time zone,
	CONSTRAINT "christmas_invoices_invoice_number_key" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "jobber_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"jobber_account_id" text,
	"account_name" text,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"scope" text,
	"connected_at" timestamp with time zone,
	"disconnected_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "solar_quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"quote_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"customer_phone" text,
	"property_address" text,
	"property_city" text,
	"property_state" text DEFAULT 'TX',
	"property_zip" text,
	"utility_provider" text,
	"system_size_kw" numeric,
	"annual_production_kwh" numeric,
	"system_price_cents" bigint,
	"net_price_cents" bigint,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sent_at" timestamp with time zone,
	"emailed_to" text,
	"zoho_sheet_synced_at" timestamp with time zone,
	"workdrive_file_id" text,
	"workdrive_folder_id" text,
	"resend_email_id" text,
	"email_status" text,
	"delivered_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"open_count" integer DEFAULT 0 NOT NULL,
	"signature_request_id" text,
	"signature_requested_at" timestamp with time zone,
	CONSTRAINT "solar_quotes_quote_number_key" UNIQUE("quote_number")
);
--> statement-breakpoint
CREATE TABLE "christmas_invoice_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"template_key" text DEFAULT 'christmas-classic' NOT NULL,
	"company_name" text,
	"company_tagline" text,
	"company_phone" text,
	"company_email" text,
	"company_website" text,
	"logo_url" text,
	"invoice_number_prefix" text DEFAULT 'TCL',
	"workdrive_parent_folder_id" text,
	"sheet_resource_id" text,
	"sheet_worksheet_name" text,
	"terms" text,
	"sales_tax_rate_percent" numeric DEFAULT '8.25',
	"early_payment_discount_percent" numeric DEFAULT '20',
	"pay_in_full_discount_percent" numeric DEFAULT '5'
);
--> statement-breakpoint
CREATE TABLE "jobber_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"topic" text NOT NULL,
	"account_id" text,
	"item_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "lead_routing_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email_notifications_enabled" boolean DEFAULT true NOT NULL,
	"notification_to_email" text,
	"from_name" text,
	"from_email" text,
	"subject_prefix" text,
	"resend_template_id" text
);
--> statement-breakpoint
CREATE TABLE "christmas_slots" (
	"id" text PRIMARY KEY NOT NULL,
	"install_date" date NOT NULL,
	"season_year" integer DEFAULT 2025 NOT NULL,
	"capacity" integer DEFAULT 6 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "christmas_slots_install_date_key" UNIQUE("install_date")
);
--> statement-breakpoint
CREATE TABLE "christmas_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"address" text NOT NULL,
	"install_date" date NOT NULL,
	"package_slug" text DEFAULT 'unknown' NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"deposit_amount_cents" integer DEFAULT 15000 NOT NULL,
	"deposit_status" text DEFAULT 'pending' NOT NULL,
	"balance_amount_cents" integer,
	"balance_status" text DEFAULT 'unpaid' NOT NULL,
	"status" text DEFAULT 'booked' NOT NULL,
	"notes" text,
	"site_slug" text DEFAULT 'txchristmaslights' NOT NULL,
	"phone" text,
	"crew" text,
	"stripe_invoice_id" text,
	CONSTRAINT "christmas_jobs_stripe_session_id_key" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
CREATE TABLE "platform_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "document_clients" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"address" text,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_signature_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"status" text DEFAULT 'draft' NOT NULL,
	"client_id" text,
	"document_asset_id" text,
	"title" text NOT NULL,
	"source_type" text NOT NULL,
	"template_id" text,
	"file_name" text,
	"file_sha256" text,
	"docuseal_submission_id" text,
	"send_channel" text DEFAULT 'resend' NOT NULL,
	"legal_basis" text DEFAULT 'esign_consent' NOT NULL,
	"consent_text" text NOT NULL,
	"compliance_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"provider_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by_email" text
);
--> statement-breakpoint
CREATE TABLE "document_library_items" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_id" text,
	"request_id" text,
	"title" text NOT NULL,
	"file_name" text NOT NULL,
	"file_mime_type" text DEFAULT 'application/pdf' NOT NULL,
	"file_base64" text NOT NULL,
	"file_sha256" text,
	"source_type" text DEFAULT 'upload' NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"status" text DEFAULT 'pending' NOT NULL,
	"request_id" text NOT NULL,
	"client_id" text,
	"name" text,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"signing_url" text,
	"provider_submitter_id" text,
	"resend_email_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_audit_events" ADD CONSTRAINT "document_audit_events_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."document_signature_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_audit_events" ADD CONSTRAINT "document_audit_events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."document_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_signature_requests" ADD CONSTRAINT "document_signature_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."document_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_library_items" ADD CONSTRAINT "document_library_items_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."document_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_library_items" ADD CONSTRAINT "document_library_items_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."document_signature_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_recipients" ADD CONSTRAINT "document_recipients_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."document_signature_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_recipients" ADD CONSTRAINT "document_recipients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."document_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_audit_events_request_idx" ON "document_audit_events" USING btree ("request_id" text_ops,"created_at" text_ops);--> statement-breakpoint
CREATE INDEX "christmas_invoices_created_at_idx" ON "christmas_invoices" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "christmas_invoices_customer_name_idx" ON "christmas_invoices" USING btree ("customer_name" text_ops);--> statement-breakpoint
CREATE INDEX "christmas_invoices_resend_email_id_idx" ON "christmas_invoices" USING btree ("resend_email_id" text_ops);--> statement-breakpoint
CREATE INDEX "solar_quotes_created_at_idx" ON "solar_quotes" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "solar_quotes_customer_name_idx" ON "solar_quotes" USING btree ("customer_name" text_ops);--> statement-breakpoint
CREATE INDEX "solar_quotes_resend_email_id_idx" ON "solar_quotes" USING btree ("resend_email_id" text_ops);--> statement-breakpoint
CREATE INDEX "jobber_webhook_events_received_at_idx" ON "jobber_webhook_events" USING btree ("received_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "platform_users_email_lower_idx" ON "platform_users" USING btree (lower(email) text_ops);--> statement-breakpoint
CREATE INDEX "document_clients_email_idx" ON "document_clients" USING btree (lower(email) text_ops);--> statement-breakpoint
CREATE INDEX "document_signature_requests_asset_idx" ON "document_signature_requests" USING btree ("document_asset_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_signature_requests_client_idx" ON "document_signature_requests" USING btree ("client_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_library_items_client_idx" ON "document_library_items" USING btree ("client_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_library_items_request_idx" ON "document_library_items" USING btree ("request_id" text_ops);--> statement-breakpoint
CREATE INDEX "document_recipients_request_idx" ON "document_recipients" USING btree ("request_id" text_ops);
*/