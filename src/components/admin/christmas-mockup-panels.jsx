'use client'

/*
 * Presentational pieces of the Christmas lights mockup page. State and
 * behavior live in christmas-mockup-client.jsx.
 */

import { useEffect, useState } from 'react'

import {
  Camera,
  Check,
  Download,
  FileText,
  Hand,
  Loader2,
  Maximize,
  Minus,
  Plus,
  Ruler,
  Save,
  Share2,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

import { ESTIMATE_UNITS, formatFeet, measureShape, SCALE_PRESETS } from '@/lib/christmas/mockup-geometry'

const SERVICE_HINTS = {
  'Tree lights': 'Tap around the tree to trace its outline, then tap Finish.',
  'Stake lights': 'Tap along the walkway or bed where stakes go, then tap Finish.',
  'Roofline / ridge': 'Tap each corner along the roofline or ridge, then tap Finish.',
  Garland: 'Tap along the railing, door, or porch edge, then tap Finish.',
}

const SWATCH_CLASS = {
  'Warm white': 'bg-[#ffc46b]',
  'Bright white': 'bg-[#eef6ff]',
  Multicolor: 'bg-[conic-gradient(#ff2b2b,#1fd65f,#3b82f6,#ffb000,#e447ff,#ff2b2b)]',
}

const money = (cents) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((Number(cents) || 0) / 100)

export function ColorSwatch({ color }) {
  return (
    <span aria-hidden="true" className={`size-3.5 shrink-0 rounded-full border ${SWATCH_CLASS[color]}`} />
  )
}

export function ChoiceButtons({ label, options, value, onChange, renderIcon }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm leading-none font-medium">{label}</legend>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map((option) => (
          <Button
            aria-pressed={value === option}
            className="min-w-0 justify-start px-2.5"
            key={option}
            onClick={() => onChange(option)}
            size="sm"
            variant={value === option ? 'default' : 'outline'}
          >
            {renderIcon ? renderIcon(option) : null}
            <span className="truncate">{option}</span>
          </Button>
        ))}
      </div>
    </fieldset>
  )
}

/* The shared Slider's range and thumb are near-white; color them so the fill is visible. */
const SLIDER_CLASS =
  '[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-track]]:bg-muted-foreground/20'

export function LabeledSlider({ id, label, min, max, step = 1, value, onChange }) {
  return (
    <div className="grid gap-2.5">
      <Label id={id}>{label}</Label>
      <Slider
        aria-labelledby={id}
        className={SLIDER_CLASS}
        max={max}
        min={min}
        onValueChange={([next]) => onChange(next)}
        step={step}
        value={[value]}
      />
    </div>
  )
}

export function EmptyPhoto({ onPick, loading }) {
  return (
    <button
      className="text-muted-foreground flex size-full flex-col items-center justify-center gap-3 p-6 text-center"
      disabled={loading}
      onClick={onPick}
      type="button"
    >
      {loading ? <Loader2 className="size-10 animate-spin" /> : <Camera className="size-10" />}
      <span className="text-base font-medium">
        {loading ? 'Opening the saved mockup…' : 'Take or pick a photo of the house'}
      </span>
      {loading ? null : <span className="text-sm">A straight-on daytime shot of the front works best.</span>}
    </button>
  )
}

const toolbarHint = (draft, selectedService) => {
  if (draft) {
    return SERVICE_HINTS[draft.service]
  }
  if (selectedService) {
    return selectedService === 'Tree lights'
      ? 'Drag a dot to reshape, drag the edge to add a dot, drag inside to move the tree.'
      : 'Drag a dot to move it, drag the line to add a bend, tap a dot then Remove dot.'
  }
  return 'Pick a service and tap the photo to start. Tap placed lights to edit them.'
}

export function DrawToolbar({
  draft,
  selectedService,
  hasShapes,
  scaleFeet,
  canRemoveDot,
  onRemoveDot,
  onUndo,
  onCancel,
  onFinish,
  onMeasure,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-muted-foreground mr-auto text-sm">{toolbarHint(draft, selectedService)}</p>
      <Button onClick={onMeasure} size="sm" variant="outline">
        <Ruler className="mr-1.5 size-4" />
        {scaleFeet ? `Scale: ${Math.round(scaleFeet * 10) / 10} ft` : 'Set scale'}
      </Button>
      {selectedService ? (
        <Button disabled={!canRemoveDot} onClick={onRemoveDot} size="sm" variant="outline">
          <X className="mr-1.5 size-4" />
          Remove dot
        </Button>
      ) : null}
      <Button disabled={!draft && !hasShapes} onClick={onUndo} size="sm" variant="outline">
        <Undo2 className="mr-1.5 size-4" />
        Undo
      </Button>
      {draft ? (
        <Button onClick={onCancel} size="sm" variant="ghost">
          <X className="mr-1.5 size-4" />
          Cancel
        </Button>
      ) : null}
      <Button disabled={!onFinish} onClick={onFinish || undefined} size="sm">
        <Check className="mr-1.5 size-4" />
        Finish
      </Button>
    </div>
  )
}

