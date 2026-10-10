# Solar Quotes — setup guide

The quote builder lives at `/quotes` in the admin console. On save it writes to Postgres, syncs a row to Zoho Sheet, upserts the customer into the admin CRM, generates the PDF, and files it in Zoho WorkDrive under `{Customer Name}/Quotes/`. Email (Resend) runs when you send.

## The corrected math

All calculations live in `src/lib/quotes/calc.js` and run server-side (the form preview and the PDF always agree).

- **No federal tax credit.** It expired Dec 31, 2025 and appears nowhere in the math or documents.
- **Utility rebate:** each provider has a default one-time rebate in `UTILITY_REBATE_DEFAULTS` (`src/lib/quotes/calc.js`). The quote form prefills it when you change provider and lets you edit per quote (including custom “Other” utilities). Only shown on the PDF when > $0.
- **Austin Energy customers:** default rebate $2,500; savings modeled as Value of Solar bill credits at 9.91¢/kWh on all production.
- **Other utilities:** savings = self-consumed kWh × retail rate, plus optional buyback rate on exported excess.
- 25-year projection uses rate escalation (default 4%/yr) and 0.5%/yr panel degradation.
- If annual production isn't provided, it's estimated at 1,350 kWh per kW DC (Austin-area yield).

Run `pnpm test` to execute the calc unit tests, which validate against a real OpenSolar proposal.

## One-time setup

1. `pnpm install` (adds `@react-pdf/renderer`)
2. `pnpm db:setup` (creates the `solar_quotes` table)
3. Fill in the new env vars (see the Solar Quotes block in `.env.example`), then `pnpm vercel:env:push` for production.

## Zoho credentials

Create a **Self Client** at [api-console.zoho.com](https://api-console.zoho.com):

1. Self Client → Generate Code with scopes (all four — READ is required for sheet append):
   `ZohoSheet.dataAPI.UPDATE,ZohoSheet.dataAPI.READ,WorkDrive.files.CREATE,WorkDrive.files.READ`
2. Exchange the code for a refresh token:
   ```
   POST https://accounts.zoho.com/oauth/v2/token
     grant_type=authorization_code
     client_id=...&client_secret=...&code=...
   ```
3. Set `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`.
   If the Zoho account is not on the US data center, also set `ZOHO_ACCOUNTS_URL` (e.g. `https://accounts.zoho.eu`).

### Zoho Sheet

- Create a spreadsheet, name a worksheet `Quotes` (or set `ZOHO_SHEET_WORKSHEET_NAME`).
- Row 1 headers must match the keys in `QUOTE_SHEET_COLUMNS` (`src/lib/zoho/sheet.js`). Zoho only fills columns whose header text matches exactly — add any missing headers to row 1.
- Full header list (copy into row 1):

```
Quote Number, Date, Updated At, Status, Quote ID, Emailed To, Customer, Email, Phone, Address, City, State, ZIP, Utility, Solar Panels, Inverter, Battery, Racking, Monitoring, System Price, Annual Production (kWh), Annual Consumption (kWh), Utility Rate ($/kWh), Rate Escalation, Buyback Rate ($/kWh), System Size (kW), Rebate, Discount, Net Price, First Year Savings, 25-Year Savings, Net Lifetime Savings, Average Annual Savings, Payback Years, Consumption Offset %, CO2 Offset (tons)
```

### System layout map

- Quotes can place panels on **Mapbox Satellite** (requires `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`) or upload a layout image.
- Click the map to place panels; drag to move; choose size (60/72-cell portrait & landscape, commercial) and angle presets.
- Click **Use map in PDF** to capture the satellite view into the quote’s System Layout image.

- Equipment columns combine make/model + watts/qty (e.g. `Mission Solar · 435W · Qty 21`).
- `ZOHO_SHEET_RESOURCE_ID` is the id after `/sheet/open/` in the sheet URL  
  (example: `https://sheet.zoho.com/sheet/open/RESOURCE_ID`).  
  Do **not** use a WorkDrive folder/file id — those look different and cause Zoho 500s.

### Zoho WorkDrive

- Parent folder should hold one folder per customer. Current production parent:
  [Customers folder](https://workdrive.zoho.com/folder/syvbh9431ddef4f4c4f1dbe1eab545fa2cb4a)
- `ZOHO_WORKDRIVE_PARENT_FOLDER_ID` is the id in that URL (`syvbh9431ddef4f4c4f1dbe1eab545fa2cb4a`).
- On save/send the app creates `{Customer Name}/Quotes/` (case-insensitive match) and uploads the PDF into `Quotes`.

### CRM

- Saving a quote upserts a `lead_submissions` row by customer email (`source_type: quote`, pipeline stage `quoted`).
- Customer email is required for CRM sync; without it Sheet/WorkDrive still run.

### Zoho contact typeahead (per-user)

- On the quote form, typing in **Customer name** searches **Zoho CRM Contacts** live.
- Uses the **signed-in user's** Zoho OAuth tokens (from “Sign in with Zoho” / Connect Zoho) — not the shared Sheet/WorkDrive refresh token.
- Contacts are **not** stored in this app; selection only fills the form fields.
- Use a Zoho **Server-based** client; only register the redirect URI (`/api/auth/callback/zoho`). Scopes are not configured on that client — the app requests them in the authorize URL at sign-in:
  `AaaServer.profile.Read,ZohoCRM.modules.contacts.READ,ZohoSearch.securesearch.READ`
- After a scope change in code, users need to Connect/Sign in with Zoho again to re-consent.

## Email

Reuses the existing Resend account (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`). The customer receives a branded summary email with the PDF attached.

## Email tracking (delivered / opened)

Quote statuses progress Draft → Sent → Delivered → Opened (with open counts), shown as badges in the quotes table. Bounces and complaints surface as red badges.

One-time Resend setup:

1. In the Resend dashboard, enable **open tracking** for the sending domain (Domains → your domain → Configuration).
2. Create a webhook (Webhooks → Add) pointing to `https://YOUR-SITE/api/quotes/email-events` with events `email.delivered`, `email.opened`, `email.bounced`, `email.complained`.
3. Copy the webhook signing secret into `RESEND_WEBHOOK_SECRET`.

The endpoint verifies the Svix signature (constant-time compare, 5-minute timestamp tolerance) before touching the database. Statuses only move forward — a late `delivered` event never downgrades an `opened` quote. The auth proxy lets this one path through without a session (`PUBLIC_API_PATHS` in `src/proxy.js`), because Resend cannot sign in.

Resend does not resend events that the webhook missed. The **Refresh** button on Quote History calls `POST /api/quotes/email-status`, which asks Resend for the current state of each quote that still reads Sent or Delayed and was sent in the last 30 days (up to 20 per run). Reading state needs a full-access key — set `RESEND_READ_API_KEY` if `RESEND_API_KEY` is send-only.

Note: open tracking relies on a tracking pixel; clients that block remote images (or Apple Mail privacy proxying) can under- or over-report opens. Treat "Opened" as a strong signal, not proof.

## Company details on the PDF

Set `QUOTE_COMPANY_PHONE`, `QUOTE_COMPANY_EMAIL`, `QUOTE_COMPANY_WEBSITE` to print contact details in the PDF header. Name and tagline default to Texas Solar and Roofing Pros branding.
