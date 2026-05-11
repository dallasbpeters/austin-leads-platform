# Texas Christmas Lights — Stripe Testing & Launch Checklist

> Paste this into a Notion page. Use checkboxes for each item.

---

## Environment Setup

- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local` (use `pk_live_...` for live, `pk_test_...` for test mode)
- [ ] `STRIPE_SECRET_KEY` is set in `.env.local`
- [ ] `STRIPE_WEBHOOK_SECRET` is set in `.env.local` — copy from Stripe dashboard under **Developers → Webhooks → [your endpoint] → Signing secret**
- [ ] `DATABASE_URL` or `NEON_DATABASE_URL` is set (Neon Postgres)
- [ ] Verify you are in the correct Stripe mode (live vs test) — check the Stripe dashboard header

---

## Stripe Products & Prices (already created)

| Product | Stripe Product ID | Price | Price ID |
|---|---|---|---|
| Installation Deposit | `prod_UUaKPfJUHnzQsj` | $150 | `price_1TVbAOF2OBzUX92SrsR0ZEC8` |
| Roofline Installation | `prod_UUa1pQN1BUW4En` | $300 | `price_1TVay2F2OBzUX92SPQEWM2hZ` |
| Full Front Installation | `prod_UUa1gj7myNcj07` | $500 | `price_1TVawuF2OBzUX92SwcfBYgmc` |
| Full Property Installation | `prod_UUa1c1RUUF8u7e` | $1,000 | `price_1TVavlF2OBzUX92SuAIbshCM` |

---

## Webhook Setup

- [ ] Webhook registered in Stripe dashboard at `https://tx-christmaslights.com/api/stripe/webhook`
- [ ] Event `checkout.session.completed` is selected (only event needed)
- [ ] `STRIPE_WEBHOOK_SECRET` (`whsec_...`) is set in production environment variables (Vercel)
- [ ] Webhook shows as **Enabled** in Stripe dashboard

### Local webhook testing (Stripe CLI)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward to local dev server — copy the whsec_ it prints and set as STRIPE_WEBHOOK_SECRET
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In a second terminal, trigger a test event
stripe trigger checkout.session.completed
```

---

## Admin Slots Setup

Before accepting bookings, add install dates in the admin:

- [ ] Go to `/admin/christmas/slots`
- [ ] Click **+ Add date** and add the 2025 install windows
- [ ] Confirm each slot has the correct capacity (e.g., 6 per week)
- [ ] Verify dates appear in the booking form at `/_site/txchristmaslights` (or live domain)

---

## End-to-End Booking Flow Test

### Test with Stripe test card (`4242 4242 4242 4242`, any future date, any CVV)

- [ ] Navigate to `https://tx-christmaslights.com` (or `http://localhost:3000/?__site=txchristmaslights` locally)
- [ ] **Step 1 — Package:** Select a package, verify price shows from Stripe
- [ ] **Step 2 — Details:** Fill in name, email, address
- [ ] **Step 3 — Date:** Select an install date, verify available slots show
- [ ] **Checkout:** Complete payment with test card
- [ ] **Success screen** appears with install date
- [ ] Check Stripe dashboard — payment shows under **Payments**
- [ ] Check admin at `/admin/christmas` — booking appears in jobs list
- [ ] Check that deposit status shows as **paid**

### Edge cases to test

- [ ] Try to book a full date — button should be disabled
- [ ] Try to proceed without selecting a package — error shown
- [ ] Try to proceed with empty name/email/address — validation errors shown
- [ ] Click **Back** buttons and verify state is preserved

---

## Run Automated Tests

```bash
# Install vitest (one time)
pnpm add -D vitest @vitest/coverage-v8

# Run tests
pnpm test

# Run with coverage
pnpm test:coverage
```

Expected output:
- `stripe-webhook.test.ts` — 6 tests, all passing
- `slots-available.test.ts` — 6 tests, all passing

---

## Production Checklist

- [ ] `STRIPE_WEBHOOK_SECRET` set in Vercel environment variables
- [ ] `STRIPE_SECRET_KEY` (live key) set in Vercel
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key) set in Vercel
- [ ] `DATABASE_URL` pointing to production Neon instance
- [ ] Webhook endpoint verified in Stripe dashboard (should show green checkmark after first successful event)
- [ ] Test a real $0.50 transaction end-to-end before launch (Stripe allows small real charges for verification)
- [ ] Verify job appears in `/admin/christmas` after real purchase

---

## Known Limitations / Future Work

- **Installment invoicing** — the two follow-up payments (Aug 1, Oct 1) are not yet automated. They need to be sent manually from Stripe dashboard as invoices, or a cron job needs to be built.
- **Email confirmation** — no confirmation email is sent to the customer after deposit. Resend integration should be added to the webhook handler.
- **Slot capacity syncing** — the booking form reads slot availability at mount time. If a slot fills while the form is open, the customer could still try to book a full slot. A server-side validation step in the checkout session creation would prevent this.
- **Test mode products** — if you switch to test mode, create parallel test products/prices in the test Stripe dashboard since live and test catalogs are separate.
