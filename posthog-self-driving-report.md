# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for this web project. Session Replay, Error Tracking, and Support are enabled; native health, error-tracking, and support responders are enabled; and Replay Vision monitors feed corroborated on-screen defects into the inbox.

New scout configurations and Replay Vision scanners begin operating on the next coordinator sweep. Findings should begin appearing in the [Self-driving inbox](https://us.posthog.com/project/345808/inbox) within about 30 minutes.

## AI data processing

Approved. Organization-level AI data-processing approval was confirmed by the setup flow.

## GitHub

Connected before this setup through the PostHog GitHub App. No GitHub Issues responder was enabled because no external tools were selected in this run.

## Products enabled

| Product                 | Result          | Notes                                                                                                                     |
| ----------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Session Replay          | Already enabled | The repository uses `posthog-js`; its initialization does not disable session recording. Recent recordings were verified. |
| Error Tracking          | Enabled         | The repository's `posthog.init` explicitly enables exception capture.                                                     |
| Support (Conversations) | Enabled         | Connect an inbound email, inbox, or Slack channel in PostHog before support tickets can arrive.                           |

## Signal sources

| Signal source                          | Action                      | Notes                                                                                                  |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `signals_scout` / `cross_source_issue` | On by default               | No opt-out row existed, so no row was created.                                                         |
| `health_checks` / `health_issue`       | Enabled                     | Config ID: `01a0eba6-3c5b-78c7-b015-960caa0c7563`.                                                     |
| `error_tracking` / `issue_created`     | Enabled                     | Config ID: `01a0eba6-39e2-7ed4-9188-3ad466f41dbd`.                                                     |
| `error_tracking` / `issue_reopened`    | Enabled                     | Config ID: `01a0eba6-3a0a-7068-9011-a64883397cde`.                                                     |
| `error_tracking` / `issue_spiking`     | Enabled                     | Config ID: `01a0eba6-399d-7ca7-ba96-cd4948836a7f`.                                                     |
| `conversations` / `ticket`             | Enabled                     | Config ID: `01a0eba6-3c73-7535-8804-1b603cab6278`; idle until an inbound Support channel is connected. |
| Replay Vision                          | Configured through scanners | No `replay_vision` source row is needed; each scanner's `emits_signals: true` is its authorization.    |
| External-tool responders               | Skipped                     | No external tools were selected.                                                                       |

## Connected tools

The connected-tools selection was **None of these**. Therefore GitHub Issues, Linear, Jira, Sentry, Zendesk, and all additional catalog tools are **not used** in this setup; no warehouse source or responder was created for them.

## Scout troop

The verified run allowance is **100 runs/day**, with **0 runs used** and **100 remaining** at setup time. The project banner says: _“Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”_

### Enabled scouts (8)

| Scout                               | Why it is enabled                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| General                             | Cross-product correlations and surfaces without a dedicated specialist.                                 |
| Product analytics                   | Core funnels and product-flow regressions.                                                              |
| Web analytics                       | Acquisition traffic, attribution, landing-page health, and 404 trends.                                  |
| Revenue analytics                   | Payment and revenue-data health; the repository includes Stripe flows and confirmation instrumentation. |
| Anomaly detection                   | Breaks from the baseline in saved dashboards and insights.                                              |
| Observability gaps                  | High-value events that lack monitoring coverage.                                                        |
| Lead-capture health (custom)        | Lead-form entry, submission completion, and failure health.                                             |
| Booking-to-payment handoff (custom) | Checkout-to-confirmed-deposit reconciliation and handoff failures.                                      |

### Disabled built-in scouts (21)

| Scout              | Reason                                                                         |
| ------------------ | ------------------------------------------------------------------------------ |
| AI observability   | No verified project-side AI observability signal.                              |
| APM                | No confirmed PostHog APM surface.                                              |
| Conversations      | Support is enabled but no inbound channel or ticket activity is connected yet. |
| CSP violations     | No configured PostHog CSP reporting evidence.                                  |
| Customer analytics | No verified account/group analytics surface.                                   |
| Data pipelines     | No verified CDP, batch export, or Hog flow surface.                            |
| Data warehouse     | No connected warehouse source selected in this run.                            |
| Error tracking     | Covered by the enabled native Error Tracking responder.                        |
| Experiments        | No active experiment evidence.                                                 |
| Feature flags      | No active feature-flag evidence.                                               |
| Inbox validation   | Deferred until there are resolved Self-driving reports to validate.            |
| Insight alerts     | No verified alert surface.                                                     |
| Logs               | No verified PostHog Logs product usage.                                        |
| MCP tool calls     | Not a product surface for this application.                                    |
| PR follow-up       | No need established for merged-PR monitoring.                                  |
| Replay vision      | Deferred until aggregate scanner observations exist.                           |
| Session replay     | Covered by the Replay Vision scanners below.                                   |
| Skills store       | Not part of the product's monitoring scope.                                    |
| Surveys            | No surveys were found.                                                         |
| Tasks              | No verified PostHog Tasks usage.                                               |
| Web vitals         | Not selected among the most-used verified surfaces.                            |

## Custom scouts

| Scout                                   | What it watches                                                           | Discriminator                                                                                                                                  | Why it adds coverage                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `signals-scout-lead-capture-health`     | Lead-form reach, attempts, generated leads, and submit failures.          | Separates a conversion-rate regression from a collapse in lead-form entry volume; reports sustained broad-reach drops or error-rate increases. | The product-analytics scout can catch derived-rate changes, but this adds explicit lead-entry and submission-health coverage. |
| `signals-scout-booking-payment-handoff` | Checkout starts, booking completions, and confirmed deposit/job creation. | Compares settled booking completion volume with confirmed deposits after normal webhook delay.                                                 | Built-in revenue monitoring is broader; this is a domain-specific reconciliation check for the booking/payment handoff.       |

The approved custom scouts were registered with active, emitting daily configurations. If either becomes noisy, set `emit: false` on its scout configuration in PostHog to make it dry-run without removing it.

Surfaces considered but not added: error tracking and session replay are already covered by their native responder and Replay Vision route; surveys, experiments, feature flags, CSP, account analytics, and data pipelines lack verified usage.

## Replay Vision scanners

A Replay Vision scanner is an LLM that watches individual session recordings on a schedule and pushes credible findings to the inbox. These are the only configuration in this setup that spends Replay Vision quota. A finding arrives at half weight, so independent corroboration is required before it is promoted to an inbox report.

The organization had **7,490 credits remaining** when sizing ran. Both monitors are a small fraction of that budget.

| Monitor                  | Status  | What it watches                                                                                                                                                                                         | Query scope                                                                                                            | Sampling | Estimate                                                                      |
| ------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| Hail map breakage        | Created | Visible breakage while visitors look up local hail activity and move toward a roof-review request: failed location search, missing map/storm evidence, unresponsive actions, and missing confirmations. | Recordings whose current URL contains `/hail-map`; this is the application's interactive hail-map-to-roof-review flow. | 0.5      | 0 observations/month and 0 credits/month from the recent seven-day estimate.  |
| Lead journey frustration | Created | Visible struggle in the hail lookup and lead journey, including rage-clicking controls, repeat searches, and retrying a lead form.                                                                      | `$rageclick` only, with no URL filter.                                                                                 | 1.0      | 4 observations/month and 20 credits/month from the recent seven-day estimate. |

Both monitors emit Self-driving findings and are enabled. The project already has recordings; new observations appear as matching recordings complete. Use each scanner's Calibration tab to rate early observations thumbs up or down and review the resulting configuration recommendations.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so the enabled Conversations responder can receive tickets.
- [ ] Review the first Replay Vision observations and rate useful or unhelpful results to calibrate the two monitors.
- [ ] Revisit disabled scouts if the project adopts their related product surfaces (for example, Web Vitals, feature flags, surveys, or PostHog Logs).
- [ ] The PostHog MCP connection lacks event-schema read scopes, so the approved custom scouts were grounded in the repository's existing setup report and will verify event availability at run time before querying.

## What happens next

Fresh scout configurations are picked up by the coordinator within roughly 30 minutes and draw from the verified 100-run daily limit. Self-driving clusters related findings into reports in the inbox; immediately actionable reports can start coding tasks.

## Repository files

Created by this setup:

- `posthog-self-driving-report.md` — this setup report.

No application source files or environment files were modified.
