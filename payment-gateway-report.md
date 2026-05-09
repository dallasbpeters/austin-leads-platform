# Payment Gateway Report: Next.js + Sanity CMS
*May 2026 — for Austin Leads Platform*

---

## The Short Answer

There are no truly *free* payment gateways — every option charges a percentage of each transaction. "Free" in this space means **no monthly platform fee**, just a cut per transaction. The standard market rate is **2.9% + $0.30** per online transaction, and most of the major players have settled around that number. The decisions you're really making are about developer experience, features, and whether you want a hosted UI or full control.

For a **Next.js + Sanity** stack specifically, **Stripe** is the overwhelming favorite — it has first-class Next.js examples in its official docs, a clean REST API, and a native Sanity plugin for syncing product data. That said, here's the full landscape organized from simple to fully featured.

---

## Tier 1 — Simple / Trust-Based (No Dev Work, Low Trust Barrier)

### PayPal / Venmo
- **Cost:** 3.49% + $0.49 per transaction (PayPal standard). Venmo is PayPal-owned and routes through the same fee structure for business payments.
- **Integration:** Drop-in JavaScript button. PayPal has a Next.js-compatible SDK (`@paypal/react-paypal-js`). Venmo doesn't have a standalone merchant API — it shows up as a PayPal checkout option.
- **UX:** Familiar to consumers, especially older demographics. Checkout redirects off-site unless you use the advanced card fields. Venmo resonates well with younger, mobile-first customers.
- **Limits:** No real customer payment history tracking. No invoicing. No installment/partial payment support. Hard to build anything custom on top of.
- **Good for:** One-off deposits, low-friction trust-building with a customer who already has PayPal/Venmo.

### Cash App Pay
- **Cost:** No public business API pricing available — Cash App's business integration is limited and not well-documented for web. Mostly POS/in-person.
- **Verdict:** Not viable for a Next.js web integration right now. Worth monitoring but skip it for this build.

---

## Tier 2 — Solid Middle Ground

### Square
- **Cost:** 2.9% + $0.30 per online transaction. No monthly fee.
- **Integration:** `@square/web-payments-sdk` works in Next.js. Less polished than Stripe's DX but solid.
- **UX:** Clean hosted card form. Good for straightforward card payments.
- **Customer tracking:** Square has a Customer API that lets you store cards on file and link multiple payments to a customer profile. Reasonable for tracking multi-payment jobs.
- **Sanity:** No official plugin, but you can wire it up via API routes in Next.js without much friction.
- **Good for:** Teams already in the Square ecosystem (e.g., if you use Square for in-person payments too). Otherwise Stripe is a better developer experience at the same price.

### Snipcart
- **Cost:** 2% transaction fee (on top of your payment processor fee — so you're paying double). $20/month if your store earns less than $500/month.
- **Integration:** Has a **first-party Sanity plugin** (`snipcart-orders`) and example projects in the Sanity exchange. Very low-code path to a working cart.
- **UX:** Pre-built cart UI that drops into any site via a JS snippet. Looks good, minimal config.
- **Limits:** The extra 2% fee stacks on top of Stripe/PayPal fees. For a high-ticket service business (roofing, solar), that 2% on a $15,000 job is $300 just to Snipcart alone.
- **Good for:** Simple product/service catalog with quick checkout. Not ideal when transaction sizes are large.

---

## Tier 3 — Fully Featured

### Stripe ⭐ Recommended
- **Cost:** 2.9% + $0.30 per transaction. No monthly fee. Volume discounts available over ~$80K/month.
- **Integration:** Best-in-class for Next.js. Stripe's official docs include Next.js App Router examples. `@stripe/stripe-js` + `@stripe/react-stripe-js` are well-maintained. Sanity has a community answer thread on Stripe + Sanity product catalog sync.
- **UX options:**
  - *Stripe Checkout* — hosted page, fast to ship, handles all edge cases (mobile, Apple Pay, Google Pay, Link). Best UX with least effort.
  - *Stripe Elements* — embeddable card form inside your own UI. Looks native to your design.
  - *Stripe Payment Links* — shareable URL, no code needed. Useful for quick one-off invoices sent via email or text.
- **Customer + multi-payment tracking:**
  - Stripe has a first-class **Customer object** — attach a payment method once and charge it multiple times.
  - **Payment Intents** handle upfront + partial payment flows.
  - **Invoices API** supports installment-style billing: send Invoice 1 for deposit, Invoice 2 for midpoint, Invoice 3 for completion — all linked to the same Customer record.
  - The **Stripe Dashboard** gives you a clean view of all payments per customer without building anything.
- **Recurring / subscriptions:** Stripe Billing handles this natively if you ever want recurring service plans.
- **Sanity fit:** Use Next.js API routes as your backend for Stripe webhooks. Store job/payment status back in Sanity via the Sanity client. Clean separation of concerns.
- **Good for:** Everything from a simple "pay deposit now" button to a full multi-payment job tracking workflow.

### Paddle / Lemon Squeezy
- **Cost:** Both are **5% + $0.50 per transaction** — significantly more expensive.
- **What they add:** They act as the **Merchant of Record**, meaning they handle sales tax, VAT, and global compliance on your behalf. This is valuable for SaaS or digital products sold internationally.
- **Verdict:** Not the right fit here. The higher fees aren't justified for a local service business. You're not selling software licenses globally.

### Braintree (by PayPal)
- **Cost:** 2.59% + $0.49 per transaction.
- **Integration:** Full-featured API, supports vaulted cards, multi-payment flows. Owned by PayPal but developer-oriented.
- **Verdict:** It's good, but Stripe has better DX, better Next.js resources, and a more active ecosystem. Braintree made more sense 5 years ago when it was cheaper.

---

## Summary Comparison

| Gateway | Monthly Fee | Per-Transaction | Next.js DX | Multi-Payment Support | Sanity Integration |
|---|---|---|---|---|---|
| **Stripe** | $0 | 2.9% + $0.30 | ⭐⭐⭐⭐⭐ | Yes (Invoices + Customers API) | Via API routes (easy) |
| **Square** | $0 | 2.9% + $0.30 | ⭐⭐⭐ | Yes (Customer API) | Manual |
| **PayPal/Venmo** | $0 | 3.49% + $0.49 | ⭐⭐ | Limited | Drop-in button |
| **Snipcart** | $0 (>$500/mo) | 2% extra + processor | ⭐⭐⭐⭐ | No | Native plugin ✅ |
| **Paddle** | $0 | 5% + $0.50 | ⭐⭐⭐ | Yes | Manual |
| **Braintree** | $0 | 2.59% + $0.49 | ⭐⭐⭐ | Yes | Manual |

---

## Recommended Architecture for This Stack

For upfront deposits + multiple milestone payments per job (which fits the solar/roofing context):

1. **Stripe as the payment processor** — create a `Customer` record per job lead, use `PaymentIntents` for the deposit, and `Invoices` for milestone payments.
2. **Sanity as the source of truth for job data** — store `stripeCustomerId` on the lead/job document so you can query payment history from Stripe using the customer ID.
3. **Next.js API routes for the Stripe webhook** — listen for `payment_intent.succeeded` and `invoice.paid` events to update job status in Sanity automatically.
4. **Stripe Payment Links or Stripe Checkout** for the customer-facing payment pages — no need to build a custom form unless your design requires it.

This setup is well-documented, has zero monthly platform cost, and scales cleanly as the business grows.

---

*Sources: NerdWallet, OneNine, crystallize.com, Sanity Exchange, Stripe Docs*
