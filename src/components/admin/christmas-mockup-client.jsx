'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ArrowLeft, Camera, FolderOpen } from 'lucide-react'

import {
  Actions,
  ChoiceButtons,
  ColorSwatch,
  DrawToolbar,
  EmptyPhoto,
  EstimatePanel,
  LabeledSlider,
  MeasureBar,
  QuoteTargetDialog,
  SavedMockupsDialog,
  ShapeList,
  ZoomControls,
} from '@/components/admin/christmas-mockup-panels'
import { Button } from '@/components/ui/button'

import { CHRISTMAS_LIGHT_COLORS, CHRISTMAS_SERVICE_TYPES } from '@/lib/christmas/invoice-calc'
import {
  bulbRadiusForScale,
  defaultBulbRadius,
  defaultWreathSize,
  distance,
  estimateMockup,
  hitTestShape,
  insertPoint,
  isPlacedItem,
  minPointsFor,
  MOCKUP_LINE_ITEMS_STORAGE_KEY,
  mockupToLineItems,
  nearestVertex,
  pixelsPerFoot,
  removePoint,
  ROOFLINE,
  shapeAt,
  WARM_WHITE,
  wreathHandle,
  wreathSizeFromHandle,
} from '@/lib/christmas/mockup-geometry'
import { loadMockupAssets, paintMockup } from '@/lib/christmas/mockup-render'

const isTypingTarget = (target) =>
  Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'))

/* Long edge cap — fast on an iPad, sharp enough to text a customer, small enough to save. */
const MAX_PHOTO_EDGE = 2000

const MOCKUP_FILENAME = 'christmas-lights-mockup.jpg'

const MOCKUPS_API = '/api/christmas/invoices/mockups'

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `shape-${Date.now()}-${Math.random()}`

const isFinishable = (draft) => Boolean(draft) && draft.points.length >= minPointsFor(draft.service)

// ─── Images ──────────────────────────────────────────────────────────────────

/** Decodes a photo file or blob and scales it down to MAX_PHOTO_EDGE on a canvas. */
async function loadPhoto(blob) {
  const url = URL.createObjectURL(blob)
  try {
    const source = new Image()
    source.src = url
    try {
      await source.decode()
    } catch {
      throw new Error('That file could not be opened as a photo.')
    }
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(source.naturalWidth, source.naturalHeight))
    const scaled = document.createElement('canvas')
    scaled.width = Math.round(source.naturalWidth * scale)
    scaled.height = Math.round(source.naturalHeight * scale)
    scaled.getContext('2d').drawImage(source, 0, 0, scaled.width, scaled.height)
    return scaled
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function canvasToJpeg(canvas, quality = 0.85) {
  const response = await fetch(canvas.toDataURL('image/jpeg', quality))
  return response.blob()
}

/** The finished picture as a JPEG, with no editing dots. */
function renderMockupJpeg(state) {
  const out = document.createElement('canvas')
  out.width = state.image.width
  out.height = state.image.height
  paintMockup(out, { ...state, draft: null, selectedId: null, scaleDraft: null, showGuides: false })
  return canvasToJpeg(out)
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = MOCKUP_FILENAME
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Opens the iPad/phone share sheet (Messages, Mail, AirDrop); falls back to a download. */
async function shareBlob(blob) {
  const file = new File([blob], MOCKUP_FILENAME, { type: 'image/jpeg' })
  if (!navigator.canShare?.({ files: [file] })) {
    downloadBlob(blob)
    return
  }
  try {
    await navigator.share({ files: [file], title: 'Your Christmas lights' })
  } catch {
    // Closing the share sheet throws AbortError — nothing to do.
  }
}

// ─── Editor state ────────────────────────────────────────────────────────────

/* Paints the working canvas whenever anything visible changes. */
function useCanvasPaint(canvasRef, paintState, zoom) {
  /* Bumped when the canvas changes size on screen, so guide dots repaint at a finger-friendly size. */
  const [viewTick, setViewTick] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(() => setViewTick((tick) => tick + 1))
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [canvasRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !paintState.image) {
      return
    }
    const frame = requestAnimationFrame(() => {
      const displayWidth = canvas.getBoundingClientRect().width || canvas.width
      paintMockup(canvas, { ...paintState, showGuides: true, guideScale: canvas.width / displayWidth })
    })
    return () => cancelAnimationFrame(frame)
  }, [canvasRef, paintState, viewTick, zoom])
}