/*
 * Setting the scale: tap both ends of something with a known size, then say
 * how long it is (a preset, or feet + inches).
 */
export function MeasureBar({ points, onApply, onCancel }) {
  const [feet, setFeet] = useState('')
  const [inches, setInches] = useState('')
  const ready = points.length === 2
  const total = (Number(feet) || 0) + (Number(inches) || 0) / 12

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-300 bg-cyan-50 p-2 text-sm">
      <Ruler className="size-4 shrink-0 text-cyan-700" />
      {ready ? (
        <>
          <span className="font-medium">How long is that?</span>
          {SCALE_PRESETS.map((preset) => (
            <Button key={preset.label} onClick={() => onApply(preset.feet)} size="sm" variant="outline">
              {preset.label}
            </Button>
          ))}
          <div className="flex items-center gap-1">
            <Input
              aria-label="Feet"
              className="h-8 w-16"
              inputMode="decimal"
              onChange={(event) => setFeet(event.target.value)}
              placeholder="ft"
              value={feet}
            />
            <Input
              aria-label="Inches"
              className="h-8 w-16"
              inputMode="decimal"
              onChange={(event) => setInches(event.target.value)}
              placeholder="in"
              value={inches}
            />
            <Button disabled={!(total > 0)} onClick={() => onApply(total)} size="sm">
              Set
            </Button>
          </div>
        </>
      ) : (
        <span className="mr-auto">
          Tap both ends of something you know the size of — the height of the front door, or the width of the
          garage door. {points.length === 1 ? 'Now tap the other end.' : ''}
        </span>
      )}
      <Button className="ml-auto" onClick={onCancel} size="sm" variant="ghost">
        <X className="mr-1.5 size-4" />
        Cancel
      </Button>
    </div>
  )
}

