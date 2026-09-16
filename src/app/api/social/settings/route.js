import { NextResponse } from 'next/server'

import { fixRailwayBuild, railwayReady, railwayStatus, redeployRailway } from '@/lib/deploy/railway'
import { applySetting, deploySettingsStatus, findSetting } from '@/lib/deploy/settings'
import { redeployVercel } from '@/lib/deploy/vercel-env'
import { requireSocialAdmin } from '@/lib/social/request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Asks the renderer if it is up. A web page back means the domain points at the wrong app. */
async function rendererHealth() {
  const base = (process.env.REEL_RENDERER_URL || '').trim().replace(/\/$/, '')
  if (!base) {
    return { ok: false, message: 'REEL_RENDERER_URL is not set on this deployment.' }
  }
  try {
    const response = await fetch(`${base}/health`, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    const body = await response.json().catch(() => null)
    if (!body) {
      return {
        ok: false,
        url: base,
        message: `${base} answered with a web page, not the renderer. Its domain points at the wrong Railway service, or the build is not the renderer.`,
      }
    }
    return {
      ok: response.ok,
      url: base,
      message: response.ok ? 'Renderer is up.' : `Renderer answered ${response.status}.`,
      details: body,
    }
  } catch (error) {
    return { ok: false, url: base, message: `No answer from ${base}: ${error.message}` }
  }
}

/** GET — where every setting stands, plus Railway and renderer health. */
export async function GET() {
  const auth = await requireSocialAdmin()
  if (auth.error) {
    return auth.error
  }
  const [status, renderer, railway] = await Promise.all([
    deploySettingsStatus(),
    rendererHealth(),
    railwayReady() ? railwayStatus().catch((error) => ({ error: error.message })) : null,
  ])
  return NextResponse.json({ ...status, renderer, railwayService: railway })
}

/**
 * POST — one action:
 *   { action: 'set', key, value }
 *   { action: 'generate', key, confirmReplace? }
 *   { action: 'redeploy', target: 'vercel' | 'railway' }
 *   { action: 'fix-railway' }
 */
export async function POST(request) {
  const auth = await requireSocialAdmin()
  if (auth.error) {
    return auth.error
  }
  const body = await request.json().catch(() => ({}))
  try {
    switch (body.action) {
      case 'set':
      case 'generate': {
        const setting = findSetting(body.key)
        if (!setting) {
          return NextResponse.json({ error: 'Unknown setting.' }, { status: 400 })
        }
        if (body.action === 'generate' && setting.dangerousReplace && !body.confirmReplace) {
          const { settings } = await deploySettingsStatus()
          const current = settings.find((item) => item.key === setting.key)
          if (current?.vercel === 'set' || current?.live) {
            return NextResponse.json(
              {
                error: `${setting.key} is already set. Replacing it disconnects TikTok and Instagram.`,
                needsConfirm: true,
              },
              { status: 409 },
            )
          }
        }
        const result = await applySetting(body.key, body.value, { generate: body.action === 'generate' })
        return NextResponse.json({ ok: true, ...result })
      }
      case 'redeploy': {
        if (body.target === 'railway') {
          await redeployRailway()
          return NextResponse.json({ ok: true, message: 'Railway is redeploying the renderer.' })
        }
        if (body.target === 'vercel') {
          const { url } = await redeployVercel()
          return NextResponse.json({
            ok: true,
            message: 'Vercel is rebuilding the site. It takes a few minutes.',
            url,
          })
        }
        return NextResponse.json({ error: 'Unknown target.' }, { status: 400 })
      }
      case 'fix-railway': {
        await fixRailwayBuild()
        return NextResponse.json({
          ok: true,
          message: 'Railway now builds the renderer from main and is redeploying.',
        })
      }
      default: {
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
      }
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 })
  }
}
