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

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1582616)
- [Christmas Lights Booking Funnel](/insights/zA1WzvkI) — conversion funnel across all 4 booking steps
- [Lead Form: View to Submit Conversion](/insights/PEQDKvlE) — funnel from form impression to submitted lead
- [New Leads Over Time](/insights/k5CDkmNo) — daily lead submissions trend
- [Deposits Confirmed (Last 30 Days)](/insights/1Nmpn9Vz) — bold-number count of server-confirmed payments
- [Hail Damage Lookups Over Time](/insights/GgoijbAu) — daily hail lookup activity

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