/*
 * All drawing state and pointer handling. A tap near a dot of the line being
 * drawn (or the picked shape) drags that dot; any other tap adds a point, or
 * starts a new shape with the current service and color. While setting the
 * scale, taps place (or drag) the two ends of the measuring line instead.
 */
function useMockupEditor(canvasRef, zoom) {
  const dragRef = useRef(null)
  const [image, setImage] = useState(null)
  const [assets, setAssets] = useState(null)
  const [service, setService] = useState(ROOFLINE)
  const [color, setColor] = useState(WARM_WHITE)
  const [shapes, setShapes] = useState([])
  const [draft, setDraft] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  /* The dot last tapped on the picked string — { id, index } — for Remove dot. */
  const [activeVertex, setActiveVertex] = useState(null)
  const [night, setNight] = useState(75)
  const [bulbRadius, setBulbRadius] = useState(3)
  const [scale, setScale] = useState(null)
  /* null when not measuring; otherwise the 0–2 points tapped so far. */
  const [scaleDraft, setScaleDraft] = useState(null)

  const selected = shapes.find((shape) => shape.id === selectedId) || null
  const pxPerFoot = pixelsPerFoot(scale)
  const activeDot = activeVertex && activeVertex.id === selectedId ? activeVertex : null

  const paintState = useMemo(
    () => ({ image, assets, shapes, draft, selectedId, activeDot, night, bulbRadius, scale, scaleDraft }),
    [image, assets, shapes, draft, selectedId, activeDot, night, bulbRadius, scale, scaleDraft],
  )
  useCanvasPaint(canvasRef, paintState, zoom)

  useEffect(() => {
    const load = async () => {
      try {
        setAssets(await loadMockupAssets())
      } catch (error) {
        console.error('[christmas/mockup] bulb art failed to load; using drawn bulbs', error)
      }
    }
    load()
  }, [])

  /** Shows a photo — fresh (default bulb size, no lights) or reopened with saved lights. */
  const startPhoto = useCallback(
    (photo, saved = null) => {
      canvasRef.current.width = photo.width
      canvasRef.current.height = photo.height
      setImage(photo)
      setShapes(saved?.shapes || [])
      setDraft(null)
      setSelectedId(null)
      setScale(saved?.scale || null)
      setScaleDraft(null)
      setNight(saved?.night ?? 75)
      setBulbRadius(saved?.bulbRadius || defaultBulbRadius(photo.width, photo.height))
    },
    [canvasRef],
  )

  const toImagePoint = (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  /* Touch reach in image pixels — about 22 screen px, so a finger can grab a dot. */
  const reach = () => (22 * canvasRef.current.width) / canvasRef.current.getBoundingClientRect().width

  /* Finishing leaves nothing picked, so the editing dots go away. Tap the lights in the list to edit them again. */
  const finishDraft = useCallback(() => {
    if (isFinishable(draft)) {
      setShapes((current) => [...current, draft])
    }
    setDraft(null)
  }, [draft])

  const beginDrag = (event, drag) => {
    dragRef.current = drag
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onMeasureTap = (event, point) => {
    const vertex = nearestVertex(scaleDraft, point, reach())
    if (vertex !== -1) {
      beginDrag(event, { kind: 'scale', vertex })
    } else {
      setScaleDraft(scaleDraft.length < 2 ? [...scaleDraft, point] : [point])
    }
  }

  /* A tap while drawing: grab one of the line's dots, or add the next point. */
  const onDraftTap = (event, point) => {
    const vertex = nearestVertex(draft.points, point, reach())
    if (vertex === -1) {
      setDraft({ ...draft, points: [...draft.points, point] })
    } else {
      beginDrag(event, { kind: 'draft', vertex })
    }
  }

  /*
   * A tap on the picked string: a dot drags that dot, the line itself drags
   * out a new bend, and inside a tree outline drags the whole tree. Returns
   * false when the tap missed it.
   */
  const onSelectedTap = (event, point) => {
    const tolerance = reach()
    if (isPlacedItem(selected.service)) {
      if (distance(wreathHandle(selected), point) <= tolerance) {
        beginDrag(event, { kind: 'resize', id: selected.id })
        return true
      }
      if (hitTestShape(selected, point, tolerance)) {
        beginDrag(event, { kind: 'move', id: selected.id, last: point })
        return true
      }
      return false
    }
    const vertex = nearestVertex(selected.points, point, tolerance)
    if (vertex !== -1) {
      beginDrag(event, { kind: 'shape', id: selected.id, vertex, start: point, moved: false })
      return true
    }
    const hit = hitTestShape(selected, point, tolerance)
    if (hit?.kind === 'segment') {
      beginDrag(event, { kind: 'bend', id: selected.id, insertAt: hit.insertAt, start: point })
      return true
    }
    if (hit) {
      beginDrag(event, { kind: 'move', id: selected.id, last: point })
      return true
    }
    return false
  }

  const onPointerDown = (event) => {
    if (!image) {
      return
    }
    event.preventDefault()
    const point = toImagePoint(event)
    if (scaleDraft) {
      onMeasureTap(event, point)
      return
    }
    if (draft) {
      onDraftTap(event, point)
      return
    }
    if (selected && onSelectedTap(event, point)) {
      return
    }
    setActiveVertex(null)
    const tapped = shapeAt(shapes, point, reach())
    if (tapped || selected) {
      // Tap a placed string to pick it; tap empty photo to let go.
      setSelectedId(tapped?.id || null)
      return
    }
    const shape = { id: newId(), service, color, seed: Math.floor(Math.random() * 1e9), points: [point] }
    if (isPlacedItem(service)) {
      // A wreath is placed in one tap and stays picked, so it can be dragged and sized right away.
      const size = defaultWreathSize(image.width, image.height, pxPerFoot)
      setShapes((current) => [...current, { ...shape, size }])
      setSelectedId(shape.id)
      beginDrag(event, { kind: 'move', id: shape.id, last: point })
      return
    }
    setDraft(shape)
  }

  const updateShape = (id, change) =>
    setShapes((current) => current.map((shape) => (shape.id === id ? change(shape) : shape)))

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag) {
      return
    }
    const point = toImagePoint(event)
    const moveVertex = (points) => points.map((existing, index) => (index === drag.vertex ? point : existing))

    if (drag.kind === 'scale') {
      setScaleDraft((current) => current && moveVertex(current))
    } else if (drag.kind === 'draft') {
      setDraft((current) => current && { ...current, points: moveVertex(current.points) })
    } else if (drag.kind === 'bend') {
      // Only add the bend once the finger actually moves, so a plain tap on the line changes nothing.
      if (distance(point, drag.start) > reach() / 3) {
        updateShape(drag.id, (shape) => ({
          ...shape,
          points: insertPoint(shape.points, drag.insertAt, point),
        }))
        dragRef.current = { kind: 'shape', id: drag.id, vertex: drag.insertAt, moved: true }
        setActiveVertex(null)
      }
    } else if (drag.kind === 'resize') {
      updateShape(drag.id, (shape) => ({ ...shape, size: wreathSizeFromHandle(shape, point) }))
    } else if (drag.kind === 'move') {
      const dx = point.x - drag.last.x
      const dy = point.y - drag.last.y
      drag.last = point
      updateShape(drag.id, (shape) => ({
        ...shape,
        points: shape.points.map((existing) => ({ x: existing.x + dx, y: existing.y + dy })),
      }))
    } else {
      drag.moved ||= distance(point, drag.start || point) > reach() / 3
      updateShape(drag.id, (shape) => ({ ...shape, points: moveVertex(shape.points) }))
    }
  }

  const onPointerUp = () => {
    const drag = dragRef.current
    // A dot tapped without dragging becomes the active dot, which "Remove dot" (or Delete) takes out.
    if (drag?.kind === 'shape' && !drag.moved) {
      setActiveVertex({ id: drag.id, index: drag.vertex })
    }
    dragRef.current = null
  }

  const removeActiveVertex = () => {
    if (!activeVertex) {
      return
    }
    updateShape(activeVertex.id, (shape) => removePoint(shape, activeVertex.index))
    setActiveVertex(null)
  }

  /** Tapping away from the photo and controls: finish what's drawn and hide the editing dots. */
  const clearSelection = useCallback(() => {
    if (isFinishable(draft)) {
      setShapes((current) => [...current, draft])
      setDraft(null)
    }
    setSelectedId(null)
  }, [draft])

  useEffect(() => {
    const onKey = (event) => {
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedId &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault()
        if (activeDot) {
          updateShape(activeDot.id, (shape) => removePoint(shape, activeDot.index))
          setActiveVertex(null)
        } else {
          setShapes((current) => current.filter((shape) => shape.id !== selectedId))
          setSelectedId(null)
        }
      } else if (event.key === 'Enter') {
        finishDraft()
      } else if (event.key === 'Escape') {
        setDraft(null)
        setScaleDraft(null)
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finishDraft, selectedId, activeDot])

  const undo = () => {
    if (draft) {
      setDraft(draft.points.length > 1 ? { ...draft, points: draft.points.slice(0, -1) } : null)
      return
    }
    setShapes((current) => current.slice(0, -1))
    setSelectedId(null)
  }

  const chooseService = (next) => {
    setService(next)
    setDraft((current) => current && { ...current, service: next })
    /* Picking a service means "draw something new" — let go of the picked lights so a color change doesn't hit them. */
    setSelectedId(null)
  }

  /* Color applies to what you're working on: the line being drawn, the picked shape, and new shapes. */
  const chooseColor = (next) => {
    setColor(next)
    setDraft((current) => current && { ...current, color: next })
    setShapes((current) =>
      current.map((shape) => (shape.id === selectedId ? { ...shape, color: next } : shape)),
    )
  }

  const setSelectedSize = (size) =>
    setShapes((current) => current.map((shape) => (shape.id === selectedId ? { ...shape, size } : shape)))

  const setAllColors = (next) => {
    setColor(next)
    setDraft((current) => current && { ...current, color: next })
    setShapes((current) => current.map((shape) => ({ ...shape, color: next })))
  }

  const toggleSelected = (id) => {
    setDraft(null)
    setSelectedId((current) => (current === id ? null : id))
  }

  const removeShape = (id) => {
    setShapes((current) => current.filter((shape) => shape.id !== id))
    setSelectedId((current) => (current === id ? null : current))
  }

  const startMeasure = () => {
    setDraft(null)
    setSelectedId(null)
    setScaleDraft(scale ? [scale.a, scale.b] : [])
  }

  /** Locks in the measuring line and sizes the bulbs to match real C9s at that scale. */
  const applyScale = (feet) => {
    if (scaleDraft?.length !== 2 || !(feet > 0) || !distance(scaleDraft[0], scaleDraft[1])) {
      return
    }
    const next = { a: scaleDraft[0], b: scaleDraft[1], feet }
    setScale(next)
    setBulbRadius(bulbRadiusForScale(pixelsPerFoot(next)))
    setScaleDraft(null)
  }

  /* Every shape that will show in the finished picture, including a finishable line still being drawn. */
  const finishedShapes = () => (isFinishable(draft) ? [...shapes, draft] : shapes)

  /** What gets saved, and what the export renders. */
  const snapshot = () => ({ image, assets, shapes: finishedShapes(), night, bulbRadius, scale })

  return {
    image,
    shapes,
    draft,
    selectedId,
    night,
    bulbRadius,
    scale,
    scaleDraft,
    pxPerFoot,
    serviceValue: draft?.service || service,
    colorValue: draft?.color || selected?.color || color,
    colorLabel: selected && !draft ? 'Color (picked lights)' : 'Color',
    startPhoto,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    finishDraft,
    canFinish: isFinishable(draft),
    selectedService: selected?.service || null,
    selectedSize: selected && isPlacedItem(selected.service) ? selected.size : null,
    setSelectedSize,
    canRemoveDot: Boolean(activeDot) && selected.points.length > minPointsFor(selected.service),
    removeActiveVertex,
    cancelDraft: () => setDraft(null),
    clearSelection,
    undo,
    chooseService,
    chooseColor,
    setAllColors,
    setNight,
    setBulbRadius,
    toggleSelected,
    removeShape,
    startMeasure,
    applyScale,
    cancelMeasure: () => setScaleDraft(null),
    finishedShapes,
    snapshot,
  }
}

// ─── Zoom and pan ────────────────────────────────────────────────────────────

const MIN_ZOOM = 1
const MAX_ZOOM = 8

/*
 * Scroll (or trackpad pinch) zooms toward the pointer. Holding the space bar —
 * or the hand button, for iPads without a keyboard — turns dragging into
 * panning. The view is a CSS transform on the photo's wrapper; pointer math
 * uses the canvas's on-screen box, so drawing stays exact at any zoom.
 */
function useZoomPan(stageRef, wrapperRef) {
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 })
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [handMode, setHandMode] = useState(false)
  const [panning, setPanning] = useState(false)
  const panRef = useRef(null)
  const panMode = spaceHeld || handMode

  /** Zooms by `factor`, keeping the stage point (px, py) fixed on screen. */
  const zoomAt = useCallback((factor, px, py) => {
    setView((current) => {
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.zoom * factor))
      if (zoom === MIN_ZOOM) {
        return { zoom, x: 0, y: 0 }
      }
      const ratio = zoom / current.zoom
      return { zoom, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio }
    })
  }, [])

  const stagePoint = (clientX, clientY) => {
    const wrapper = wrapperRef.current
    const stage = stageRef.current.getBoundingClientRect()
    return { x: clientX - stage.left - wrapper.offsetLeft, y: clientY - stage.top - wrapper.offsetTop }
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) {
      return
    }
    // Non-passive so the page doesn't scroll while zooming the photo.
    const onWheel = (event) => {
      event.preventDefault()
      const point = stagePoint(event.clientX, event.clientY)
      zoomAt(Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0015)), point.x, point.y)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
    // stagePoint only reads refs.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [stageRef, zoomAt])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== 'Space' || isTypingTarget(event.target)) {
        return
      }
      // Stops page scroll, and stops a focused button from being "clicked" by the space bar.
      event.preventDefault()
      setSpaceHeld(true)
    }
    const onKeyUp = (event) => {
      if (event.code === 'Space') {
        setSpaceHeld(false)
      }
    }
    const onBlur = () => setSpaceHeld(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  /* Capture phase on the stage, so a pan drag never reaches the canvas as a tap. */
  const onPointerDownCapture = (event) => {
    // The zoom buttons sit inside the stage; let their clicks through.
    if (!panMode || event.target.closest?.('[data-mockup-controls]')) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    panRef.current = { startX: event.clientX, startY: event.clientY, x: view.x, y: view.y }
    event.currentTarget.setPointerCapture(event.pointerId)
    setPanning(true)
  }

  const onPointerMove = (event) => {
    const pan = panRef.current
    if (!pan) {
      return
    }
    setView((current) => ({
      ...current,
      x: pan.x + event.clientX - pan.startX,
      y: pan.y + event.clientY - pan.startY,
    }))
  }

  const endPan = () => {
    panRef.current = null
    setPanning(false)
  }

  const zoomFromCenter = (factor) => {
    const wrapper = wrapperRef.current
    zoomAt(factor, wrapper.clientWidth / 2, wrapper.clientHeight / 2)
  }

  const cursorClass = panning ? 'cursor-grabbing' : panMode ? 'cursor-grab' : ''

  return {
    view,
    panMode,
    handMode,
    cursorClass,
    toggleHand: () => setHandMode((current) => !current),
    zoomIn: () => zoomFromCenter(1.5),
    zoomOut: () => zoomFromCenter(1 / 1.5),
    fit: () => setView({ zoom: 1, x: 0, y: 0 }),
    stageHandlers: {
      onPointerDownCapture,
      onPointerMove,
      onPointerUp: endPan,
      onPointerCancel: endPan,
    },
  }
}