export function ShapeList({ shapes, selectedId, pxPerFoot, bulbRadius, onSelect, onRemove }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-medium">Lights on this house</h2>
      {shapes.length ? null : <p className="text-muted-foreground text-sm">Nothing drawn yet.</p>}
      {shapes.map((shape, index) => (
        <div
          className={`flex items-center gap-2 rounded-lg border py-1 pr-1 pl-2 text-sm ${
            shape.id === selectedId ? 'border-primary bg-primary/5' : ''
          }`}
          key={shape.id}
        >
          <button
            aria-pressed={shape.id === selectedId}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            onClick={() => onSelect(shape.id)}
            type="button"
          >
            <ColorSwatch color={shape.color} />
            <span className="truncate">
              {index + 1}. {shape.service}
              {pxPerFoot ? (
                <span className="text-muted-foreground">
                  {' '}
                  · {formatFeet(measureShape(shape, pxPerFoot, bulbRadius))} {ESTIMATE_UNITS[shape.service]}
                </span>
              ) : null}
            </span>
          </button>
          <Button
            className="size-8"
            onClick={() => onRemove(shape.id)}
            size="icon"
            title="Remove these lights"
            variant="ghost"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
    </section>
  )
}

function RateInput({ service, unit, cents, onCommit }) {
  const [value, setValue] = useState(cents ? String(cents / 100) : '')

  useEffect(() => {
    setValue(cents ? String(cents / 100) : '')
  }, [cents])

  return (
    <label className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground min-w-0 flex-1 truncate">{service}</span>
      <span className="text-muted-foreground">$</span>
      <Input
        aria-label={`${service} price per ${unit}`}
        className="h-7 w-16 px-2 text-xs"
        inputMode="decimal"
        onBlur={() => onCommit(service, Math.round((Number(value) || 0) * 100))}
        onChange={(event) => setValue(event.target.value)}
        placeholder="0"
        value={value}
      />
      <span className="text-muted-foreground w-12">/ {unit === 'stakes' ? 'stake' : 'ft'}</span>
    </label>
  )
}

/*
 * The estimate: measured quantity per service + color, priced from the shared
 * per-unit rates. Rates save when a price box loses focus.
 */
export function EstimatePanel({ estimate, rates, ratesStatus, onRateChange, onMeasure }) {
  if (!estimate.lines.length) {
    return null
  }
  if (!estimate.measured) {
    return (
      <section className="grid gap-2 rounded-xl border border-dashed p-3">
        <h2 className="text-sm font-medium">Estimate</h2>
        <p className="text-muted-foreground text-xs">Set a scale to measure feet and price this job.</p>
        <Button onClick={onMeasure} size="sm" variant="outline">
          <Ruler className="mr-1.5 size-4" />
          Set scale
        </Button>
      </section>
    )
  }

  const services = [...new Map(estimate.lines.map((line) => [line.service, line.unit])).entries()]

  return (
    <section className="grid gap-2 rounded-xl border p-3">
      <h2 className="text-sm font-medium">Estimate</h2>
      <ul className="grid gap-1 text-xs">
        {estimate.lines.map((line) => (
          <li className="flex items-center gap-2" key={`${line.service}|${line.color}`}>
            <ColorSwatch color={line.color} />
            <span className="min-w-0 flex-1 truncate">
              {line.service}{' '}
              <span className="text-muted-foreground">
                {line.quantity} {line.unit}
              </span>
            </span>
            <span className="font-mono tabular-nums">{money(line.amountCents)}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
        <span>Total</span>
        <span className="font-mono tabular-nums">{money(estimate.totalCents)}</span>
      </div>
      <div className="grid gap-1.5 border-t pt-2">
        <span className="text-muted-foreground text-xs font-medium">Your prices</span>
        {services.map(([service, unit]) => (
          <RateInput
            cents={rates[service]}
            key={service}
            onCommit={onRateChange}
            service={service}
            unit={unit}
          />
        ))}
        {ratesStatus ? <span className="text-muted-foreground text-xs">{ratesStatus}</span> : null}
      </div>
      <p className="text-muted-foreground text-xs">
        Measured from one photo, so it's an estimate. Lines far from the scale object read less exact. Check
        on site before the final price.
      </p>
    </section>
  )
}

export function Actions({
  invoice,
  needsTitle,
  title,
  onTitleChange,
  hasImage,
  hasWork,
  shareSupported,
  saving,
  status,
  onSave,
  onShare,
  onDownload,
  onSendToQuote,
}) {
  return (
    <div className="grid gap-2">
      {needsTitle ? (
        <Input
          aria-label="Mockup name"
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Name: customer or address"
          value={title}
        />
      ) : null}
      <Button disabled={!hasImage || saving} onClick={onSave}>
        {saving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Save className="mr-1.5 size-4" />}
        {invoice ? 'Save to invoice' : 'Save mockup'}
      </Button>
      {status ? (
        <p className={`text-center text-xs ${status.error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {status.error || status.message}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {shareSupported ? (
          <Button disabled={!hasImage} onClick={onShare} size="sm" variant="outline">
            <Share2 className="mr-1.5 size-4" />
            Share
          </Button>
        ) : null}
        <Button
          className={shareSupported ? '' : 'col-span-2'}
          disabled={!hasImage}
          onClick={onDownload}
          size="sm"
          variant="outline"
        >
          <Download className="mr-1.5 size-4" />
          Download
        </Button>
      </div>
      <Button disabled={!hasWork || saving} onClick={onSendToQuote} size="sm" variant="outline">
        <FileText className="mr-1.5 size-4" />
        <span className="truncate">
          {invoice ? 'Save and add lights to quote' : 'Add lights to a new quote'}
        </span>
      </Button>
    </div>
  )
}

/** Saved mockups from the database, newest first. Opening one reloads the page on it. */
export function SavedMockupsDialog({ open, onOpenChange }) {
  const [state, setState] = useState({ loading: false, mockups: [], error: '' })

  useEffect(() => {
    if (!open) {
      return
    }
    const controller = new AbortController()
    const load = async () => {
      setState({ loading: true, mockups: [], error: '' })
      try {
        const response = await fetch('/api/christmas/invoices/mockups', { signal: controller.signal })
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error || 'Could not load saved mockups.')
        }
        setState({ loading: false, mockups: payload.mockups || [], error: '' })
      } catch (error) {
        if (error.name !== 'AbortError') {
          setState({ loading: false, mockups: [], error: error.message })
        }
      }
    }
    load()
    return () => controller.abort()
  }, [open])

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Saved mockups</DialogTitle>
          <DialogDescription>Open one to keep working on it.</DialogDescription>
        </DialogHeader>
        {state.loading ? <Loader2 className="mx-auto size-6 animate-spin" /> : null}
        {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
        {!state.loading && !state.error && !state.mockups.length ? (
          <p className="text-muted-foreground text-sm">No saved mockups yet.</p>
        ) : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {state.mockups.map((mockup) => (
            <li key={mockup.id}>
              <a
                aria-label={`Open ${mockup.title || 'untitled mockup'}`}
                className="hover:border-primary block overflow-hidden rounded-xl border"
                href={`/christmas/mockup?id=${mockup.id}`}
              >
                {/* oxlint-disable-next-line next/no-img-element -- auth-gated API image; next/image can't fetch it */}
                <img
                  alt=""
                  className="bg-muted aspect-video w-full object-cover"
                  loading="lazy"
                  src={`/api/christmas/invoices/mockups/${mockup.id}/rendered?v=${encodeURIComponent(mockup.updatedAt)}`}
                />
                <span className="block p-2 text-sm">
                  <span className="block truncate font-medium">{mockup.title || 'Untitled'}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {mockup.invoiceNumber ? `${mockup.invoiceNumber} · ` : ''}
                    {new Date(mockup.updatedAt).toLocaleString()}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

/** Zoom and pan buttons over the photo — the touch-friendly twin of scroll-to-zoom and space-to-pan. */
export function ZoomControls({ viewport }) {
  return (
    <div
      className="bg-background/90 absolute right-3 bottom-3 flex items-center gap-1 rounded-full border p-1 shadow-sm backdrop-blur"
      data-mockup-controls
      onPointerDownCapture={(event) => event.stopPropagation()}
    >
      <Button
        aria-label="Zoom out"
        className="size-8 rounded-full"
        onClick={viewport.zoomOut}
        size="icon"
        variant="ghost"
      >
        <Minus className="size-4" />
      </Button>
      <span className="w-11 text-center font-mono text-xs tabular-nums">
        {Math.round(viewport.view.zoom * 100)}%
      </span>
      <Button
        aria-label="Zoom in"
        className="size-8 rounded-full"
        onClick={viewport.zoomIn}
        size="icon"
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
      <Button
        aria-label="Fit photo"
        className="size-8 rounded-full"
        onClick={viewport.fit}
        size="icon"
        title="Fit"
        variant="ghost"
      >
        <Maximize className="size-4" />
      </Button>
      <Button
        aria-label="Pan"
        aria-pressed={viewport.handMode}
        className="size-8 rounded-full"
        onClick={viewport.toggleHand}
        size="icon"
        title="Drag to move around (or hold the space bar)"
        variant={viewport.handMode ? 'default' : 'ghost'}
      >
        <Hand className="size-4" />
      </Button>
    </div>
  )
}

/*
 * Where "Add lights to a quote" sends the lights: a new invoice, or one of the
 * recent invoices. Picking an existing invoice also attaches the mockup to it.
 */
export function QuoteTargetDialog({ open, onOpenChange, onPick, busy }) {
  const [state, setState] = useState({ loading: false, invoices: [], error: '' })
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }
    const controller = new AbortController()
    const load = async () => {
      setState({ loading: true, invoices: [], error: '' })
      try {
        const response = await fetch('/api/christmas/invoices', { signal: controller.signal })
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error || 'Could not load invoices.')
        }
        setState({ loading: false, invoices: payload.invoices || [], error: '' })
      } catch (error) {
        if (error.name !== 'AbortError') {
          setState({ loading: false, invoices: [], error: error.message })
        }
      }
    }
    load()
    return () => controller.abort()
  }, [open])

  const needle = query.trim().toLowerCase()
  const matches = state.invoices
    .filter((invoice) =>
      !needle
        ? true
        : [invoice.customerName, invoice.invoiceNumber, invoice.propertyAddress]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(needle)),
    )
    .slice(0, 30)

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add these lights to…</DialogTitle>
          <DialogDescription>The mockup is saved and attached to the invoice you pick.</DialogDescription>
        </DialogHeader>
        <Button disabled={busy} onClick={() => onPick(null)}>
          {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <FileText className="mr-1.5 size-4" />}
          A new invoice
        </Button>
        <div className="grid gap-2">
          <Label htmlFor="quote-target-search">Or an existing invoice</Label>
          <Input
            id="quote-target-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customer, invoice #, or address"
            value={query}
          />
          {state.loading ? <Loader2 className="mx-auto size-5 animate-spin" /> : null}
          {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
          <ul className="grid gap-1">
            {matches.map((invoice) => (
              <li key={invoice.id}>
                <button
                  className="hover:bg-muted flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm disabled:opacity-50"
                  disabled={busy}
                  onClick={() => onPick(invoice)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{invoice.customerName || 'No name'}</span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {invoice.invoiceNumber}
                      {invoice.propertyAddress ? ` · ${invoice.propertyAddress}` : ''}
                    </span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs capitalize">{invoice.status}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
