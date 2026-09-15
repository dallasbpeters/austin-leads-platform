# Video pipeline

How a film gets from a Sanity document to a page and to YouTube.

Three things own three different jobs, and keeping them separate is the point:

| Owns                                      | Where                         | What changes it                            |
| ----------------------------------------- | ----------------------------- | ------------------------------------------ |
| The script, the figures, the review state | Sanity `videoProject`         | The team, in Studio                        |
| The film                                  | `videos/<slug>/`              | `npm run video:sync`, then the composition |
| The listing                               | Sanity `videoProject.youtube` | The team, then `npm run video:yt:push`     |

## 1. Edit the script in Sanity

Studio → **Video project**. Each beat has the narration spoken verbatim, what is
on screen, and why the beat exists. A beat whose "why" cannot be traced to the
project's `message` is a beat to cut, not to decorate.

Write numbers as words in narration — "five thousand four hundred", not "$5,400".
The voice reads words correctly and digits inconsistently.

**Figures are references, never retyped.** Every number on screen comes from an
`energyChartSection` document. Change the price there and it changes everywhere.

## 2. Pull it into the film

```bash
npm run video:sync detach-and-reset -- --dry-run   # what would be re-recorded
npm run video:sync detach-and-reset                # do it
```

Only lines whose text, voice or speed actually changed are re-recorded — the
hash of those three lives in `assets/audio/.script-hashes.json`. Fixing one word
in beat four re-records beat four and nothing else.

Re-recording changes clip lengths, so `index.html` needs retiming afterwards:
each frame is its voice take plus about 0.4s lead-in and 0.6s tail. Then:

```bash
cd videos/detach-and-reset && npx hyperframes check
```

## 3. Watch it and ship it — the Videos page

**`/videos` in the admin.** This is the answer to "where do I watch it and how do
I upload it": one page, a player, and a button. It behaves identically locally
and on Vercel, because every action goes through an API route — the upload
streams server-side from `renderUrl` and the browser never touches the file.

```
Render  →  push it to a URL  →  it plays on the page  →  Approve  →  Upload to YouTube
```

```bash
cd videos/detach-and-reset && npx hyperframes render --resolution 4k --video-bitrate 40M
npm run video:render:push detach-and-reset
```

**Render at 4K for anything going to YouTube.** The default (`--quality looks`)
produced 1.8 Mbps for this film — not a bug, the frames are flat colour and hard
edged type and compress that well. But YouTube re-encodes whatever it is given,
and a low-bitrate source compounds the loss: banding in the dark grounds and
mush on the serif headlines.

Uploading 4K also moves the video into YouTube's better encoding tier, so even
the 1080p rendition viewers actually watch is noticeably cleaner. 56s costs about
75 seconds to render and roughly 74 MB.

`--crf` and `--video-bitrate` are mutually exclusive, and `--quality` sets CRF —
pass one or the other, never both, or the bitrate is silently ignored.

`video:render:push` uploads the MP4 to Sanity and sets `renderUrl`. That step is
what makes the page work on Vercel at all — the deployment cannot see your local
`renders/` folder.

The page refuses to leave a dead button: when Upload is disabled it says which
precondition is missing (not approved / no render / YouTube not connected).

Copy is deliberately NOT editable here. The script lives in Studio; a second
editing surface would drift from it within a week.

## 3b. Publish for review

```bash
cd videos/detach-and-reset && npx hyperframes publish
```

Returns a stable URL that plays the live composition. **Private by default** —
a reviewer needs access. Re-publishing updates the same URL, so paste it into
`videoProject.reviewUrl` once and it never goes stale.

Feedback goes into `videoProject.notes` — who, what, a timecode, and whether it
has been addressed. Set `status` to `changes` or `approved`.

## 4. Put it on a page

Add a **HyperFrames video** section to any page and set `embedUrl` to the
published URL. Add a poster image: the embed does not load until the visitor
presses play, so a page carrying this section costs a poster, not a composition.

Publish the HyperFrames project with `--public` first, or visitors hit a sign-in
wall.

Use the older **Video Section** instead when a real file is wanted — a download,
or a social cut. This one is for the page, because it never needs a re-render.

## 5. YouTube

**A service account cannot do this.** YouTube's API will not accept an upload
from one — a video has an owner, and a service account cannot own a channel or
be added to one. Neither `service-account-key.json` nor `balmy-vehicle-*.json`
helps here, however much access they have elsewhere.

**You do not need a new OAuth client.** `GOOGLE_BUSINESS_CLIENT_ID` already
lives in the same Google Cloud project (`420672616451`), and both scripts fall
back to it automatically. It only needs the YouTube scope granted.

In Google Cloud Console for project `420672616451`, once:

1. Enable **YouTube Data API v3**.
2. Add `http://localhost:8724/oauth2callback` to that client's
   **Authorised redirect URIs**.
3. If the consent screen is in Testing, add the channel owner as a test user.

Then, as the account that **owns the channel**:

```bash
npm run video:yt:auth
```

