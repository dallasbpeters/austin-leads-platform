# Jobber vs QuoteIQ

**A plain-English comparison of two service-management platforms** — cost, connections, phone apps in the field, and what switching would take

Prepared September 2026 · Business Software Analyst
Team size modeled: 6–15 users · Currency: USD

---

## 1. The short version

The company already uses Jobber. Over the past year a custom website and lead system was built that talks to Jobber automatically — quotes and invoices flow between the two without anyone retyping them. That connection is the single most important fact in this comparison.

QuoteIQ is a newer, cheaper program with a lot of built-in tools. On paper it looks like a good deal, and at a ten-person team it genuinely costs less per year. But QuoteIQ does not have the kind of connection that the custom system depends on. QuoteIQ can send information _out_. It cannot let an outside program write information back _in_. That is not a small gap — it is the whole reason the current setup works.

On top of that, QuoteIQ charges about **1% more** every time a customer pays by card. For a business running a few hundred thousand dollars through cards each year, that extra 1% quietly costs more than the software savings.

There is a third thing, and it turned out to be the biggest. The team shares Jobber logins to hold down per-user costs, and the crew says the Jobber phone app is bad enough that they won't use it. Those two facts are almost certainly connected — several people signed into one account on several phones produces exactly the symptoms the crew describes. And QuoteIQ's app is not rated better: 4.7 against Jobber's 4.8 on iPhone, and a dead tie at 4.4 on Android.

### Recommendation

> **Buy the crew real logins before deciding anything else.**
>
> Nine additional Jobber seats cost about $261 a month. That one change tests whether the app is actually the problem, restores the audit trail, makes time tracking mean something, and ends a terms-of-service violation — for roughly a third of one percent of what a migration would cost. Run it for 30 days and ask the crew again.
>
> If the complaints stop, the app was never the issue. If they continue, the company has a tested reason to switch and clean per-user data to bring along.
>
> **Either way, don't move to QuoteIQ yet.** It cannot accept written data from outside software, so the automation already built here has nowhere to land. Revisit in 12 months — if QuoteIQ ships a real read-and-write API, this report needs rewriting in their favor.

|                                 |                                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| **Cost of the seat experiment** | $261/mo — nine extra Jobber seats. Reversible, and it fixes compliance regardless of outcome. |
| **Phone app ratings**           | 4.8 vs 4.7 — Jobber edges QuoteIQ on iPhone, on 6× more ratings. Tied at 4.4 on Android.      |
| **Extra card fees at QuoteIQ**  | +1.0% — on $250,000 of card payments that is $2,500/yr, more than the license saving          |
| **Custom code tied to Jobber**  | ~840 lines across 11 files; about half has no QuoteIQ equivalent                              |

---

## 2. Cost

Both companies sell "plans." A plan is a bundle: a base price, plus a number of people allowed to log in. The two companies count people differently, and that difference drives almost everything.

- **Jobber charges per person.** You pay a base price for the plan, then $29 a month for every extra person who logs in. More people, bigger bill, forever.
- **QuoteIQ charges a flat fee.** Each plan includes a set number of people. Adding a person costs nothing until you outgrow the plan, and then you jump to the next one.

That means neither one is simply "cheaper." Which is cheaper depends entirely on how many people log in.

### Chart 1 — Yearly license cost at three team sizes

Prepaid annual pricing, before card-processing fees and add-ons. QuoteIQ uses the cheapest plan that fits that team: Elite at 6 and 10 users, Max at 15.

| Team size | Jobber Connect | Jobber Grow |              QuoteIQ |
| --------- | -------------: | ----------: | -------------------: |
| 6 users   |         $2,928 |      $3,528 |     $2,990 _(Elite)_ |
| 10 users  |         $4,320 |      $4,920 | **$2,990** _(Elite)_ |
| 15 users  |         $6,060 |      $6,660 |       $6,990 _(Max)_ |

```
Yearly license cost                          ($ thousands)
                 0     2     4     6     8
6 users   JC  ████████████████▌            2,928
          JG  ███████████████████▊         3,528
          QIQ ████████████████▊            2,990

10 users  JC  ████████████████████████▎    4,320
          JG  ███████████████████████████▋ 4,920
          QIQ ████████████████▊            2,990

15 users  JC  ██████████████████████████████████▏      6,060
          JG  █████████████████████████████████████▌   6,660
          QIQ ███████████████████████████████████████▏ 6,990

JC = Jobber Connect · JG = Jobber Grow · QIQ = QuoteIQ
```