// ─── Saving ──────────────────────────────────────────────────────────────────

/* Where a save goes: the saved mockup itself, the invoice's mockup, or a new one. */
function saveTarget(mockupId, invoice) {
  if (mockupId) {
    return { url: `${MOCKUPS_API}/${mockupId}`, method: 'PUT' }
  }
  if (invoice) {
    return { url: `/api/christmas/invoices/${invoice.id}/mockup`, method: 'PUT' }
  }
  return { url: MOCKUPS_API, method: 'POST' }
}

/*
 * Saves mockups to the database and reopens saved ones: the photo, the traced
 * lights, the scale, and the finished picture. A mockup can belong to an
 * invoice or stand on its own under a customer or address name.
 */
function useMockupSaving({ invoice, savedMockup, editor }) {
  const [mockupId, setMockupId] = useState(savedMockup?.id || null)
  const [title, setTitle] = useState(savedMockup?.title || invoice?.customerName || '')
  const [loadingSaved, setLoadingSaved] = useState(Boolean(savedMockup))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const { startPhoto } = editor

  useEffect(() => {
    if (!savedMockup) {
      return
    }
    const reopen = async () => {
      try {
        const response = await fetch(
          `${MOCKUPS_API}/${savedMockup.id}/photo?v=${encodeURIComponent(savedMockup.updatedAt)}`,
        )
        if (!response.ok) {
          throw new Error('The saved photo could not be loaded.')
        }
        startPhoto(await loadPhoto(await response.blob()), savedMockup.state)
        setStatus({ message: `Last saved ${new Date(savedMockup.updatedAt).toLocaleString()}` })
      } catch (error) {
        setStatus({ error: error.message })
      } finally {
        setLoadingSaved(false)
      }
    }
    reopen()
  }, [savedMockup, startPhoto])

  /** Saves and returns the mockup id, or null. `fallbackTitle` names an unnamed mockup (e.g. the chosen invoice's customer). */
  const save = async ({ fallbackTitle = '' } = {}) => {
    const snapshot = editor.snapshot()
    if (!snapshot.image) {
      return null
    }
    const name = title.trim() || fallbackTitle.trim()
    if (!invoice && !mockupId && !name) {
      setStatus({ error: 'Give it a name first — the customer or the address.' })
      return null
    }
    setSaving(true)
    setStatus(null)
    try {
      const form = new FormData()
      form.set('title', name)
      form.set(
        'state',
        JSON.stringify({
          shapes: snapshot.shapes,
          night: snapshot.night,
          bulbRadius: snapshot.bulbRadius,
          scale: snapshot.scale,
        }),
      )
      form.set('photo', await canvasToJpeg(snapshot.image, 0.82), 'photo.jpg')
      form.set('rendered', await renderMockupJpeg(snapshot), MOCKUP_FILENAME)
      const target = saveTarget(mockupId, invoice)
      const response = await fetch(target.url, { method: target.method, body: form })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || 'Save failed.')
      }
      const savedId = payload.mockup?.id || mockupId
      if (!mockupId && savedId) {
        setMockupId(savedId)
        setTitle(name)
        // Keep the address pointing at this mockup so a refresh reopens it.
        window.history.replaceState(null, '', `/christmas/mockup?id=${savedId}`)
      }
      setStatus({ message: invoice ? `Saved to ${invoice.invoiceNumber}` : `Saved “${name}”` })
      return savedId
    } catch (error) {
      setStatus({ error: error.message })
      return null
    } finally {
      setSaving(false)
    }
  }

  return { mockupId, title, setTitle, loadingSaved, saving, status, save }
}

