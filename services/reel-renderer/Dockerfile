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

# The templates are baked in, so a render needs no network except the upload.
COPY videos/christmas-reels ./videos/christmas-reels
COPY videos/brand-reels ./videos/brand-reels

# Brand assets live in public/ (git-ignored inside videos/), so copy them in.
COPY scripts/sync-reel-assets.mjs ./scripts/sync-reel-assets.mjs
COPY public/christmas-logo.svg ./public/christmas-logo.svg
COPY public/images/tx-christmas-logo.svg public/images/tx-christmas-hero-collage.png ./public/images/
COPY public/tx-solar-logo.svg ./public/tx-solar-logo.svg
COPY public/clouds/cloud-sprite.png ./public/clouds/cloud-sprite.png
COPY public/fonts/Switzer-Variable.woff2 public/fonts/BespokeSerif-Variable.woff2 ./public/fonts/
COPY public/christmas-mockup ./public/christmas-mockup
# The chosen soundtracks, when the team has dropped them in (see README → Sound).
COPY public/reel-music ./public/reel-music
RUN node scripts/sync-reel-assets.mjs

COPY services/reel-renderer/server.mjs services/reel-renderer/audio.mjs ./

# HyperFrames and the exact Chrome it pins are installed at build time.
# `hyperframes browser ensure` can wait forever in a build (it hung for 30+
# minutes on both Railway and GitHub), so Chrome comes straight from Chrome
# for Testing and HyperFrames is pointed at it. Keep CHROME_VERSION in step
# with the version HyperFrames pins when upgrading it.
ARG HYPERFRAMES_VERSION=0.8.41
ARG CHROME_VERSION=152.0.7977.30
ENV HYPERFRAMES_NO_TELEMETRY=1 \
    HYPERFRAMES_NO_UPDATE_CHECK=1 \
    HYPERFRAMES_SKIP_SKILLS=1 \
    HYPERFRAMES_HOME=/app/.hyperframes \
    HYPERFRAMES_BROWSER_PATH=/opt/chrome/chrome-headless-shell/linux-${CHROME_VERSION}/chrome-headless-shell-linux64/chrome-headless-shell
RUN npm install -g hyperframes@${HYPERFRAMES_VERSION} \
  && npx --yes @puppeteer/browsers@2 install chrome-headless-shell@${CHROME_VERSION} --path /opt/chrome \
  && test -x "$HYPERFRAMES_BROWSER_PATH"

ENV NODE_ENV=production \
    PROJECTS_DIR=/app/videos \
    WORK_DIR=/tmp/renders \
    PORT=8080

EXPOSE 8080
CMD ["node", "server.mjs"]