_Jobber figures are the published annual-prepaid base price plus $29/month for each user past the first. Jobber's help pages list per-plan user caps (Connect "up to 5 users") that appear to conflict with the pricing page's "add users for $29/mo each" — confirm the cap with a Jobber rep before budgeting Connect for a team of six or more._

**How I got to these numbers**

1. Started from each vendor's own published pricing page, not a review site, because comparison blogs frequently quote stale prices and several of the top results are written by one of the two vendors about the other.
2. Used **annual prepaid** pricing for both, since that is the cheapest honest price each one offers and comparing a monthly rate to an annual one would flatter whichever is annual.
3. For Jobber, applied the stated formula: base plan (1 user) + $29/month per extra user. Ten users on Grow is $149 + 9 × $29 = $410/month = $4,920/year.
4. For QuoteIQ, picked the cheapest plan whose included seat count actually covers the team. Six users does not fit in Pro's four seats, so a six-person team pays the same $2,990 as a ten-person team.
5. Left add-ons out of the chart deliberately and put them in the table below, because add-ons are optional and burying them in the chart would make one product look worse than it is.

### The fees that don't appear on the pricing page

Both companies make money a second way: a cut of every card payment your customers make. This is where the real difference shows up, and it is easy to miss because it is not a line on your monthly bill.

**Table 1 — Fees beyond the license**

| Fee                     | Jobber                                | QuoteIQ                                         | Who it hits                         |
| ----------------------- | ------------------------------------- | ----------------------------------------------- | ----------------------------------- |
| Card payment            | 2.9% + 30¢                            | **3.9% + 30¢**                                  | You, on every job paid by card      |
| Tap to pay in person    | 2.7% + 30¢                            | Not published                                   | You, on field payments              |
| Bank transfer (ACH)     | 1%                                    | Not published                                   | You, on large invoices              |
| Instant payout          | 1%                                    | Not published                                   | You, only if you rush a payout      |
| AI usage credits        | Not metered                           | $25 / 2,500 credits                             | You, if you run out mid-month       |
| AI receptionist         | $29/mo add-on                         | Included, but burns 125 credits per call minute | You, either way                     |
| Marketing suite         | $99/mo add-on                         | Included                                        | Jobber customers who want campaigns |
| Website builder         | Not offered                           | $34.99/mo add-on                                | QuoteIQ customers below Max         |
| QuickBooks subscription | $30–$200/mo to Intuit — same for both |                                                 | Anyone syncing accounting           |

The card fee is the one to watch. QuoteIQ's payment terms add a **1% convenience fee** on top of the standard Stripe rate. Run the numbers on real volume:

| Card volume per year | Extra cost on QuoteIQ |
| -------------------- | --------------------: |
| $100,000             |               +$1,000 |
| $500,000             |               +$5,000 |
| $1,000,000           |              +$10,000 |

Roofing and solar jobs are big-ticket, and a lot of them get paid by card or financing. Before choosing on price, pull last year's card volume and multiply by 1%. That single number likely settles the cost question on its own.

**One caveat before moving on.** Every figure above prices a setup where each person has their own login. The company does not currently run that way — it shares one Core seat, at roughly $348 a year. The next section explains why that matters far more than it first appears.

---

## 3. The crew problem — shared logins and the app nobody wants to use

Two facts came up late, and together they may matter more than anything else in this report: the team shares Jobber logins to avoid per-user charges, and the crew says the Jobber phone app is bad enough that they refuse to use it.

Both are real problems. But the evidence suggests they are **the same problem**, and that switching platforms would not fix either one.

### First: the shared logins

Jobber's terms of service are direct about this. Section 20 states that **"User accounts are intended for one user only and are not to be shared by multiple users."** This is not a gray area or an unenforced technicality — Jobber sends "unusual login" alerts precisely because one account appearing from several places looks like a breach.

Sharing logins costs the company four things:

