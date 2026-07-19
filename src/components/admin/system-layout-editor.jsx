'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ImagePlus, Map as MapIcon, RotateCw, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MAP_MAX_ZOOM,
  MAP_ROOF_ZOOM,
  PANEL_ICON_URL,
  PANEL_SCALE_DEFAULT,
  PANEL_SIZE_KEYS,
  PANEL_SIZES,
  clampPanelScale,
  createPanelId,
  emptyLayoutState,
  metersPerPixel,
  panelSizeMeta,
} from '@/lib/quotes/panel-geometry'

/** Pure satellite — sharper rooftop detail than satellite-streets at high zoom. */
const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-v9'

const PANEL_DROP_SHADOW = 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.55)) drop-shadow(0 2px 6px rgb(0 0 0 / 0.35))'

const HANDLE_CORNERS = [
  { key: 'nw', cursor: 'nwse-resize', style: { left: 0, top: 0, transform: 'translate(-50%, -50%)' } },
  { key: 'ne', cursor: 'nesw-resize', style: { right: 0, top: 0, transform: 'translate(50%, -50%)' } },
  { key: 'se', cursor: 'nwse-resize', style: { right: 0, bottom: 0, transform: 'translate(50%, 50%)' } },
  { key: 'sw', cursor: 'nesw-resize', style: { left: 0, bottom: 0, transform: 'translate(-50%, 50%)' } },
]

const normalizeDegrees = (deg) => {
  const n = Number(deg) || 0
  return ((n % 360) + 360) % 360
}

