<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics across the Austin Leads Platform (Texas Christmas Lights & Texas Solar/Roofing sites). The integration covers the full customer journey — from public-facing lead capture and booking flows through to server-side payment confirmation — as well as internal admin actions.

**Files created or modified:**

- `src/lib/posthog-server.ts` _(new)_ — Singleton `posthog-node` client for server-side event capture, using `NEXT_PUBLIC_POSTHOG_KEY` and `POSTHOG_HOST` environment variables.
- `src/app/api/stripe/webhook/route.ts` — Added server-side `deposit_payment_confirmed` event (and exception capture on failure) after a Christmas lights deposit job is successfully created.
- `src/components/auth/SignInForm.jsx` — Added `admin_sign_in_success` / `admin_sign_in_failed` events; calls `posthog.identify()` with the admin's email on successful sign-in.
- `src/components/StripeCheckout.tsx` — Added five booking-funnel events across the three-step Christmas lights scheduling form and the Stripe embedded checkout.
- `src/hooks/usePublishManager.js` — Added `admin_publish_job_created` event after a content publish job is successfully submitted.
- `src/components/HailWeatherLookup.jsx` — Added `hail_damage_lookup` event on both text-search and geolocation lookups.
- `.env.local` — Added `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, and `POSTHOG_HOST`.
- `posthog-node` package installed via pnpm.

---

## Events instrumented

| Event                       | Description                                                       | File                                   |
| --------------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| `booking_package_selected`  | User selects a Christmas lights package and proceeds to step 2    | `src/components/StripeCheckout.tsx`    |
| `booking_info_submitted`    | User submits contact/property info and proceeds to date selection | `src/components/StripeCheckout.tsx`    |
| `booking_date_selected`     | User selects an install window date                               | `src/components/StripeCheckout.tsx`    |
| `booking_checkout_started`  | User proceeds to Stripe embedded checkout                         | `src/components/StripeCheckout.tsx`    |
| `booking_completed`         | Stripe checkout completes client-side                             | `src/components/StripeCheckout.tsx`    |
| `deposit_payment_confirmed` | Server-side: deposit webhook received and job created             | `src/app/api/stripe/webhook/route.ts`  |
| `admin_sign_in_success`     | Admin successfully signed in (+ `posthog.identify`)               | `src/components/auth/SignInForm.jsx`   |
| `admin_sign_in_failed`      | Admin sign-in attempt rejected                                    | `src/components/auth/SignInForm.jsx`   |
| `hail_damage_lookup`        | User looks up hail damage by address or geolocation               | `src/components/HailWeatherLookup.jsx` |
| `admin_publish_job_created` | Admin creates a new content publish job                           | `src/hooks/usePublishManager.js`       |

_Previously existing events (`lead_form_view`, `lead_submit_attempt`, `generate_lead`, `lead_submit_error`, `ui_button_click`) were left intact._

---

## v2 — Christmas-specific events

The original wizard pass tracked Christmas booking _completions_ but not the upstream funnel (impressions, drop-off, hesitation). The dual-project routing fix also exposed that the only "Christmas-flavored" events were `booking_*` — everything else was either solar (`hail_damage_lookup`) or generic (`ui_button_click`). v2 adds:

| Event                             | Fires when                                                                             | File                                |
| --------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------- |
| `booking_step_viewed`             | SchedulingForm mounts (step 1) and on every step transition                            | `src/components/StripeCheckout.tsx` |
| `booking_package_changed`         | User switches packages on step 1 before submitting (signals package-tier comparison)   | `src/components/StripeCheckout.tsx` |
| `booking_step_back`               | User navigates backwards in the 3-step form ("Back to packages" / "Edit details")      | `src/components/StripeCheckout.tsx` |
| `booking_calendar_navigated`      | User pages prev/next, clicks "Today", or jumps months in the slot grid                 | `src/components/StripeCheckout.tsx` |
| `booking_checkout_abandoned`      | User clicks "Edit details" from the Stripe panel (left checkout without paying)        | `src/components/StripeCheckout.tsx` |
| `booking_completed_screen_viewed` | The "You're booked." confirmation renders (distinct from `booking_completed` callback) | `src/components/StripeCheckout.tsx` |
| `contact_link_clicked`            | Global: click on any `<a href="tel:…">`, `mailto:…`, or `sms:…` anchor                 | `src/app/providers.jsx`             |

### `site_slug` super property

`src/app/providers.jsx` now calls `posthog.register({ site_slug })` inside the SDK `loaded` callback, so every captured event auto-includes the active tenant slug. This means:

- Lead form events (`lead_form_view`, `generate_lead`, etc.), `ui_button_click`, and `contact_link_clicked` are now site-attributable in PostHog without each call site repeating the tag.
- Explicit `site_slug` props at call sites (e.g. the `booking_*` events) still win — they override the super property when both are present.

### Suggested PostHog dashboards / insights for v2

1. **Booking step funnel** — funnel on `booking_step_viewed` → `booking_package_selected` → `booking_info_submitted` → `booking_date_selected` → `booking_checkout_started` → `booking_completed`. Per-step drop-off comes from comparing the _viewed_ count to the _submitted_ count at each tier.
2. **Abandonment** — trend on `booking_checkout_abandoned` and `booking_step_back`, broken down by `from_step` / `package_slug`.
3. **Capacity demand** — `booking_calendar_navigated` filtered to `direction = "next"`, broken down by `target_month`. Tells you which months users are scrolling toward when current windows are full.
4. **Contact intent** — `contact_link_clicked` broken down by `link_type` and `page_path`, scoped to the Christmas project. Identifies which pages drive phone-first leads vs. form-first leads.

---

## Next steps

The original wizard-created insights have been retuned for the Christmas project, plus 2 new tiles added. The dashboard URL is unchanged (`/dashboard/1582616`) and existing tile IDs are reused so any links / subscriptions you set up keep working.

### Christmas project — `Analytics basics` dashboard (id `1582616`)

Top-to-bottom on https://us.posthog.com/project/417918/dashboard/1582616:

1. [Christmas Lights Booking Funnel](/insights/zA1WzvkI) — `booking_package_selected → booking_info_submitted → booking_date_selected → booking_checkout_started → booking_completed` (added the missing date step).
2. [Booking Step Impressions Funnel](/insights/PEQDKvlE) — `booking_step_viewed` (step 1) → (step 2) → (step 3) → `booking_completed`. _(Replaced "Lead Form: View to Submit Conversion".)_
3. [Deposits Confirmed (Last 30 Days)](/insights/1Nmpn9Vz) — `deposit_payment_confirmed` BoldNumber. Unchanged.
4. [Booking Abandonment Over Time](/insights/k5CDkmNo) — line chart of `booking_step_back` + `booking_checkout_abandoned`. _(Replaced "New Leads Over Time".)_
5. [Package Selections by Tier](/insights/g7PqolmI) — bar chart of `booking_package_selected` broken down by `package_slug`. _(New.)_
6. [Install Date Demand by Month](/insights/3lfLx2uL) — bar chart of `booking_calendar_navigated` broken down by `target_month`. _(New.)_
7. [Contact Link Clicks (tel / mailto / sms)](/insights/GgoijbAu) — line chart of `contact_link_clicked` broken down by `link_type`. _(Replaced "Hail Damage Lookups Over Time".)_

### Solar project

The solar-flavored wizard events (`hail_damage_lookup`, `lead_form_view`, `generate_lead`) live on the **Texas Solar & Roofing** project (id `345808`) where they were always intended. The existing Solar dashboards (`Website Metrics`, `Website traffic overview`) cover the standard analytics; if you want the wizard-style lead-funnel insights mirrored over there, they can be cloned at any time — `site_slug = "texas-solar-and-roofing-pros"` will be on every event now thanks to the super-property registration.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