It opens a loopback listener, prints a URL, and catches the redirect itself —
nothing to copy back. (Google shut the old out-of-band paste-a-code flow down in
2022; loopback is what replaced it.) Put the printed `YOUTUBE_REFRESH_TOKEN` in
`.env.local`. After that it runs unattended, like Zoho.

Two failures worth recognising:

| Error                   | Means                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| `redirect_uri_mismatch` | Step 2 was not done, or the port differs                         |
| `access_denied`         | Consent screen is in Testing and this account is not a test user |

Then:

```bash
npm run video:yt:push detach-and-reset -- --dry-run   # show title/privacy, upload nothing
npm run video:yt:push detach-and-reset
```

Title, description, tags and privacy come from the document. Two guards:

- It **refuses unless `status` is `approved`**.
- It defaults to **unlisted**. Going public is a decision made in Sanity, not a
  side effect of running a script.

On success it writes `youtube.videoId` and `youtube.url` back and sets `status`
to `published`.

## On Vercel

Not all of this can run there, and pretending otherwise would waste your time.

| Step                | Vercel  | Why                                                       |
| ------------------- | ------- | --------------------------------------------------------- |
| YouTube consent     | **yes** | `/api/youtube/auth` — a URL the channel owner opens       |
| YouTube upload      | **yes** | `/api/youtube/upload` — streams an existing render        |
| Review + status     | **yes** | Sanity Studio, already deployed                           |
| Re-record narration | no      | Writes into `videos/<slug>/`; the filesystem is read-only |
| Render the film     | no      | Headless Chrome + ffmpeg for minutes                      |

Rendering belongs on a HyperFrames cloud target (`cloud`, `lambda`, `cloudrun`),
not a web function. Re-recording belongs on a developer machine or CI, because
the composition it feeds lives in this repo.

### Connect the channel

Register the deployed callback on the OAuth client once, alongside the local one:

```
https://<your-domain>/api/youtube/callback
http://localhost:8724/oauth2callback     # only if anyone still uses the CLI
```

Then, signed in as an admin, open:

```
/api/youtube/auth
```

It bounces to Google, and the callback stores the refresh token in **Postgres** —
not an env var, because the token is minted at runtime and env vars are
build-time. After that, uploads run unattended with nobody's laptop involved.

`/api/youtube/auth?json=1` returns the URL and the exact redirect URI it will
use, which is the fastest way to settle a `redirect_uri_mismatch`.

### Upload from Vercel

```bash
curl -X POST https://<your-domain>/api/youtube/upload \
  -H 'Content-Type: application/json' \
  -d '{"slug":"detach-and-reset"}'
```

Admin-only. It reads `videoProject.renderUrl`, streams that file straight to
YouTube without buffering it, and writes the video id back. Same two guards as
the CLI: **status must be `approved`**, and privacy defaults to **unlisted**.

`renderUrl` has to be publicly reachable — a Sanity asset or Vercel Blob URL.
Vercel never sees your local `videos/` folder.

**The timeout is the real limit.** `maxDuration` is 300s (the Pro ceiling). A
large render can exceed that; if it does, run `npm run video:yt:push` from a
machine instead. Same script, same guards, no timeout.

## Gotchas worth knowing

**Never put a dot in a document `_id`.** Sanity reserves dotted prefixes for
system documents (`drafts.`, `versions.`). A document with any other dotted
prefix is readable _with a token_ and invisible to unauthenticated reads — so
Studio shows it, an authenticated query finds it, and the live site renders
nothing. Use dashes: `videoProject-detach-and-reset`.

## Env

```
NEXT_PUBLIC_SANITY_PROJECT_ID   NEXT_PUBLIC_SANITY_DATASET
SANITY_API_WRITE_TOKEN          # seed + youtube write-back
ELEVENLABS_API_KEY              # voice
YOUTUBE_REFRESH_TOKEN           # optional — overrides the token stored in Postgres
YOUTUBE_OAUTH_REDIRECT          # optional — pin the callback URL if the origin is not the public one

# OAuth client: optional. Both scripts fall back to the existing
# GOOGLE_BUSINESS_CLIENT_ID / GOOGLE_BUSINESS_CLIENT_SECRET, which are already
# in the same Google Cloud project. Only set these to use a different client:
GOOGLE_OAUTH_CLIENT_ID          GOOGLE_OAUTH_CLIENT_SECRET
YOUTUBE_OAUTH_PORT              # default 8724, must match the registered URI
```

## Files

```
src/sanity/schemaTypes/videoProjectType.js        the document
src/sanity/schemaTypes/page-type.js               hyperframesSectionType
src/components/platform/sections/hyperframes-section.jsx
src/lib/platform/youtube-db.js                    token store (Postgres)
src/app/api/youtube/auth/route.js                 start consent      (Vercel)
src/app/api/youtube/callback/route.js             store the token    (Vercel)
src/app/api/youtube/upload/route.js               render -> YouTube  (Vercel)
scripts/seed-video-project.mjs                    one-off, seeds detach-and-reset
scripts/sync-video-project.mjs                    Sanity -> film
scripts/youtube-auth.mjs                          one-time consent
scripts/youtube-upload.mjs                        render -> YouTube -> Sanity
```
