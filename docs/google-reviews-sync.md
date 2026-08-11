# Google Reviews Sync

Pulls reviews from a Google Business Profile into Sanity `review` documents, so the
testimonials sections render real Google reviews without anyone retyping them.

The code is written and verified. Everything below is blocked on one thing: **Google
must grant your Cloud project Business Profile API quota.** Until then the sync
endpoint answers with the reason it did nothing rather than failing.

---

## Why Business Profile and not Places

The Places API is easier to get — an API key and you are done — and it is the wrong
tool. Two reasons, either one disqualifying:

- **You may not store it.** Places API content must not be pre-fetched, cached, or
  stored. Only `place_id` is exempt (indefinitely) and coordinates (30 days). Writing
  Places reviews into Sanity `review` documents would breach the Maps Platform terms.
- **It returns about five reviews**, chosen by Google, with mandatory attribution.

Business Profile returns **your own** reviews from **your own** verified profile, all of
them, and you own the data — so persisting them is fine. It is also free: no per-call
billing once approved.

If you ever want Google reviews on the site without waiting for approval, the
sanctioned route is the **Places UI Kit** — a Google-rendered component with
attribution built in. It bills per page load and cannot be restyled into our card, so
it belongs beside our testimonials, not instead of them.

---

## Step 1 — Apply for API access (the long pole)

New Cloud projects start at **zero quota** for the Business Profile APIs. Enabling the
APIs is not the same as being granted quota.

1. Note your **Project Number** — https://console.cloud.google.com/home/dashboard
2. Submit the access request — https://support.google.com/business/contact/api_default
   - choose **"Application for Basic API Access"**
   - submit from an email that is an **owner or manager** on the Business Profile
3. Wait. Google reviews manually, usually within 14 days. Thin applications get
   rejected, so describe the actual use case: syncing our own reviews to our own site.

**You are approved when** the quota reads **300 QPM** —
https://console.cloud.google.com/iam-admin/quotas (search "Business Profile").

Prerequisites Google checks: a verified profile active 60+ days, and a real website.

---

## Step 2 — Enable three APIs

Reviews are split across services, which is why a location id alone is not enough to
start:

