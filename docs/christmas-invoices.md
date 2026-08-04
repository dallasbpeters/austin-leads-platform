# Christmas Invoices — setup guide

The Christmas invoice builder lives at `/christmas/invoices` in the admin console (Christmas Lights →
Invoices). It's a live two-pane editor — form details on the left, a live PDF preview on the right (updates
as you type). Save files the PDF to Zoho WorkDrive under `{Customer Name}/Invoices/` and appends a row to
the Zoho Sheet worksheet. `Email invoice` renders the current PDF, emails it to the customer via Resend
(`POST /api/christmas/invoices/[id]/send`), marks the invoice sent, and re-syncs Zoho.

Template + company settings are editable at `/christmas/invoices/settings` (or the "Template settings"
link on the invoices page) and are stored the same way the Texas Solar lead routing settings are — a
single-row Postgres table (`christmas_invoice_settings`, `id = 'default'`) that overrides env defaults.

## One-time setup

1. `pnpm install` (adds `@react-pdf/renderer`)
2. `pnpm db:setup` (creates `christmas_invoices` + `christmas_invoice_settings`)
3. Fill in the new env vars (see the Christmas Invoices block in `.env.example`), then
   `pnpm vercel:env:push` for production.

## Zoho credentials

Reuses the same Zoho OAuth as quotes. The Self Client refresh token needs the same scopes:

```
ZohoSheet.dataAPI.UPDATE,ZohoSheet.dataAPI.READ,WorkDrive.files.CREATE,WorkDrive.files.READ
```

Set `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` (see `docs/quotes-setup.md` for the
code-exchange flow).

### Zoho Sheet

- Create a spreadsheet, name a worksheet `Christmas Invoices` (or set `CHRISTMAS_SHEET_WORKSHEET_NAME`).
- Row 1 headers must match the keys in `CHRISTMAS_INVOICE_SHEET_COLUMNS`
  (`src/lib/zoho/christmas-sheet.js`). Copy into row 1:

```
Invoice Number, Date, Updated At, Status, Invoice ID, Customer, Email, Phone, Address, City, State, ZIP, Template, Package, Install Date, Subtotal, Deposit, Balance Due, Line Items, Notes, WorkDrive Folder
```

- `CHRISTMAS_SHEET_RESOURCE_ID` (or fallback `ZOHO_SHEET_RESOURCE_ID`) is the id after `/sheet/open/`
  in the sheet URL — not a WorkDrive folder/file id.

### Zoho WorkDrive

- `CHRISTMAS_WORKDRIVE_PARENT_FOLDER_ID` (or fallback `ZOHO_WORKDRIVE_PARENT_FOLDER_ID`) is the id in
  the folder URL. On create/update the app creates `{Customer Name}/Invoices/` (case-insensitive match)
  and uploads the generated PDF.
- The invoice create API returns per-integration `results` (`sheet`, `workdrive`) so a Zoho failure
  never blocks the invoice save.

## Packages

The builder ships presets that mirror the txchristmaslights.com packages (`src/lib/christmas/invoice-calc.js`):

- **Roofline Installation** — roofline & gutter runs ($300)
- **Full Front Installation** — roofline + trees, bushes, walkways, front features ($500)
- **Full Property Installation** — roofline, front/back yards, fences, trees ($1,000)
- **Custom Package** — design your own line items

All line items are editable after applying a preset, so any package can be customized per client.
Deposit is optional and reduces the subtotal to a balance due.

## Env vars

See the Christmas Invoices block in `.env.example` (`CHRISTMAS_COMPANY_*`, `CHRISTMAS_INVOICE_*`,
`CHRISTMAS_WORKDRIVE_PARENT_FOLDER_ID`, `CHRISTMAS_SHEET_RESOURCE_ID`, `CHRISTMAS_SHEET_WORKSHEET_NAME`).
Company details can also be edited in the admin settings page.