- **The audit trail.** Every quote, every price change, every deleted job is stamped with the same name. If a number gets changed, nobody can tell who changed it.
- **Per-person tracking.** Time clocks, GPS, and job assignment all key off the user. With one login shared six ways, none of it means anything.
- **Security.** When someone leaves, the password has to change for everyone. In practice it usually doesn't.
- **The account itself.** A vendor that decides an account is being shared can suspend it. That is a small risk, but the downside is the whole business stopping.

It also means the cost chart in the last section describes a bill the company is not currently paying. On Core with one shared seat, the real spend is **about $348 a year**. Every comparison in this report is between two _compliant_ setups. That is the honest comparison, but it is worth naming the gap: going legitimate is an increase no matter which vendor wins.

### Second: the app the crew won't use

I went to the app stores rather than taking either side's word for it. The result is not what you would expect from "the app is terrible."

#### Chart 2 — What real users rate each phone app

| Store           | App        | Rating  | Sample                         |
| --------------- | ---------- | :-----: | ------------------------------ |
| Apple App Store | **Jobber** | **4.8** | 21,000 ratings                 |
| Apple App Store | QuoteIQ    |   4.7   | 3,300 ratings                  |
| Google Play     | **Jobber** |   4.4   | 6,720 reviews · 1M+ downloads  |
| Google Play     | QuoteIQ    |   4.4   | 1,190 reviews · 10K+ downloads |

```
Star rating (full 0–5 scale — note how close these sit)

           0     1     2     3     4     5
iPhone
  Jobber   ├─────────────────────────●     4.8
  QuoteIQ  ├────────────────────────●      4.7

Android
  Jobber   ├───────────────────────●       4.4
  QuoteIQ  ├───────────────────────●       4.4
```

Jobber's iPhone app rates slightly _higher_ than QuoteIQ's, on more than six times as many ratings. On Android the two are tied at 4.4.

_Treat QuoteIQ's scores with mild caution: the app is two years old, its founders have roughly 1.3 million combined YouTube subscribers, and the product ships a built-in review-request tool — so the sample is unusually well-solicited rather than neutral._

Ratings alone do not settle it, so I read the complaints. They cluster differently, and that is the interesting part.

**Table 2 — What people actually complain about**

| Jobber app complaints                                                                                                                               | QuoteIQ app complaints                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| "I have to close the app and open back up multiple times a day because I keep going _offline_."                                                     | "I have issues where it will load with my logo constantly and for long periods of time."         |
| The app "will tell you it's clocked you in when it has not" — called "not a very reliable application for something as important as tracking time." | "I can't deal with the slow lag."                                                                |
| "Our technician's schedules are not updating live as I'm updating their schedules, and it is causing critical notes to be missed."                  | "It deleted my inspection the last time it updated."                                             |
| "It ends up deleting all your work done so far" on unfinished invoices.                                                                             | "It's buggy at times but, after swiping out and going back into the app, it works as it should." |

Neither app is clean. Both have data-loss reports. But look at what the Jobber complaints have in common: **repeatedly dropping offline, clock-ins that don't stick, and schedules that don't update live.** Those are session symptoms. They are what happens when one account is signed in on several phones at once and each device keeps invalidating the others.

> ### The most important finding in this report
>
> **The crew's complaint is probably real — and probably caused by the shared login, not by Jobber.**
>
> Six people on one account means six phones fighting over one session. That produces exactly the symptoms described: getting kicked offline, time clocks that silently fail, schedule changes that never arrive. A crew living with that would reasonably conclude the app is broken.
>
> This is a hypothesis, not a proven fact — but it is cheap to test, and the test costs less than one day of the migration it might prevent.

### The $261 experiment

Before spending 45 to 75 hours rebuilding software, run this:

1. **Give every crew member their own Jobber login for one month.** Ten users on Core is $29 each — about $261/month for the nine additional seats.
2. **Change the shared password** so the old habit can't continue quietly.
3. **Ask the crew again after 30 days.** Same question, same people.

If the complaints stop, the app was never the problem and the company just fixed its audit trail, its time tracking, and its terms-of-service exposure for the price of a decent tool. If the complaints continue, the company has something far more valuable than an opinion: a real, tested reason to switch, and clean per-user data to hand the next vendor.

**How I reasoned through this**