/* Estimator prices, shared by everyone and saved to the database when one changes. */
function useEstimatorRates(initialRates) {
  const [rates, setRates] = useState(initialRates || {})
  const [status, setStatus] = useState('')

  const changeRate = async (service, cents) => {
    if ((rates[service] || 0) === cents) {
      return
    }
    const next = { ...rates, [service]: cents }
    setRates(next)
    setStatus('Saving prices…')
    try {
      const response = await fetch(`${MOCKUPS_API}/rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: next }),
      })
      setStatus(response.ok ? 'Prices saved.' : 'Prices did not save.')
    } catch {
      setStatus('Prices did not save.')
    }
  }

  return { rates, status, changeRate }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChristmasMockupClient({ invoice = null, savedMockup = null, initialRates = {} }) {
  const router = useRouter()
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const stageRef = useRef(null)
  const wrapperRef = useRef(null)
  const viewport = useZoomPan(stageRef, wrapperRef)
  const editor = useMockupEditor(canvasRef, viewport.view.zoom)
  const saver = useMockupSaving({ invoice, savedMockup, editor })
  const pricing = useEstimatorRates(initialRates)
  const [photoError, setPhotoError] = useState('')
  const [shareSupported, setShareSupported] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const { clearSelection } = editor

  useEffect(() => {
    setShareSupported(typeof navigator.canShare === 'function')
  }, [])

  /* A tap anywhere except the photo and the controls hides the editing dots. */
  useEffect(() => {
    const onPointerDown = (event) => {
      if (
        viewport.panMode ||
        event.target === canvasRef.current ||
        event.target.closest?.('[data-mockup-controls]')
      ) {
        return
      }
      clearSelection()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [clearSelection, viewport.panMode])

  const estimateOptions = { pxPerFoot: editor.pxPerFoot, rates: pricing.rates, bulbRadius: editor.bulbRadius }
  const estimate = estimateMockup(editor.finishedShapes(), estimateOptions)

  const pickPhoto = () => fileInputRef.current?.click()

  const onPhotoChosen = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    setPhotoError('')
    try {
      editor.startPhoto(await loadPhoto(file))
    } catch (error) {
      setPhotoError(error.message)
    }
  }

  /*
   * Saves the mockup, then opens the quote with its lights added. `target` is
   * the invoice to add to, or null for a new invoice. A mockup already tied to
   * an invoice always goes to that invoice.
   */
  const addLightsToQuote = async (target) => {
    const destination = invoice || target
    const mockupId = await saver.save({ fallbackTitle: destination?.customerName || 'New quote' })
    if (!mockupId) {
      return
    }
    if (destination && !invoice) {
      const response = await fetch(`/api/christmas/invoices/${destination.id}/mockup/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mockupId }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setPhotoError(payload.error || 'Could not attach the mockup to that invoice.')
        return
      }
    }
    try {
      localStorage.setItem(
        MOCKUP_LINE_ITEMS_STORAGE_KEY,
        JSON.stringify({
          items: mockupToLineItems(editor.finishedShapes(), estimateOptions),
          mockupId: destination ? null : mockupId,
        }),
      )
    } catch {
      // Private mode can block storage; the quote just opens without the new lines.
    }
    router.push(
      destination
        ? `/christmas/invoices?edit=${destination.id}&fromMockup=1`
        : '/christmas/invoices?fromMockup=1',
    )
  }

  const sendToQuote = () => (invoice ? addLightsToQuote(null) : setQuoteOpen(true))

  const { image } = editor

  return (
    <div className="flex flex-col gap-4 p-4 lg:h-full lg:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3" data-mockup-controls>
        <div className="min-w-0">
          {invoice ? (
            <Link
              className="text-muted-foreground inline-flex items-center gap-1 text-xs hover:underline"
              href={`/christmas/invoices?edit=${invoice.id}`}
            >
              <ArrowLeft className="size-3" />
              Back to {invoice.invoiceNumber}
            </Link>
          ) : null}
          <h1 className="truncate text-xl font-semibold">
            Lights mockup{saver.title ? ` — ${saver.title}` : ''}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setSavedOpen(true)} size="sm" variant="outline">
            <FolderOpen className="mr-1.5 size-4" />
            Saved mockups
          </Button>
          <Button onClick={pickPhoto} size="sm" variant={image ? 'outline' : 'default'}>
            <Camera className="mr-1.5 size-4" />
            {image ? 'New photo' : 'Take or pick a photo'}
          </Button>
        </div>
        <input accept="image/*" className="hidden" onChange={onPhotoChosen} ref={fileInputRef} type="file" />
      </header>

      {photoError ? <p className="text-destructive text-sm">{photoError}</p> : null}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-h-0 flex-col gap-3">
          {/* The photo always fits inside this box, whatever its size or shape. */}
          <div
            className={`bg-muted/30 relative h-[55dvh] overflow-hidden rounded-2xl border lg:h-auto lg:min-h-0 lg:flex-1 ${viewport.cursorClass}`}
            ref={stageRef}
            {...viewport.stageHandlers}
          >
            <div
              className="absolute inset-2 flex origin-top-left items-center justify-center"
              ref={wrapperRef}
              style={{
                transform: `translate(${viewport.view.x}px, ${viewport.view.y}px) scale(${viewport.view.zoom})`,
              }}
            >
              <canvas
                aria-label="House photo. Tap to place lights."
                className={
                  image
                    ? `block max-h-full max-w-full touch-none rounded-lg select-none ${viewport.panMode ? '' : 'cursor-crosshair'}`
                    : 'hidden'
                }
                onPointerCancel={editor.onPointerUp}
                onPointerDown={editor.onPointerDown}
                onPointerMove={editor.onPointerMove}
                onPointerUp={editor.onPointerUp}
                ref={canvasRef}
              />
              {image ? null : <EmptyPhoto loading={saver.loadingSaved} onPick={pickPhoto} />}
            </div>
            {image ? <ZoomControls viewport={viewport} /> : null}
          </div>
          {image ? (
            <div data-mockup-controls>
              {editor.scaleDraft ? (
                <MeasureBar
                  key={editor.scaleDraft.length === 2 ? 'ready' : 'tapping'}
                  onApply={editor.applyScale}
                  onCancel={editor.cancelMeasure}
                  points={editor.scaleDraft}
                />
              ) : (
                <DrawToolbar
                  canRemoveDot={editor.canRemoveDot}
                  draft={editor.draft}
                  onRemoveDot={editor.removeActiveVertex}
                  selectedService={editor.selectedService}
                  hasShapes={editor.shapes.length > 0}
                  onCancel={editor.cancelDraft}
                  onFinish={editor.canFinish ? editor.finishDraft : null}
                  onMeasure={editor.startMeasure}
                  onUndo={editor.undo}
                  scaleFeet={editor.scale?.feet}
                />
              )}
            </div>
          ) : null}
        </div>

        <aside
          className="bg-card flex min-h-0 min-w-0 flex-col gap-4 rounded-2xl border p-4"
          data-mockup-controls
        >
          <div className="grid min-h-0 flex-1 content-start gap-4 lg:overflow-y-auto">
            <ChoiceButtons
              label="Service"
              onChange={editor.chooseService}
              options={CHRISTMAS_SERVICE_TYPES}
              value={editor.serviceValue}
            />
            <ChoiceButtons
              label={editor.colorLabel}
              onChange={editor.chooseColor}
              options={CHRISTMAS_LIGHT_COLORS}
              renderIcon={(option) => <ColorSwatch color={option} />}
              value={editor.colorValue}
            />
            <div className="-mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {CHRISTMAS_LIGHT_COLORS.map((option) => (
                <button
                  className="text-muted-foreground text-xs hover:underline disabled:opacity-50"
                  disabled={!editor.shapes.length}
                  key={option}
                  onClick={() => editor.setAllColors(option)}
                  type="button"
                >
                  All {option.toLowerCase()}
                </button>
              ))}
            </div>
            <LabeledSlider
              id="night-label"
              label="Nighttime"
              max={100}
              min={0}
              onChange={editor.setNight}
              value={editor.night}
            />
            <LabeledSlider
              id="bulb-label"
              label="Bulb size"
              max={10}
              min={1}
              onChange={editor.setBulbRadius}
              step={0.5}
              value={editor.bulbRadius}
            />
            {editor.selectedSize ? (
              <LabeledSlider
                id="wreath-size-label"
                label="Wreath size"
                max={Math.round(Math.min(editor.image.width, editor.image.height) * 0.6)}
                min={20}
                onChange={editor.setSelectedSize}
                value={editor.selectedSize}
              />
            ) : null}
            <ShapeList
              bulbRadius={editor.bulbRadius}
              onRemove={editor.removeShape}
              onSelect={editor.toggleSelected}
              pxPerFoot={editor.pxPerFoot}
              selectedId={editor.selectedId}
              shapes={editor.shapes}
            />
            <EstimatePanel
              estimate={estimate}
              onMeasure={editor.startMeasure}
              onRateChange={pricing.changeRate}
              rates={pricing.rates}
              ratesStatus={pricing.status}
            />
          </div>

          <Actions
            hasImage={Boolean(image)}
            hasWork={estimate.lines.length > 0}
            invoice={invoice}
            needsTitle={!invoice}
            onDownload={async () => downloadBlob(await renderMockupJpeg(editor.snapshot()))}
            onSave={saver.save}
            onSendToQuote={sendToQuote}
            onShare={async () => shareBlob(await renderMockupJpeg(editor.snapshot()))}
            onTitleChange={saver.setTitle}
            saving={saver.saving}
            shareSupported={shareSupported}
            status={saver.status}
            title={saver.title}
          />
        </aside>
      </div>

      <SavedMockupsDialog onOpenChange={setSavedOpen} open={savedOpen} />
      <QuoteTargetDialog
        busy={saver.saving}
        onOpenChange={setQuoteOpen}
        onPick={async (target) => {
          await addLightsToQuote(target)
          setQuoteOpen(false)
        }}
        open={quoteOpen}
      />
    </div>
  )
}
