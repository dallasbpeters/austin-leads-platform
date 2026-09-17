# Reel renderer

Renders the Texas Christmas Lights vertical reels. The website asks this service
for a video; it runs the HyperFrames CLI against a template baked into the image,
uploads the MP4 to Vercel Blob, and calls back when it's done.

It lives outside Vercel because a render needs Chrome, FFmpeg, and minutes of CPU.

## Deploy on Railway

- New service → Deploy from this GitHub repo
- **Root Directory:** `/` (the build copies `videos/christmas-reels`)
- **Dockerfile path:** `services/reel-renderer/Dockerfile`
- **Memory:** 2 GB or more. Chrome at 1080×1920 is hungry.

### Environment

| Variable                | Why                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `RENDER_SHARED_SECRET`  | Every request must send it as `x-render-secret`. Without it the worker refuses everything but `/health`.  |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token. The finished MP4 needs a public URL — that is what Instagram fetches.                  |
| `PORT`                  | Set by Railway.                                                                                           |
| `RENDER_TIMEOUT_MS`     | Optional. Default 15 minutes.                                                                             |
| `ELEVENLABS_API_KEY`    | Voice, music and sound effects. Without it the reel renders silent and `/health` says so.                 |
| `REEL_VOICE_ID`         | Optional. The ElevenLabs voice that reads the scenes.                                                     |
| `REEL_MUSIC_PROMPT`     | Optional. Describes the soundtrack. Default is cozy instrumental Christmas music.                         |
| `REEL_SFX`              | Optional. `off` renders with voice and music only. Effects are cached on disk under `WORK_DIR/sfx-cache`. |

## Run it on a laptop

```bash
export RENDER_SHARED_SECRET=dev ELEVENLABS_API_KEY=sk_... \
  PORT=8080 PROJECTS_DIR=$PWD/videos WORK_DIR=/tmp/renders HYPERFRAMES_BIN=$(which hyperframes)
node services/reel-renderer/server.mjs
REEL_RENDERER_URL=http://localhost:8080 pnpm dev   # the site talks to the local worker
```

With no `BLOB_READ_WRITE_TOKEN` the worker keeps the MP4 under `WORK_DIR/files` and
serves it at `PUBLIC_URL/files/<id>.mp4` (default `http://localhost:8080`). That is
enough to watch a reel; posting to Instagram still needs the Blob URL, so production
keeps the token. `/health` reports which mode is active under `storage`.

## API

```
GET  /health                      → { ok, templates, queued, working }
POST /render                      → 202 { id, status, position }
     { template, variables, quality?, fps?, callbackUrl? }
GET  /render/:id                  → { id, status, url, bytes, error }
POST /audio                       → 200 { scenes, total, voices, music, sfx, audio }
     { scenes }                     the studio preview's sound, as URLs; nothing is rendered
GET  /files/…                     → local mode only: the MP4s and preview clips this process keeps
```

`/audio` makes each voice line, one 48 s music bed and the four effects once, keyed
by what made them, and remembers the URL under `WORK_DIR/preview-cache` (and on Blob
in production, so a redeploy does not pay again). The same scenes twice cost one call.

`status` is queued → rendering → uploading → done, or failed. Renders run one at
a time. When `callbackUrl` is set, the worker POSTs the same shape back to it.

## Templates

| id                | What it is                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `christmas-reels` | Night scene: snow falls, words whip in one at a time, the price counts up in gold, the roofline lights and twinkles, then logo and phone. |

A template is a HyperFrames project under `videos/`. Its fill-in-the-blank fields
are declared in the composition's `data-composition-variables`, and arrive here as
`variables`.

## Sound

`audio.mjs` asks ElevenLabs for one voice clip per scene, one music track the
length of the reel, and three sound effects (bells, whoosh, chime) placed on
the composition's beats. The beat table lives in both `audio.mjs` and
`videos/christmas-reels/index.html` — change them together. Music dips under the
voice; effects never dip anything. Music or effects failing never fails the render.