1. Took the crew's complaint seriously rather than dismissing it. Field staff refusing to use software is a genuine operational failure, whatever the cause, and Jobber's Android reviews do contain real reports of offline and clock-in problems.
2. Checked whether QuoteIQ is actually better before assuming it. It is not, on the numbers: 4.7 vs 4.8 on iPhone, tied at 4.4 on Android. That alone removes "the app is better over there" as a reason to move.
3. Looked for a cause that explains the pattern. The Jobber complaints are concentrated in session and sync behavior, which is what multi-device account sharing produces. The match is close enough to test.
4. Compared the two experiments by cost. Proper seats for a month is roughly $261 and reversible. A migration is 45–75 hours and is not. When a cheap test can eliminate the expensive option, run the cheap test first.
5. Noted what happens if I'm wrong: the company still ends up compliant, with a real audit trail and per-person time data. There is no version of this experiment that wastes the money.

---

## 4. Connections — can other software talk to it?

An **API** is a doorway that lets one program talk to another without a person in the middle. There are two directions, and they matter separately:

- **Reading and writing (a two-way door).** An outside program can look up a customer, create an invoice, or update a job. This is what lets a custom website file paperwork into the system by itself.
- **Webhooks (a one-way door, outward).** The system pings an outside program when something happens — "a quote was just created." Useful for notifications, but it cannot put anything _into_ the system.

Jobber has both doors. QuoteIQ has only the outward one.

### Chart 3 — API comparison

| Capability            | Jobber                                                                                    | QuoteIQ                                                               |
| --------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Read & write API**  | ✅ Full GraphQL API covering clients, quotes, jobs, invoices, payments                    | ❌ No published read/write API of any kind                            |
| **Outbound webhooks** | ✅ Client, quote, invoice, payment, and app-connection events                             | ⚠️ Six events only: estimate and schedule created / updated / deleted |
| **Inbound data**      | ✅ Anything the API exposes can be created or edited                                      | ⚠️ A contact-forms endpoint can create leads. Nothing else.           |
| **Sign-in security**  | OAuth 2.0, rotating refresh tokens, signed webhooks (HMAC-SHA256)                         | Not documented publicly                                               |
| **Version control**   | Dated API versions via request header, so updates can't silently break your code          | Not documented publicly                                               |
| **Rate limits**       | Published cost-based limits, returned on every response so your code can slow itself down | Not documented publicly                                               |
| **Developer docs**    | ✅ Full site with schema explorer and sample apps                                         | ⚠️ One support page. No payload samples, no error reference.          |
| **Plan needed**       | Any plan. Private apps may connect to up to 5 paying accounts before Jobber review.       | Elite ($299/mo) or Max ($699/mo)                                      |
| **Known API gaps**    | Invoice line items can't be edited after creation; payments can't be recorded via API     | Everything except the six webhook events and contact forms            |

**How I judged this**

1. Went to each vendor's developer documentation rather than their marketing pages, since "we have an API" is a marketing claim and a schema explorer is proof.
2. Confirmed Jobber's capabilities against working code in this project, not just docs. The integration here successfully creates clients and invoices, refreshes tokens, and verifies signed webhooks — so the API demonstrably does what the docs say.
3. Noted Jobber's real limits honestly. A comment in this project's own sync code records that several assumed mutations don't exist: invoice line items can't be edited after creation, and deposits can't be recorded. That is a genuine Jobber weakness discovered the hard way.
4. For QuoteIQ, read the one help-center article describing the "Outbound API." It lists six events and no authentication details. I looked for an inbound API and found only a contact-forms endpoint.
5. Marked everything else "not documented publicly" rather than "doesn't exist." QuoteIQ may have more behind a sales conversation — but a capability you can't read about is one you can't plan around.

---

## 5. Switching cost — what moving to QuoteIQ would actually take

This is the part a generic comparison would miss. The company is not evaluating two products from scratch — it already runs a custom website and lead platform wired into Jobber. Switching means rewiring it.

Counted from the codebase:

- **11 Jobber-specific files**, plus references in roughly eight more components and pages
- **~840 lines** of integration code — sign-in, syncing, webhooks, database, embedded forms
- **9 live webhook topics** — client, quote, invoice, payment, and connection events

**Table 3 — Piece by piece: what moves, what breaks**

