import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const railway = vi.hoisted(() => ({
  setRailwayVars: vi.fn(),
  listRailwayKeys: vi.fn(),
  railwayReady: vi.fn(),
}))
const vercel = vi.hoisted(() => ({ setVercelEnv: vi.fn(), listVercelEnv: vi.fn(), vercelReady: vi.fn() }))

vi.mock(import('@/lib/deploy/railway'), () => railway)
vi.mock(import('@/lib/deploy/vercel-env'), () => vercel)
vi.mock(import('node:fs'), () => ({
  existsSync: () => false,
  readFileSync: () => '',
  writeFileSync: vi.fn(),
}))

const { applySetting, deploySettingsStatus } = await import('@/lib/deploy/settings')

describe('deploy settings', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.clearAllMocks()
  })
  afterEach(() => vi.unstubAllEnvs())

  it('writes a shared secret to Railway and Vercel with the same value', async () => {
    const result = await applySetting('RENDER_SHARED_SECRET', '', { generate: true })
    const railwayValue = railway.setRailwayVars.mock.calls[0][0].RENDER_SHARED_SECRET
    expect(railwayValue).toMatch(/^[\da-f]{64}$/)
    expect(vercel.setVercelEnv).toHaveBeenCalledWith('RENDER_SHARED_SECRET', railwayValue, { secret: true })
    expect(result).toStrictEqual({ wrote: ['Railway', 'Vercel'], redeploy: ['vercel'] })
  })

  it('refuses unknown keys, blank values and generating a pasted key', async () => {
    await expect(applySetting('PATH', 'x')).rejects.toThrow('Unknown setting')
    await expect(applySetting('TIKTOK_CLIENT_KEY', '  ')).rejects.toThrow('Enter a value')
    await expect(applySetting('TIKTOK_CLIENT_KEY', '', { generate: true })).rejects.toThrow('pasted')
    await expect(applySetting('REEL_RENDERER_URL', 'http://x.dev')).rejects.toThrow('https')
    expect(vercel.setVercelEnv).not.toHaveBeenCalled()
  })

  it('reports where keys are set without any values', async () => {
    vercel.vercelReady.mockReturnValue(true)
    vercel.listVercelEnv.mockResolvedValue([{ id: '1', key: 'TIKTOK_CLIENT_KEY', target: ['production'] }])
    railway.railwayReady.mockReturnValue(false)
    const status = await deploySettingsStatus()
    const tiktok = status.settings.find((setting) => setting.key === 'TIKTOK_CLIENT_KEY')
    const secret = status.settings.find((setting) => setting.key === 'RENDER_SHARED_SECRET')
    expect(tiktok.vercel).toBe('set')
    expect(secret.railway).toBe('unknown')
    expect(JSON.stringify(status)).not.toContain('"value"')
  })
})

describe('pasted values', () => {
  it('drops terminal box lines, quotes and line breaks', async () => {
    const { cleanPastedValue } = await import('@/lib/deploy/settings')
    expect(cleanPastedValue('──── \n "abc-123"\n────')).toBe('abc-123')
    expect(cleanPastedValue('  sk_live  ')).toBe('sk_live')
  })
})
