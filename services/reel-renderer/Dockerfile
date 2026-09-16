# Reel renderer — Chrome + FFmpeg, which Vercel functions do not have.
#
# Build context is the REPO ROOT (the image copies the video templates from
# videos/). In Railway: Root Directory "/", Dockerfile path
# "services/reel-renderer/Dockerfile".

FROM node:22-bookworm-slim

# FFmpeg encodes the video; the rest are the shared libraries headless Chrome
# needs. fonts-liberation covers Chrome's own UI; the composition ships its own
# brand fonts.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services/reel-renderer/package.json services/reel-renderer/package-lock.json* ./
RUN npm install --omit=dev

# The template is baked in, so a render needs no network except the upload.
COPY videos/christmas-reels ./videos/christmas-reels

# Brand assets live in public/ (git-ignored inside videos/), so copy them in.
COPY scripts/sync-reel-assets.mjs ./scripts/sync-reel-assets.mjs
COPY public/christmas-logo-reversed.svg ./public/christmas-logo-reversed.svg
COPY public/images/tx-christmas-logo.svg ./public/images/tx-christmas-logo.svg
COPY public/fonts/Switzer-Variable.woff2 public/fonts/BespokeSerif-Variable.woff2 ./public/fonts/
COPY public/christmas-mockup ./public/christmas-mockup
RUN node scripts/sync-reel-assets.mjs

COPY services/reel-renderer/server.mjs services/reel-renderer/audio.mjs ./

# Download the Chrome build HyperFrames pins, at build time rather than on the
# first (user-facing) render.
ENV HYPERFRAMES_HOME=/app/.hyperframes
RUN npx --yes hyperframes@0.8.41 browser ensure

ENV NODE_ENV=production \
    PROJECTS_DIR=/app/videos \
    WORK_DIR=/tmp/renders \
    PORT=8080

EXPOSE 8080
CMD ["node", "server.mjs"]