| What it does today                                                   |      Size | QuoteIQ equivalent                                          | Verdict            |
| -------------------------------------------------------------------- | --------: | ----------------------------------------------------------- | ------------------ |
| Secure sign-in to the vendor (OAuth 2.0, auto-renewing tokens)       | 106 lines | None published                                              | 🔴 No path         |
| API client with automatic rate-limit backoff                         |  67 lines | None — there is no API to call                              | 🔴 No path         |
| Pushes finished invoices and customers into the vendor automatically | 242 lines | None — QuoteIQ cannot accept written data                   | 🔴 No path         |
| Receives and verifies vendor event notifications                     |  78 lines | Six events vs the nine in use; no invoice or payment events | 🟠 Partial rebuild |
| Database tables storing the connection and event log                 | 153 lines | Schema would need redesign around a thinner event set       | 🟠 Rebuild         |
| Embedded booking forms on the public site (3 forms, ~8 placements)   | 161 lines | Custom contact forms plus the contact-forms endpoint        | 🟢 Rebuildable     |
| Historical customer, quote, and invoice records                      |         — | CSV export from Jobber, "AI Smart Import" into QuoteIQ      | 🟢 Migratable      |

Read that table top to bottom and the shape is clear: **the cheapest parts to move are the ones that matter least, and the parts that carry the automation have nowhere to go.** The 242-line invoice sync is the piece that stops staff from typing every invoice twice. On QuoteIQ, that work goes back to a human.

### Rough effort estimate

| Work                                          | Estimate                                      |
| --------------------------------------------- | --------------------------------------------- |
| Rebuild booking and lead forms                | 20–35 hours                                   |
| Rebuild the event receiver against six events | 8–12 hours                                    |
| Migrate and verify historical data            | 15–25 hours                                   |
| Rebuild automatic invoice sync                | **Not possible today at any number of hours** |

That is roughly **45–75 hours of development** to end up with less capability than the company has now, plus the ongoing labor cost of re-keying invoices by hand. Treat the hours as an estimate for planning, not a quote.

**How I reached this**

1. Inventoried the actual files in this project rather than guessing, so the counts are real.
2. Mapped each piece to the closest documented QuoteIQ feature, then asked one question — could a competent developer rebuild this on QuoteIQ as documented today? Three answers were no.
3. Weighted the invoice sync heaviest because it is the only piece that removes recurring human labor. Losing a webhook log costs nothing ongoing; losing automatic invoicing costs someone's afternoon every week.
4. Did not count the migration as a one-time cost only. Anything that goes back to manual is a permanent cost, and permanent costs beat one-time costs over a five-year horizon.

---

## 6. Extensibility

"Extensibility" means how much you can shape the software to your business instead of shaping your business to the software. Five things decide it: what it plugs into, whether you can track your own information, whether it can do work while nobody is watching, how deep its API goes, and how easily you can leave.

### Chart 4 — Extensibility scorecard

Scored 0–5. Higher is better. Scores reflect published capability, not user satisfaction.

| Category              |   Jobber    |   QuoteIQ   | Why                                                                                                                                                                                                                                                        |
| --------------------- | :---------: | :---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add-on ecosystem      |    **5**    |      2      | Jobber runs a public app marketplace — QuickBooks, Xero, Mailchimp, Gusto, DocuSign, CallRail, Wisetack, Thumbtack, Angi, Google Local Services, fleet tracking. QuoteIQ names five partners and has no marketplace.                                       |
| Custom fields         |    **4**    |      2      | Jobber lets you add your own fields to clients, properties, quotes, jobs, invoices, and team members (~50 before performance suffers), from Connect up. QuoteIQ offers custom inspection checklists and contact forms, but no general custom-field system. |
| Automation            |      4      |      4      | Close to a tie. Jobber's Custom Automation Builder (Grow) handles follow-ups and reminders. QuoteIQ bundles email/text automation, review requests, and mass campaigns from Pro, plus AI tools on every tier.                                              |
| API depth             |    **5**    |      1      | The widest gap. Jobber offers a full read-and-write GraphQL API, versioned, documented, with signed webhooks. QuoteIQ offers six outbound events and a contact-form endpoint.                                                                              |
| Getting your data out |      3      |      3      | A tie, and neither is great. Both export to CSV. QuoteIQ scores a point back for a purpose-built importer that reads Jobber exports.                                                                                                                       |
| **Total**             | **21 / 25** | **12 / 25** |                                                                                                                                                                                                                                                            |