| API                                                                                                                            | What it gives you          |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| [My Business Account Management](https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com)     | your account ids           |
| [My Business Business Information](https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com) | locations under an account |
| [Google My Business (legacy v4)](https://console.cloud.google.com/apis/library/mybusiness.googleapis.com)                      | the reviews themselves     |

Only v4 serves reviews. It is the legacy endpoint and has no v1 replacement. That link
may 404 until you are approved.

---

## Step 3 — OAuth credentials

An **API key will not work.** Reviews are private per-account data, so Google rejects
keys outright:

> API keys are not supported by this API. Expected OAuth2 access token or other
> authentication credentials that assert a principal.

1. Create an **OAuth client ID** (type: Web application) —
   https://console.cloud.google.com/apis/credentials
2. Add the scope `https://www.googleapis.com/auth/business.manage` to the consent
   screen. The playground will not issue a token without it.
3. Get a refresh token — https://developers.google.com/oauthplayground/
   - gear icon → **Use your own OAuth credentials**, paste the client id and secret
   - authorise with the scope above, **signed in as an owner of the profile**
   - exchange the code and copy the **refresh token**

Never commit the `client_secret_*.json` download. `.gitignore` covers
`client_secret*.json` and `*.apps.googleusercontent.com.json`; put the values in
`.env.local` and delete the file.

---

## Step 4 — Environment variables

```bash
GOOGLE_BUSINESS_CLIENT_ID="…apps.googleusercontent.com"
GOOGLE_BUSINESS_CLIENT_SECRET="GOCSPX-…"
GOOGLE_BUSINESS_REFRESH_TOKEN="1//…"
```

`.env.local` is read at boot, so **restart the dev server** after adding them.

Add the same three to Vercel for **Production, Preview, and Development**. The
Development scope matters: `vercel env pull` reads it, so a variable missing there gets
silently dropped from `.env.local` on the next pull. That is how the Sanity tokens went
missing once already.

Google refresh tokens do not rotate, so there is no database table here — unlike the
Jobber integration, which stores tokens in Postgres because Jobber rotates them.

---

## Step 5 — Find the account and location ids

```bash
curl http://localhost:3000/api/google-reviews/sync
```

Before approval this answers with what is missing:

```json
{ "ready": false, "reason": "Missing GOOGLE_BUSINESS_REFRESH_TOKEN. …" }
```

Once approved it returns your accounts and locations. Copy the digits from
`accounts/123456789` and `locations/987654321`.

---

## Step 6 — Tell each site which profile it uses

In Studio: **Site settings → <site> → Google Business Profile**

- **Account id** — the digits from `accounts/…`, the same for every location you own
- **Location id** — the digits from `locations/…`, different per storefront

A site missing either id is **skipped**, not guessed at. With two tenants in this
dataset that is deliberate: filing one tenant's reviews under the other is worse than
syncing nothing.

---

## Step 7 — Run it

```bash
curl -X POST http://localhost:3000/api/google-reviews/sync
```

```json
{
  "ok": true,
  "sites": [
    {
      "site": "texas-solar-and-roofing-pros",
      "created": 12,
      "updated": 1,
      "unchanged": 30,
      "skipped": 4,
      "error": null
    }
  ]
}
```

- `skipped` — star-only ratings with no comment (they would render an empty card), and
  any review whose Sanity document was hand-written
- `unchanged` — Google's `updateTime` matches what was last synced

---

## Scheduling in production

Set `CRON_SECRET` in Vercel and add a cron pointing at the route. Vercel sends
`Authorization: Bearer $CRON_SECRET` automatically.

```json
{
  "crons": [{ "path": "/api/google-reviews/sync", "schedule": "0 7 * * *" }]
}
```

The route requires the secret in production and is open in development so it stays
testable locally. Daily is plenty — reviews arrive slowly and quota is 300 QPM.

---

## How the sync avoids damage

Two rules, both learned from bugs in this dataset:

- **Deterministic ids.** Each document is `review-google-<googleReviewId>`, so a re-run
  patches the same document. Generated ids would pile up duplicates — which is exactly
  what put two identical cards on the homepage and tripped React's duplicate-key
  warning.
- **Hand-written reviews are never touched.** Only documents with `source: "google"`
  get patched. It uses `createIfNotExists` + `patch`, not `createOrReplace`, so fields
  the sync does not own — such as a `reviewerPhoto` an editor uploaded — survive.

Fields the sync owns: `author`, `stars`, `body`, `site`, `source`, `sourceId`,
`sourceUpdatedAt`. Everything else on a `review` belongs to the editor.

`source` is visible and read-only in Studio, so an editor can tell a synced review from
one they typed. Reviews synced from Google should be corrected **in Google**, since the
next sync overwrites them.

---

## Troubleshooting

| Symptom                                                | Cause                                                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `API keys are not supported by this API`               | You passed an API key. Business Profile needs OAuth.                                                               |
| `403` mentioning quota / blocked / disabled            | Project has not been granted quota yet. Should read 300 QPM.                                                       |
| `invalid_grant` on token refresh                       | Refresh token revoked, or issued for a different client id than configured.                                        |
| `404` on the reviews call                              | Mixed id prefixes. The v4 path needs `accounts/{account}/locations/{location}` — bare digits, not `locations/123`. |
| `"reason": "No site document has a … location id yet"` | Step 6 is not done.                                                                                                |
| Reviews appear but on the wrong tenant                 | Wrong `locationId` on a `site` document.                                                                           |

---

## Files

| Path                                         | Role                                      |
| -------------------------------------------- | ----------------------------------------- |
| `src/lib/googleBusiness/auth.js`             | OAuth refresh → access token, cached      |
| `src/lib/googleBusiness/reviews.js`          | accounts → locations → reviews, paginated |
| `src/lib/googleBusiness/syncReviews.js`      | idempotent upsert into Sanity             |
| `src/app/api/google-reviews/sync/route.js`   | `GET` discovery, `POST` sync              |
| `site.googleBusiness`                        | per-tenant account + location ids         |
| `review.source / sourceId / sourceUpdatedAt` | provenance                                |

---

## What this does not solve

Getting reviews **to** Google in the first place. Jobber's API has no reviews entity —
its documented objects are clients, accounts, assessments, properties, quotes, jobs,
invoices, requests, custom fields, users, notes and tags. Jobber's role is _requesting_
reviews and routing customers to Google. Google stores them; this sync reads them.
