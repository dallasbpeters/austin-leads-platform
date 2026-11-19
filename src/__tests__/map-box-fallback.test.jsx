// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import MapBox from '@/components/map-box'

const mapbox = vi.hoisted(() => ({ supported: vi.fn(), Map: vi.fn() }))

vi.mock(import('mapbox-gl'), () => {
  function Control() {}
  function Popup() {}
  return {
    default: {
      supported: mapbox.supported,
      Map: mapbox.Map,
      NavigationControl: Control,
      AttributionControl: Control,
      Popup,
    },
  }
})

// A WebGL2 context that reports `blockSize` as its largest uniform block.
const fakeWebGL2 = (blockSize) => ({
  MAX_UNIFORM_BLOCK_SIZE: 0x8a_30,
  isContextLost: () => false,
  getParameter: () => blockSize,
  getExtension: () => ({ loseContext: vi.fn() }),
})

const useWebGL2 = (context) => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type) =>
    type === 'webgl2' ? context : null,
  )
}

// The map starts when its section scrolls near the viewport; here it is always in view.
function InViewObserver(callback) {
  return { observe: () => callback([{ isIntersecting: true }]), disconnect: vi.fn() }
}

function FakeMap() {
  return { addControl: vi.fn(), once: vi.fn(), on: vi.fn(), remove: vi.fn() }
}

function BrokenMap() {
  throw new Error('Failed to initialize WebGL.')
}

const areas = [{ countyKey: 'travis', displayName: 'Travis County' }]
const fallbackText = /cannot show the interactive map/u

describe('service area map on a browser without usable WebGL2', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN', 'pk.test')
    vi.stubGlobal('IntersectionObserver', InViewObserver)
    mapbox.supported.mockReturnValue(true)
    mapbox.Map.mockImplementation(FakeMap)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    mapbox.supported.mockReset()
    mapbox.Map.mockReset()
  })

  it('shows the fallback and never creates the map when WebGL2 is missing', async () => {
    useWebGL2(null)
    render(<MapBox areas={areas} />)
    await expect(screen.findByText(fallbackText)).resolves.toBeTruthy()
    expect(screen.getByRole('application', { hidden: true }).hidden).toBeTruthy()
    expect(mapbox.Map).not.toHaveBeenCalled()
  })

  it('shows the fallback when the GPU reports a uniform block size of 0', async () => {
    useWebGL2(fakeWebGL2(0))
    render(<MapBox areas={areas} />)
    await expect(screen.findByText(fallbackText)).resolves.toBeTruthy()
    expect(mapbox.Map).not.toHaveBeenCalled()
  })

  it('shows the fallback when mapbox-gl says the browser is not supported', async () => {
    useWebGL2(fakeWebGL2(65_536))
    mapbox.supported.mockReturnValue(false)
    render(<MapBox areas={areas} />)
    await expect(screen.findByText(fallbackText)).resolves.toBeTruthy()
    expect(mapbox.Map).not.toHaveBeenCalled()
  })

  it('shows the fallback when the map cannot start', async () => {
    useWebGL2(fakeWebGL2(65_536))
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mapbox.Map.mockImplementation(BrokenMap)
    render(<MapBox areas={areas} />)
    await expect(screen.findByText(fallbackText)).resolves.toBeTruthy()
  })

  it('creates the map when WebGL2 works', async () => {
    useWebGL2(fakeWebGL2(65_536))
    render(<MapBox areas={areas} />)
    await waitFor(() => expect(mapbox.Map).toHaveBeenCalledOnce())
    expect(screen.queryByText(fallbackText)).toBeNull()
    expect(screen.getByRole('application').hidden).toBeFalsy()
  })
})