```
Extensibility (0–5)          Jobber ▉   QuoteIQ ▓

Add-on ecosystem   ▉▉▉▉▉  5   ▓▓░░░  2
Custom fields      ▉▉▉▉░  4   ▓▓░░░  2
Automation         ▉▉▉▉░  4   ▓▓▓▓░  4
API depth          ▉▉▉▉▉  5   ▓░░░░  1
Data portability   ▉▉▉░░  3   ▓▓▓░░  3
```

_Scoring is deliberately simple: 5 means a documented, mature capability; 3 means it exists but is basic; 1 means barely present. QuoteIQ's low total reflects breadth of extension points, not product quality — it scores well on features it builds itself and poorly on letting others build alongside it._

---

## 7. The companies

**Table 4 — Company background**

|                | Jobber                                                          | QuoteIQ                                                      |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------------ |
| Founded        | 2011                                                            | 2023                                                         |
| Founders       | Sam Pillar and Forrest Zeisler, software developers             | Mike Vidan and Justin Rogers, former service-business owners |
| Based in       | Edmonton, Alberta, Canada                                       | Savannah, Georgia, USA                                       |
| Money raised   | $184M                                                           | Bootstrapped — no outside investors                          |
| Staff          | ~600                                                            | 11–50                                                        |
| Customers      | 200,000+ across 60+ countries                                   | 40,000+ _(company's own claim)_                              |
| Yearly revenue | Above $100M (reported by CEO)                                   | Not disclosed; valued around $20M                            |
| Position       | Established mid-market leader for small home-service businesses | Fast-growing challenger competing on price and bundled AI    |

Two very different bets. Jobber is a fourteen-year-old company with real scale, an API other businesses build on, and enough revenue that it will plainly still exist in five years. That stability is worth something when your website depends on their doorway staying open.

QuoteIQ is two years old, profitable enough to run without investors, and built by people who ran pressure-washing and lawn-care companies themselves. That shows in the product — features like satellite roof measurement and customer self-quoting are things an operator wants, not things a product manager invents. It is a real company making real progress.

But it is small, and its customer count is self-reported. A twelve-to-fifty person company that has not published API documentation, authentication details, or rate limits is not yet a company you build critical automation on top of. That is a statement about maturity, not intent.

> **A note on sources.** Several of the highest-ranking search results for "Jobber pricing" are published by QuoteIQ, and QuoteIQ's own site hosts pages comparing itself to Jobber. Those are marketing, not research, and none of the figures in this report come from them. Vendor claims that could not be independently confirmed — QuoteIQ's customer count in particular — are labeled as claims.

---

## 8. When QuoteIQ would be the right answer

A fair comparison names the conditions under which the recommendation flips. QuoteIQ is the better choice for a company that:

- **Has no custom software.** With nothing built on the API, the biggest objection in this report disappears entirely.
- **Sits right around ten users.** That is QuoteIQ's sweet spot — $2,990 a year against Jobber's $4,920 for the same headcount is a genuine saving, not a marketing trick.
- **Collects mostly by check, cash, or bank transfer.** The 1% card surcharge only bites if customers pay by card.
- **Wants marketing and AI tools without buying add-ons.** Jobber charges $99/month for the marketing suite and $29/month for the AI receptionist. QuoteIQ includes both.
- **Is adding people fast.** Flat-rate pricing rewards growth; per-user pricing taxes it.
- **Has run the seat experiment and the crew still won't use Jobber.** If proper logins don't fix it, the objection is real and unfixable, and a platform the field team actually opens is worth paying for — even one with a thinner API.

Only the last one is live today, and it cannot be answered until the 30 days are up. That is the whole argument for running the experiment before making the decision.

### What to do instead

Since the company is on Jobber's Core plan — one shared user, no custom fields, no automation builder — there is money being left on the table right now:

1. **Buy real seats first.** Everything else on this list is secondary to the 30-day experiment in section 3. It is the cheapest decision-quality information available.
2. **Move to Connect or Grow.** Custom fields arrive at Connect. The automation builder and job costing arrive at Grow. Both are things the team is currently doing by hand.
3. **Push more payments to bank transfer.** Jobber charges 1% for ACH against 2.9% for cards. On large roofing invoices that difference is worth real money — often more than the plan upgrade costs.
4. **Ask about volume pricing.** Published card rates are a starting point. A business processing serious volume can usually negotiate.
5. **Recheck QuoteIQ in twelve months.** If they ship a documented read-and-write API, most of this report needs rewriting — in their favor.

---

## 9. Open questions

These gaps do not change the recommendation, but anyone acting on this report should close them first.

1. **Jobber's per-plan user caps.** The pricing page says extra users cost $29/month on any plan. The help center says Connect "supports up to 5 users" and Core supports one. Those cannot both be true. A team of six or more should confirm directly which plan they actually need — it moves the Jobber numbers in Chart 1.
2. **Jobber's Grow bundled-seat pricing.** Jobber advertises 5, 10, and 15-user bundles whose prices are not published. A bundle may beat the per-user math used here, which would make Jobber look better than the chart shows.
3. **QuoteIQ's 1% convenience fee.** This comes from a reviewer citing QuoteIQ's payment terms, not from QuoteIQ's own pricing page. It is the single most consequential number in the cost section and deserves confirmation straight from QuoteIQ. It may also be passable to the customer rather than absorbed.
4. **QuoteIQ's API behind a sales call.** Everything assessed here is what QuoteIQ publishes. They may have more available on request. Worth one phone call before ruling it out.
5. **Actual card volume for this business.** The 1% comparison is only meaningful against a real number. Pull last year's total.
6. **Current user count.** This report models 6, 10, and 15 users, but the company is on a Core plan sized for one shared login. Confirming how many people actually need access sharpens every figure here.
7. **Whether the crew tested Jobber's app on their own account.** If every complaint came from the shared login, the app has never really been evaluated. Worth asking directly before the 30 days start, so the before-and-after is honest.
8. **Which phones the crew carries.** Both apps rate a full 0.4 stars lower on Android than iPhone. An all-Android crew is having a measurably worse time on either platform, and that is a hardware-and-app question, not a vendor question.
9. **QuoteIQ's review sample.** Its 4.7 comes from an unusually well-solicited base — a two-year-old app, founders with large audiences, and a built-in review-request feature. Not evidence of anything improper, but it means the score is less comparable to Jobber's than the numbers suggest.

---

## Sources

- [Jobber — Pricing](https://www.getjobber.com/pricing/)
- [Jobber Help Center — The Core Plan](https://help.getjobber.com/en/articles/the-core-plan/) · [The Connect Plan](https://help.getjobber.com/en/articles/the-connect-plan/) · [The Grow Plan](https://help.getjobber.com/en/articles/the-grow-plan/)
- [Jobber Help Center — Custom Fields](https://help.getjobber.com/en/articles/custom-fields/) · [App Marketplace](https://help.getjobber.com/hc/en-us/articles/360062128653-App-Marketplace)
- [Jobber Developer Center — Limitations for Custom Integrations](https://developer.getjobber.com/docs/custom_integrations/)
- [Jobber — Terms of Service](https://www.getjobber.com/terms-of-service/) (Section 20, Security: account sharing)
- App store listings, September 2026: [Jobber on the App Store](https://apps.apple.com/us/app/1014146758) · [Jobber on Google Play](https://play.google.com/store/apps/details?id=com.getjobber.jobber) · [QuoteIQ on the App Store](https://apps.apple.com/us/app/quoteiq-contractor-crm/id1635217093) · [QuoteIQ on Google Play](https://play.google.com/store/apps/details?id=corp.quoteiq.app)
- [Contrary Research — Jobber company report](https://research.contrary.com/company/jobber)
- [QuoteIQ — Pricing](https://myquoteiq.com/pricing/) · [Pro plan](https://myquoteiq.com/pricing/pro/) · [Features](https://myquoteiq.com/features/) · [Press & Brand Kit](https://myquoteiq.com/press/)
- [QuoteIQ Help Center — Outbound API Integration](https://intercom.help/quoteiq/en/articles/11429217-quoteiq-outbound-api-integration)
- [Contractor ToolStack — QuoteIQ pricing analysis](https://contractortoolstack.com/software/quoteiq/pricing/)
- [Crunchbase — QuoteIQ](https://www.crunchbase.com/organization/quoteiq)
- Integration inventory: the Austin leads platform codebase, September 2026

_Prices verified September 2026 and change without notice. This report describes software capability and cost; it is not legal, tax, or financial advice._
