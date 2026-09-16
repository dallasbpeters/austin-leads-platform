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

| Variable                | Why                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `RENDER_SHARED_SECRET`  | Every request must send it as `x-render-secret`. Without it the worker refuses everything but `/health`. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token. The finished MP4 needs a public URL — that is what Instagram fetches.                 |
| `PORT`                  | Set by Railway.                                                                                          |
| `RENDER_TIMEOUT_MS`     | Optional. Default 15 minutes.                                                                            |

## API

```
GET  /health                      → { ok, templates, queued, working }
POST /render                      → 202 { id, status, position }
     { template, variables, quality?, fps?, callbackUrl? }
GET  /render/:id                  → { id, status, url, bytes, error }
```

`status` is queued → rendering → uploading → done, or failed. Renders run one at
a time. When `callbackUrl` is set, the worker POSTs the same shape back to it.

## Templates

| id              | What it is                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `roofline-glow` | Night scene: snow falls, the roofline lights up bulb by bulb, then the headline, then the logo and phone. |

A template is a HyperFrames project under `videos/`. Its fill-in-the-blank fields
are declared in the composition's `data-composition-variables`, and arrive here as
`variables`.
