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

## Service and color options

Each line item picks from fixed lists (`CHRISTMAS_SERVICE_TYPES` and `CHRISTMAS_LIGHT_COLORS` in
`src/lib/christmas/invoice-calc.js`):

- **Service:** Tree lights, Stake lights, Roofline / ridge, Garland
- **Color:** Warm white, Multicolor, Bright white

The quote-level "Color lights" field uses the same color list. Old invoices with free-text values still
open and show their saved value. The service and color print on the PDF, the Zoho Sheet row, and the
Jobber line description.

## Lights mockup

`/christmas/mockup` (Christmas Lights → Lights mockup). Quote users can open it too. From an invoice, the
"Lights mockup" card opens the mockup for that invoice (`/christmas/mockup?invoice=<id>`).

1. Take or pick a photo of the house. A straight-on daytime shot works best.
2. Pick a service and a color, tap points on the photo, then tap Finish.
   - Roofline / ridge, Garland, Stake lights: tap along the line.
   - Tree lights: tap around the tree outline.
3. Drag a dot to fix it. Tap a set of lights in the list to change its color. Tap outside the photo to hide
   the dots.
4. **Set scale** to measure: tap both ends of something you know (front door height, garage door width),
   then pick a preset or type the length. Bulbs resize to real C9 size, roofline bulbs space 1 ft apart,
   stakes 3 ft apart.
5. The **Estimate** shows feet (trees by height, stakes by count) and prices them from "Your prices". Prices
   are shared by everyone and save to the database when you leave a price box. It is an estimate from one
   photo — check on site before the final price.
6. **Save**: from an invoice it saves to that invoice. Otherwise name it (customer or address) and save.
   **Saved mockups** lists everything saved; open one to keep working.
7. Share or Download the picture, or send the lines (with measured quantities and prices) to a quote.

Storage (Postgres): `christmas_mockups` holds the photo, the finished picture, and the traced lights + scale
as JSON, optionally tied to an invoice. `christmas_mockup_settings` holds the estimator prices. Both tables
are created on first use. API routes live under `/api/christmas/invoices/mockups` and
`/api/christmas/invoices/[id]/mockup`.

Code: geometry and estimating in `src/lib/christmas/mockup-geometry.js` (tested), drawing in
`src/lib/christmas/mockup-render.js`, storage in `src/lib/christmas/mockup-db.js`, page in
`src/components/admin/christmas-mockup-client.jsx` and `christmas-mockup-panels.jsx`.

Bulb and garland art: the source files live in `src/components/admin/drawing-assets/`. The page loads small
copies from `public/christmas-mockup/`. After you change the source art, rebuild the copies with
`python3 scripts/prepare-mockup-assets.py` (needs Pillow). Every bulb color is recolored from the blue C9,
because it is the only source bulb with a clean transparent background.

## Env vars

See the Christmas Invoices block in `.env.example` (`CHRISTMAS_COMPANY_*`, `CHRISTMAS_INVOICE_*`,
`CHRISTMAS_WORKDRIVE_PARENT_FOLDER_ID`, `CHRISTMAS_SHEET_RESOURCE_ID`, `CHRISTMAS_SHEET_WORKSHEET_NAME`).
Company details can also be edited in the admin settings page.