const pointerAngleDeg = (centerX, centerY, clientX, clientY) =>
  (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI

const geocodeAddress = async (address, token) => {
  const query = String(address || '').trim()
  if (!query || !token) {
    return null
  }
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`)
  url.searchParams.set('access_token', token)
  url.searchParams.set('country', 'US')
  url.searchParams.set('limit', '1')
  url.searchParams.set('proximity', '-97.7431,30.2672')
  const response = await fetch(url.toString())
  if (!response.ok) {
    return null
  }
  const payload = await response.json()
  const feature = payload.features?.[0]
  if (!feature?.center) {
    return null
  }
  return { center: feature.center, placeName: feature.place_name }
}

const normalizeLayout = (layout) => {
  if (!layout || typeof layout !== 'object') {
    return emptyLayoutState()
  }
  return {
    center: Array.isArray(layout.center) ? layout.center : [-97.7431, 30.2672],
    zoom: Number(layout.zoom) > 0 ? Number(layout.zoom) : MAP_ROOF_ZOOM,
    bearing: Number(layout.bearing) || 0,
    panels: Array.isArray(layout.panels) ? layout.panels : [],
  }
}

const loadPanelImage = () =>
  new Promise((resolve, reject) => {
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Failed to load panel image')))
    image.src = PANEL_ICON_URL
  })

const panelPixelSize = (panel, zoom) => {
  const { widthM, heightM, landscape } = panelSizeMeta(panel.sizeKey, panel.scale)
  const mpp = Math.max(metersPerPixel(panel.lat, zoom), 0.000_001)
  return {
    widthPx: widthM / mpp,
    heightPx: heightM / mpp,
    rotation: (Number(panel.rotation) || 0) + (landscape ? 90 : 0),
  }
}

/**
 * Satellite map + HTML panel sprites with corner drag handles (drawing-app style).
 */
export default function SystemLayoutEditor({ address = '', mode = 'map', layout, imageUrl, onChange }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
  const overlayRef = useRef(null)
  const mapRef = useRef(null)
  const layoutRef = useRef(normalizeLayout(layout))
  const dragRef = useRef(null)
  const suppressMapClickRef = useRef(false)
  const sizeKeyRef = useRef('72-portrait')
  const scaleRef = useRef(PANEL_SCALE_DEFAULT)
  const rotationRef = useRef(0)
  const selectedIdRef = useRef(null)
  const lastGeocodedRef = useRef('')
  const writeLayoutRef = useRef(null)
  const panelImageRef = useRef(null)
  const [mapContainerEl, setMapContainerEl] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState('')
  const [viewTick, setViewTick] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [sizeKey, setSizeKey] = useState('72-portrait')
  const [scale, setScale] = useState(PANEL_SCALE_DEFAULT)
  const [rotation, setRotation] = useState(0)
  const [geocodeStatus, setGeocodeStatus] = useState('')
  const [capturing, setCapturing] = useState(false)
  const [panels, setPanels] = useState(() => normalizeLayout(layout).panels)
  const tabsId = useId()
  const onChangeRef = useRef(onChange)
  const modeRef = useRef(mode)
  const imageUrlRef = useRef(imageUrl)

  const mapContainerCallbackRef = useCallback((node) => {
    setMapContainerEl(node)
  }, [])

  useEffect(() => {
    sizeKeyRef.current = sizeKey
  }, [sizeKey])
  useEffect(() => {
    scaleRef.current = scale
  }, [scale])
  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])
  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    imageUrlRef.current = imageUrl
  }, [imageUrl])

  const emit = useCallback((patch) => {
    onChangeRef.current?.({
      mode: modeRef.current,
      layout: layoutRef.current,
      imageUrl: imageUrlRef.current || '',
      ...patch,
    })
  }, [])

  const writeLayout = useCallback(
    (nextLayout, options = {}) => {
      const normalized = normalizeLayout(nextLayout)
      layoutRef.current = normalized
      setPanels(normalized.panels)
      emit({ layout: normalized, ...(options.imageUrl != null ? { imageUrl: options.imageUrl } : {}) })
    },
    [emit],
  )
  useEffect(() => {
    writeLayoutRef.current = writeLayout
  }, [writeLayout])

  const bumpView = useCallback(() => {
    setViewTick((tick) => tick + 1)
  }, [])

  const flyToAddress = useCallback(
    async (query, { quiet = false } = {}) => {
      const trimmed = String(query || '').trim()
      if (!token) {
        if (!quiet) {
          setGeocodeStatus('Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to use satellite layouts.')
        }
        return false
      }
      if (trimmed.length < 5) {
        if (!quiet) {
          setGeocodeStatus('Enter a street address (city/ZIP help accuracy).')
        }
        return false
      }
      if (!quiet) {
        setGeocodeStatus('Looking up address…')
      }
      const result = await geocodeAddress(trimmed, token)
      if (!result) {
        setGeocodeStatus('Could not find that address. Check street, city, and ZIP.')
        return false
      }
      lastGeocodedRef.current = trimmed
      const map = mapRef.current
      if (map) {
        map.flyTo({ center: result.center, zoom: MAP_ROOF_ZOOM, essential: true })
      }
      writeLayoutRef.current?.({
        ...layoutRef.current,
        center: result.center,
        zoom: MAP_ROOF_ZOOM,
      })
      setGeocodeStatus(result.placeName)
      return true
    },
    [token],
  )

  useEffect(() => {
    if (!mapReady || mode !== 'map' || !token) {
      return
    }
    const trimmed = address.trim()
    if (trimmed.length < 5 || trimmed === lastGeocodedRef.current) {
      return
    }
    const timer = setTimeout(() => {
      void flyToAddress(trimmed, { quiet: true })
    }, 500)
    return () => clearTimeout(timer)
  }, [address, flyToAddress, mapReady, mode, token])

  useEffect(() => {
    const next = normalizeLayout(layout)
    layoutRef.current = next
    setPanels(next.panels)
  }, [layout])

  // Satellite basemap — container must be a normal block with explicit height
  // (Mapbox sets position:relative on the container and breaks absolute inset-0).
  useEffect(() => {
    if (mode !== 'map' || !token || !mapContainerEl) {
      return
    }

    let cancelled = false
    let resizeObserver = null
    let map = null

    const placePanelAt = (lngLat) => {
      const id = createPanelId()
      const nextPanels = [
        ...layoutRef.current.panels,
        {
          id,
          lng: lngLat.lng,
          lat: lngLat.lat,
          sizeKey: sizeKeyRef.current,
          scale: scaleRef.current,
          rotation: rotationRef.current,
        },
      ]
      setSelectedId(id)
      writeLayoutRef.current?.(
        {
          ...layoutRef.current,
          center: map ? [map.getCenter().lng, map.getCenter().lat] : layoutRef.current.center,
          zoom: map?.getZoom() ?? layoutRef.current.zoom,
          bearing: map?.getBearing() ?? layoutRef.current.bearing,
          panels: nextPanels,
        },
        { selectedId: id },
      )
    }

    try {
      mapboxgl.accessToken = token
      // Ensure the DOM node has a measurable box before Mapbox reads it
      mapContainerEl.style.width = '100%'
      mapContainerEl.style.height = '100%'
      mapContainerEl.style.minHeight = '420px'

      const initial = layoutRef.current
      map = new mapboxgl.Map({
        container: mapContainerEl,
        style: SATELLITE_STYLE,
        center: initial.center,
        zoom: initial.zoom > 0 ? initial.zoom : MAP_ROOF_ZOOM,
        minZoom: 15,
        maxZoom: MAP_MAX_ZOOM,
        bearing: initial.bearing,
        attributionControl: false,
        preserveDrawingBuffer: true,
        pitchWithRotate: false,
        fadeDuration: 0,
      })
      mapRef.current = map
      setMapError('')
      setMapReady(false)
      map.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false, showCompass: true }),
        'top-right',
      )
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    } catch (error) {
      setMapError(error?.message || 'Failed to create map')
      mapRef.current = null
      return
    }

    const handleView = () => bumpView()
    const handleError = (event) => {
      const message = event?.error?.message || event?.message || 'Map failed to load'
      setMapError(message)
      console.error('[SystemLayoutEditor]', event?.error || event)
    }

    const finishReady = () => {
      if (cancelled || !map) {
        return
      }
      map.resize()
      setMapReady(true)
      bumpView()
    }

    const handleIdle = () => {
      if (!cancelled && map) {
        map.resize()
      }
    }

    map.on('load', finishReady)
    map.once('idle', handleIdle)
    map.on('error', handleError)
    map.on('move', handleView)
    map.on('zoom', handleView)
    map.on('rotate', handleView)
    map.on('pitch', handleView)

    const handleMapClick = (event) => {
      if (dragRef.current || suppressMapClickRef.current) {
        suppressMapClickRef.current = false
        return
      }
      placePanelAt(event.lngLat)
    }
    map.on('click', handleMapClick)

    resizeObserver = new ResizeObserver(() => {
      if (!mapRef.current || cancelled) {
        return
      }
      map.resize()
      bumpView()
    })
    resizeObserver.observe(mapContainerEl)

    const resizeTimer = window.setTimeout(finishReady, 250)
    const failSafe = window.setTimeout(() => {
      if (!cancelled && !mapRef.current?.loaded()) {
        setMapError('Map is taking too long to load. Check the Mapbox token and network.')
      }
    }, 8000)

    void loadPanelImage()
      .then((image) => {
        panelImageRef.current = image
      })
      .catch(() => {})

    return () => {
      cancelled = true
      window.clearTimeout(resizeTimer)
      window.clearTimeout(failSafe)
      resizeObserver?.disconnect()
      map.off('load', finishReady)
      map.off('error', handleError)
      map.off('move', handleView)
      map.off('zoom', handleView)
      map.off('rotate', handleView)
      map.off('pitch', handleView)
      map.off('click', handleMapClick)
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [bumpView, mapContainerEl, mode, token])

  const commitCamera = () => {
    const map = mapRef.current
    if (!map) {
      return
    }
    writeLayout({
      ...layoutRef.current,
      center: [map.getCenter().lng, map.getCenter().lat],
      zoom: map.getZoom(),
      bearing: map.getBearing(),
    })
  }

  const updatePanel = (id, patch) => {
    const nextPanels = layoutRef.current.panels.map((panel) =>
      panel.id === id ? { ...panel, ...patch } : panel,
    )
    layoutRef.current = { ...layoutRef.current, panels: nextPanels }
    setPanels(nextPanels)
  }

  const persistPanels = () => {
    commitCamera()
    writeLayout({ ...layoutRef.current, panels: layoutRef.current.panels })
  }

  const handlePanelPointerDown = (event, panel) => {
    event.stopPropagation()
    event.preventDefault()
    suppressMapClickRef.current = true
    const map = mapRef.current
    if (!map) {
      return
    }
    setSelectedId(panel.id)
    setSizeKey(panel.sizeKey || '72-portrait')
    setScale(clampPanelScale(panel.scale ?? PANEL_SCALE_DEFAULT))
    setRotation(panel.rotation || 0)
    map.dragPan.disable()
    dragRef.current = {
      type: 'move',
      id: panel.id,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...panel },
    }
  }

  const panelScreenCenter = (panel) => {
    const map = mapRef.current
    const rect = overlayRef.current?.getBoundingClientRect()
    if (!map || !rect) {
      return null
    }
    const point = map.project([panel.lng, panel.lat])
    return { x: rect.left + point.x, y: rect.top + point.y }
  }

  const handleCornerPointerDown = (event, panel, cornerKey) => {
    event.stopPropagation()
    event.preventDefault()
    suppressMapClickRef.current = true
    const map = mapRef.current
    const center = panelScreenCenter(panel)
    if (!map || !center) {
      return
    }
    setSelectedId(panel.id)
    const startDist = Math.hypot(event.clientX - center.x, event.clientY - center.y) || 1
    map.dragPan.disable()
    dragRef.current = {
      type: 'resize',
      id: panel.id,
      cornerKey,
      centerX: center.x,
      centerY: center.y,
      startDist,
      startScale: clampPanelScale(panel.scale ?? PANEL_SCALE_DEFAULT),
      origin: { ...panel },
    }
  }

  const handleRotatePointerDown = (event, panel) => {
    event.stopPropagation()
    event.preventDefault()
    suppressMapClickRef.current = true
    const map = mapRef.current
    const center = panelScreenCenter(panel)
    if (!map || !center) {
      return
    }
    setSelectedId(panel.id)
    const { landscape } = panelSizeMeta(panel.sizeKey, panel.scale)
    const landscapeOffset = landscape ? 90 : 0
    const startPointer = pointerAngleDeg(center.x, center.y, event.clientX, event.clientY)
    const startDisplay = (Number(panel.rotation) || 0) + landscapeOffset
    map.dragPan.disable()
    dragRef.current = {
      type: 'rotate',
      id: panel.id,
      centerX: center.x,
      centerY: center.y,
      startPointer,
      startDisplay,
      landscapeOffset,
      origin: { ...panel },
    }
  }

  useEffect(() => {
    const handlePointerMove = (event) => {
      const drag = dragRef.current
      const map = mapRef.current
      if (!drag || !map) {
        return
      }
      if (drag.type === 'move') {
        const originPoint = map.project([drag.origin.lng, drag.origin.lat])
        const lngLat = map.unproject([
          originPoint.x + (event.clientX - drag.startX),
          originPoint.y + (event.clientY - drag.startY),
        ])
        updatePanel(drag.id, { lng: lngLat.lng, lat: lngLat.lat })
        drag.moved = true
        return
      }
      if (drag.type === 'resize') {
        const dist = Math.hypot(event.clientX - drag.centerX, event.clientY - drag.centerY) || 1
        const nextScale = clampPanelScale(drag.startScale * (dist / drag.startDist))
        setScale(nextScale)
        updatePanel(drag.id, { scale: nextScale })
        drag.moved = true
        return
      }
      if (drag.type === 'rotate') {
        const pointer = pointerAngleDeg(drag.centerX, drag.centerY, event.clientX, event.clientY)
        const delta = pointer - drag.startPointer
        const nextDisplay = drag.startDisplay + delta
        const nextRotation = Math.round(normalizeDegrees(nextDisplay - drag.landscapeOffset))
        setRotation(nextRotation)
        updatePanel(drag.id, { rotation: nextRotation })
        drag.moved = true
      }
    }

    const handlePointerUp = () => {
      const drag = dragRef.current
      const map = mapRef.current
      if (!drag) {
        return
      }
      dragRef.current = null
      map?.dragPan.enable()
      if (drag.moved) {
        const current = mapRef.current
        if (current) {
          writeLayoutRef.current?.({
            ...layoutRef.current,
            center: [current.getCenter().lng, current.getCenter().lat],
            zoom: current.getZoom(),
            bearing: current.getBearing(),
            panels: layoutRef.current.panels,
          })
        } else {
          writeLayoutRef.current?.({ ...layoutRef.current, panels: layoutRef.current.panels })
        }
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const handleSizeChange = (value) => {
    setSizeKey(value)
    if (!selectedId) {
      return
    }
    updatePanel(selectedId, { sizeKey: value })
    persistPanels()
  }

  const handleRotationChange = (value) => {
    const next = Number(value)
    setRotation(next)
    if (!selectedId) {
      return
    }
    updatePanel(selectedId, { rotation: next })
    persistPanels()
  }

  const handleDeleteSelected = () => {
    if (!selectedId) {
      return
    }
    const nextPanels = layoutRef.current.panels.filter((panel) => panel.id !== selectedId)
    setSelectedId(null)
    writeLayout({ ...layoutRef.current, panels: nextPanels })
  }

  const handleClearPanels = () => {
    setSelectedId(null)
    writeLayout({ ...layoutRef.current, panels: [] })
  }

  const handleCapture = async () => {
    const map = mapRef.current
    if (!map) {
      return
    }
    setCapturing(true)
    try {
      await new Promise((resolve) => {
        map.once('idle', resolve)
        map.triggerRepaint()
      })
      const mapCanvas = map.getCanvas()
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = mapCanvas.width
      exportCanvas.height = mapCanvas.height
      const ctx = exportCanvas.getContext('2d')
      ctx.drawImage(mapCanvas, 0, 0)

      let panelImage = panelImageRef.current
      if (!panelImage) {
        panelImage = await loadPanelImage()
        panelImageRef.current = panelImage
      }

      const dpr = mapCanvas.width / (mapContainerEl?.clientWidth || mapCanvas.width)
      const zoom = map.getZoom()
      for (const panel of layoutRef.current.panels) {
        const point = map.project([panel.lng, panel.lat])
        const { widthPx, heightPx, rotation: deg } = panelPixelSize(panel, zoom)
        const w = widthPx * dpr
        const h = heightPx * dpr
        ctx.save()
        ctx.translate(point.x * dpr, point.y * dpr)
        ctx.rotate((deg * Math.PI) / 180)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
        ctx.shadowBlur = 6 * dpr
        ctx.shadowOffsetY = 2 * dpr
        ctx.drawImage(panelImage, -w / 2, -h / 2, w, h)
        ctx.restore()
      }

      const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.92)
      writeLayout(
        {
          ...layoutRef.current,
          center: [map.getCenter().lng, map.getCenter().lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
        },
        { imageUrl: dataUrl },
      )
    } finally {
      setCapturing(false)
    }
  }

  const handleModeChange = (nextMode) => {
    emit({ mode: nextMode, layout: layoutRef.current, imageUrl: imageUrlRef.current || '' })
  }

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.addEventListener('load', (loadEvent) => {
      emit({
        mode: 'upload',
        layout: layoutRef.current,
        imageUrl: loadEvent.target?.result || '',
      })
    })
    reader.readAsDataURL(file)
  }

  const handleClearImage = () => {
    emit({ mode: modeRef.current, layout: layoutRef.current, imageUrl: '' })
  }

  const map = mapRef.current
  const zoom = map?.getZoom?.() ?? layoutRef.current.zoom
  // viewTick forces re-project when the camera moves
  void viewTick

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-muted-foreground text-xs font-medium">System layout (optional)</Label>
        <p className="text-muted-foreground/70 mt-0.5 text-[11px]">
          Map uses the property address above. Click to place panels, drag to move, drag corner handles to
          resize.
        </p>
      </div>

      <Tabs id={tabsId} onValueChange={handleModeChange} value={mode === 'upload' ? 'upload' : 'map'}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">
            <MapIcon aria-hidden="true" className="mr-1.5 size-3.5" />
            Map placement
          </TabsTrigger>
          <TabsTrigger value="upload">
            <ImagePlus aria-hidden="true" className="mr-1.5 size-3.5" />
            Upload image
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-3" value="map">
          {!token ? (
            <p className="rounded-md border border-dashed px-3 py-4 text-sm text-amber-700 dark:text-amber-400">
              Add <code className="text-xs">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to enable satellite
              layouts. You can still upload an image.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-40 flex-1 space-y-1">
                  <Label className="text-xs">Panel type</Label>
                  <Select onValueChange={handleSizeChange} value={sizeKey}>
                    <SelectTrigger aria-label="Panel type" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PANEL_SIZE_KEYS.map((key) => (
                        <SelectItem key={key} value={key}>
                          {PANEL_SIZES[key].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-28 space-y-1">
                  <Label className="text-xs">Angle</Label>
                  <Select onValueChange={handleRotationChange} value={String(rotation)}>
                    <SelectTrigger aria-label="Panel angle" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 15, 30, 45, 90, 135, 180, 270].map((deg) => (
                        <SelectItem key={deg} value={String(deg)}>
                          {deg}°
                        </SelectItem>
                      ))}
                      {![0, 15, 30, 45, 90, 135, 180, 270].includes(rotation) ? (
                        <SelectItem value={String(rotation)}>{rotation}°</SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  disabled={!selectedId}
                  onClick={handleDeleteSelected}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Trash2 className="mr-1 size-3.5" />
                  Delete
                </Button>
              </div>

              {mapError ? (
                <p className="rounded-md border border-dashed px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                  Map error: {mapError}
                </p>
              ) : null}

              <div className="border-border relative h-[420px] w-full overflow-hidden rounded-md border">
                {/* Mapbox owns this node — block-level height required (not position:absolute). */}
                <div
                  ref={mapContainerCallbackRef}
                  className="quote-layout-map h-full w-full"
                  style={{ minHeight: 420 }}
                />
                <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-10">
                  {mapReady && map
                    ? panels.map((panel) => {
                        const point = map.project([panel.lng, panel.lat])
                        const { widthPx, heightPx, rotation: deg } = panelPixelSize(panel, zoom)
                        const selected = panel.id === selectedId
                        return (
                          <div
                            key={panel.id}
                            className="pointer-events-auto absolute"
                            style={{
                              left: point.x,
                              top: point.y,
                              width: widthPx,
                              height: heightPx,
                              marginLeft: -widthPx / 2,
                              marginTop: -heightPx / 2,
                              transform: `rotate(${deg}deg)`,
                              zIndex: selected ? 2 : 1,
                            }}
                          >
                            <button
                              aria-label="Solar panel"
                              className="block size-full cursor-move border-0 bg-transparent p-0"
                              onClick={(event) => event.stopPropagation()}
                              onPointerDown={(event) => handlePanelPointerDown(event, panel)}
                              style={{
                                backgroundImage: `url(${PANEL_ICON_URL})`,
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 100%',
                                filter: PANEL_DROP_SHADOW,
                              }}
                              type="button"
                            />
                            {selected ? (
                              <>
                                <div
                                  aria-hidden="true"
                                  className="bg-primary/80 absolute left-1/2 w-px"
                                  style={{ top: -22, height: 22, marginLeft: -0.5 }}
                                />
                                <button
                                  aria-label="Rotate panel"
                                  className="border-background bg-background text-primary absolute left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border-2 shadow"
                                  onPointerDown={(event) => handleRotatePointerDown(event, panel)}
                                  style={{ top: -32, cursor: 'grab' }}
                                  type="button"
                                >
                                  <RotateCw aria-hidden="true" className="size-3" />
                                </button>
                                {HANDLE_CORNERS.map((handle) => (
                                  <button
                                    key={handle.key}
                                    aria-label={`Resize ${handle.key}`}
                                    className="border-background bg-primary absolute size-3 rounded-sm border-2 shadow"
                                    onPointerDown={(event) =>
                                      handleCornerPointerDown(event, panel, handle.key)
                                    }
                                    style={{ ...handle.style, cursor: handle.cursor }}
                                    type="button"
                                  />
                                ))}
                              </>
                            ) : null}
                          </div>
                        )
                      })
                    : null}
                </div>
                {!mapReady && !mapError ? (
                  <div className="text-muted-foreground bg-background/60 pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-sm">
                    Loading map…
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-[11px]">
                  {address.trim()
                    ? `Click to place · drag to move · corners resize · top handle rotates · zoom for detail · ${panels.length} panel${panels.length === 1 ? '' : 's'}`
                    : 'Enter the property address in Customer & Property to locate the roof.'}
                  {geocodeStatus ? ` · ${geocodeStatus}` : ''}
                  {selectedId ? ` · ${Math.round(scale * 100)}% · ${rotation}°` : ''}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={panels.length === 0}
                    onClick={handleClearPanels}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Clear panels
                  </Button>
                  <Button disabled={capturing} onClick={handleCapture} size="sm" type="button">
                    {capturing ? 'Capturing…' : 'Use map in PDF'}
                  </Button>
                </div>
              </div>

              {imageUrl && mode === 'map' ? (
                <div className="flex items-center gap-3">
                  <Image
                    alt="Captured layout preview"
                    className="max-h-24 w-auto rounded border object-cover"
                    height={96}
                    src={imageUrl}
                    unoptimized
                    width={160}
                  />
                  <p className="text-muted-foreground text-[11px]">
                    Captured image is what appears in the quote PDF. Capture again after edits.
                  </p>
                </div>
              ) : null}
            </>
          )}
        </TabsContent>

        <TabsContent className="space-y-2" value="upload">
          {imageUrl && mode === 'upload' ? (
            <div className="relative inline-block">
              <Image
                alt="System layout preview"
                className="max-h-40 w-auto rounded-md border object-contain"
                height={160}
                src={imageUrl}
                unoptimized
                width={320}
              />
              <Button
                aria-label="Remove layout image"
                className="absolute top-1 right-1 size-6 rounded-full"
                onClick={handleClearImage}
                size="icon"
                type="button"
                variant="destructive"
              >
                ×
              </Button>
            </div>
          ) : (
            <label className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-3 text-sm transition-colors">
              <ImagePlus aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
              <span className="text-muted-foreground">Click to upload layout image (PNG, JPG)</span>
              <input accept="image/*" className="sr-only" onChange={handleUpload} type="file" />
            </label>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
