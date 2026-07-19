'use client'

import { Children, cloneElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  Copy,
  Download,
  Eye,
  FileText,
  History,
  Loader2,
  Mail,
  MailCheck,
  MailOpen,
  MailWarning,
  Maximize2,
  Plus,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import SystemLayoutEditor from '@/components/admin/system-layout-editor'
import ZohoContactTypeahead from '@/components/admin/zoho-contact-typeahead'
import { UTILITY_PROVIDER_OPTIONS, computeQuote, defaultRebateForUtility } from '@/lib/quotes/calc'

// ─── Constants ────────────────────────────────────────────────────────────────

const UTILITY_OPTIONS = UTILITY_PROVIDER_OPTIONS

const EMPTY_FORM = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  propertyAddress: '',
  propertyCity: '',
  propertyState: 'TX',
  propertyZip: '',
  utilityProvider: 'Austin Energy',
  utilityProviderOther: '',
  utilityRebate: String(defaultRebateForUtility('Austin Energy')),
  panelMakeModel: '',
  panelWatts: '',
  panelQuantity: '',
  inverterMakeModel: '',
  inverterQuantity: '1',
  batteryMakeModel: '',
  batteryQuantity: '',
  rackingSystem: '',
  rackingQuantity: '',
  monitoringSystem: '',
  monitoringQuantity: '',
  warrantyDetails: '25-Year Panel Product and Performance Warranty',
  annualProductionKwh: '',
  annualConsumptionKwh: '',
  utilityRate: '0.12',
  rateEscalation: '0.04',
  buybackRate: '0',
  systemPrice: '',
  discount: '',
  systemLayoutMode: 'map',
  systemLayout: null,
  systemLayoutUrl: '',
  repSignature: '',
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const num = (value) => new Intl.NumberFormat('en-US').format(Number(value || 0))

const shortDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Chicago',
      }).format(new Date(value))
    : ''

// ─── Module-level helpers ─────────────────────────────────────────────────────

const getFieldValue = (event) => (event?.target ? event.target.value : event)

const isQuoteComputable = (panelQuantity, panelWatts, systemPrice) =>
  Number(panelQuantity) > 0 && Number(panelWatts) > 0 && Number(systemPrice) > 0

const buildSaveRequest = (editingId) => ({
  url: editingId ? `/api/quotes/${editingId}` : '/api/quotes',
  method: editingId ? 'PUT' : 'POST',
})

const formatIntegrationBit = (label, result) => {
  if (!result) {
    return null
  }
  if (result.ok) {
    return result.created ? `${label} created` : `${label} synced`
  }
  if (result.skipped) {
    return `${label} skipped`
  }
  return `${label} failed`
}

const buildSaveNotice = (editingId, quoteNumber, results) => {
  const base = editingId ? `Quote ${quoteNumber} updated.` : `Quote ${quoteNumber} saved.`
  if (!results) {
    return base
  }
  const bits = [
    formatIntegrationBit('Sheet', results.sheet),
    formatIntegrationBit('CRM', results.crm),
    formatIntegrationBit('WorkDrive', results.workdrive),
  ].filter(Boolean)
  if (bits.length === 0) {
    return base
  }
  return `${base} ${bits.join(' · ')}.`
}

const resolveEditPreload = (quotes, editId, dupeId) => {
  const targetId = editId ?? dupeId
  return quotes.find((q) => String(q.id) === String(targetId)) ?? null
}

const optionalNumber = (value, fallback = 0) => (value === '' ? '' : Number(value) || fallback)

const formDataToInputs = (form) => {
  const utilityProvider = form.utilityProvider === 'Other' ? form.utilityProviderOther : form.utilityProvider
  return {
    ...form,
    utilityProvider,
    panelWatts: Number(form.panelWatts) || 0,
    panelQuantity: Number(form.panelQuantity) || 0,
    inverterQuantity: optionalNumber(form.inverterQuantity),
    batteryQuantity: optionalNumber(form.batteryQuantity),
    annualProductionKwh: Number(form.annualProductionKwh) || 0,
    annualConsumptionKwh: Number(form.annualConsumptionKwh) || 0,
    utilityRate: Number(form.utilityRate) || 0.12,
    rateEscalation: Number(form.rateEscalation) || 0.04,
    buybackRate: Number(form.buybackRate) || 0,
    systemPrice: Number(form.systemPrice) || 0,
    discount: Number(form.discount) || 0,
    utilityRebate: optionalNumber(form.utilityRebate),
    systemLayoutMode: form.systemLayoutMode === 'upload' ? 'upload' : 'map',
    systemLayout: form.systemLayout && typeof form.systemLayout === 'object' ? form.systemLayout : null,
    systemLayoutUrl: form.systemLayoutUrl || '',
  }
}

const assignInputToForm = (next, key, value) => {
  if (key === 'systemLayout') {
    next.systemLayout = value && typeof value === 'object' ? value : null
    return
  }
  if (key === 'systemLayoutMode') {
    next.systemLayoutMode = value === 'upload' ? 'upload' : 'map'
    return
  }
  if (key === 'systemLayoutUrl' || key === 'repSignature') {
    next[key] = value || ''
    return
  }
  next[key] = value === null || value === undefined ? '' : String(value)
}

const resolveUtilityFields = (inputs) => {
  const known = UTILITY_OPTIONS.includes(inputs.utilityProvider)
  const utilityProvider = known ? inputs.utilityProvider : inputs.utilityProvider ? 'Other' : 'Austin Energy'
  const utilityProviderOther = known ? '' : inputs.utilityProvider || ''
  const resolvedName = utilityProvider === 'Other' ? utilityProviderOther || 'Other' : utilityProvider
  const hasStoredRebate =
    inputs.utilityRebate !== undefined && inputs.utilityRebate !== null && inputs.utilityRebate !== ''
  return {
    utilityProvider,
    utilityProviderOther,
    utilityRebate: hasStoredRebate
      ? String(inputs.utilityRebate)
      : String(defaultRebateForUtility(resolvedName)),
  }
}

const quoteToForm = (quote) => {
  const inputs = quote?.data?.inputs || {}
  const next = { ...EMPTY_FORM }
  for (const [key, value] of Object.entries(inputs)) {
    assignInputToForm(next, key, value)
  }
  return { ...next, ...resolveUtilityFields(inputs) }
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function sendQuoteEmail(id, email, message) {
  const response = await fetch(`/api/quotes/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, message }),
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error || 'Send failed')
  }
  return payload.results
}

// ─── Custom hooks ─────────────────────────────────────────────────────────────

function useLiveMathPreview(form) {
  return useMemo(() => computeQuote(formDataToInputs(form)), [form])
}

function usePdfTemplatePreview(form, rightTab) {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false)
  const [pdfPreviewError, setPdfPreviewError] = useState(null)
  const timerRef = useRef(null)
  const urlRef = useRef(null)

  useEffect(() => {
    if (rightTab !== 'template') {
      return
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(async () => {
      setPdfPreviewLoading(true)
      try {
        const response = await fetch('/api/quotes/preview-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: formDataToInputs(form) }),
        })
        if (response.ok) {
          const url = URL.createObjectURL(await response.blob())
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current)
          }
          urlRef.current = url
          setPdfPreviewUrl(url)
          setPdfPreviewError(null)
        } else {
          const payload = await response.json().catch(() => ({}))
          setPdfPreviewError(payload.error || `Preview failed (HTTP ${response.status})`)
        }
      } catch (fetchError) {
        setPdfPreviewError(fetchError.message || 'Preview request failed')
      } finally {
        setPdfPreviewLoading(false)
      }
    }, 800)
    return () => clearTimeout(timerRef.current)
  }, [form, rightTab])

  useEffect(
    () => () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
      }
    },
    [],
  )

  return { pdfPreviewUrl, pdfPreviewLoading, pdfPreviewError }
}

// ─── Primitive sub-components ─────────────────────────────────────────────────

function FieldRow({ children }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}

function Field({ label, hint, children }) {
  const id = useId()
  const child = Children.only(children)
  // Radix Select puts id on the root context — wire the trigger instead.
  const isSelect = Boolean(child?.props?.onValueChange)
  const control = isSelect
    ? child
    : cloneElement(child, { id, 'aria-label': child.props['aria-label'] || label })
  return (
    <div className="space-y-1.5">
      {isSelect ? (
        <Label className="text-muted-foreground text-xs font-medium">{label}</Label>
      ) : (
        <Label className="text-muted-foreground text-xs font-medium" htmlFor={id}>
          {label}
        </Label>
      )}
      {control}
      {hint ? <p className="text-muted-foreground/70 text-[11px]">{hint}</p> : null}
    </div>
  )
}

function StatusBadgeInline({ quote }) {
  if (quote.emailStatus === 'opened') {
    return (
      <Badge
        className="bg-emerald-600 hover:bg-emerald-600"
        title={`First opened ${shortDate(quote.openedAt)} · ${quote.openCount} open${quote.openCount === 1 ? '' : 's'}`}
      >
        <MailOpen className="mr-1 size-3" />
        Opened{quote.openCount > 1 ? ` ×${quote.openCount}` : ''}
      </Badge>
    )
  }
  if (quote.emailStatus === 'delivered') {
    return (
      <Badge className="bg-sky-600 hover:bg-sky-600" title={`Delivered ${shortDate(quote.deliveredAt)}`}>
        <MailCheck className="mr-1 size-3" />
        Delivered
      </Badge>
    )
  }
  if (quote.emailStatus === 'bounced' || quote.emailStatus === 'complained') {
    return (
      <Badge variant="destructive" title={`Email ${quote.emailStatus}`}>
        <MailWarning className="mr-1 size-3" />
        {quote.emailStatus === 'bounced' ? 'Bounced' : 'Complaint'}
      </Badge>
    )
  }
  if (quote.status === 'sent') {
    return (
      <Badge variant="outline" title={`Sent ${shortDate(quote.sentAt)} to ${quote.emailedTo || ''}`}>
        <Mail className="mr-1 size-3" />
        Sent
      </Badge>
    )
  }
  return <Badge variant="secondary">Draft</Badge>
}

function PostSaveBanner({ quote, onSend }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
      <span className="text-sm text-emerald-700 dark:text-emerald-400">
        {quote.quoteNumber} saved — ready to send.
      </span>
      <div className="flex items-center gap-2">
        <Button onClick={onSend} size="sm" variant="outline">
          <Mail className="mr-1.5 size-3.5" /> Send now
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/quotes/history">
            <History className="mr-1.5 size-3.5" /> All quotes
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Form card sub-components ──────────────────────────────────────────────────

function CustomerPropertyCard({
  form,
  set,
  onUtilityProviderChange,
  onSelectZohoContact,
  zohoConnected,
  zohoAuthEnabled,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer & Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FieldRow>
          <ZohoContactTypeahead
            onChange={(name) => set('customerName')(name)}
            onSelect={onSelectZohoContact}
            placeholder="Search Zoho contacts…"
            value={form.customerName}
            zohoAuthEnabled={zohoAuthEnabled}
            zohoConnected={zohoConnected}
          />
          <Field label="Email">
            <Input
              onChange={set('customerEmail')}
              placeholder="customer@email.com"
              type="email"
              value={form.customerEmail}
            />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Phone">
            <Input onChange={set('customerPhone')} placeholder="(512) 555-0100" value={form.customerPhone} />
          </Field>
          <Field label="Street address">
            <Input
              onChange={set('propertyAddress')}
              placeholder="345 Foresail Rd"
              value={form.propertyAddress}
            />
          </Field>
        </FieldRow>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="City">
            <Input onChange={set('propertyCity')} placeholder="Leander" value={form.propertyCity} />
          </Field>
          <Field label="State">
            <Input onChange={set('propertyState')} value={form.propertyState} />
          </Field>
          <Field label="ZIP">
            <Input onChange={set('propertyZip')} placeholder="78641" value={form.propertyZip} />
          </Field>
        </div>
        <FieldRow>
          <Field label="Utility provider">
            <Select onValueChange={onUtilityProviderChange} value={form.utilityProvider}>
              <SelectTrigger aria-label="Utility provider">
                <SelectValue placeholder="Select utility" />
              </SelectTrigger>
              <SelectContent>
                {UTILITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {form.utilityProvider === 'Other' ? (
            <Field label="Utility name">
              <Input
                onChange={set('utilityProviderOther')}
                placeholder="Utility company"
                value={form.utilityProviderOther}
              />
            </Field>
          ) : (
            <Field hint="Default for this provider — edit per quote as needed" label="Utility rebate ($)">
              <Input
                inputMode="decimal"
                onChange={set('utilityRebate')}
                placeholder="0"
                value={form.utilityRebate}
              />
            </Field>
          )}
        </FieldRow>
        {form.utilityProvider === 'Other' ? (
          <Field hint="One-time rebate for this custom utility — leave 0 if none" label="Utility rebate ($)">
            <Input
              inputMode="decimal"
              onChange={set('utilityRebate')}
              placeholder="0"
              value={form.utilityRebate}
            />
          </Field>
        ) : null}
        {form.utilityProvider === 'Austin Energy' ? (
          <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <Zap className="mr-1 inline size-3.5" />
            Austin Energy savings use Value of Solar credits at 9.91¢/kWh. Rebate defaults to $
            {defaultRebateForUtility('Austin Energy').toLocaleString()} and can be edited above.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function EquipmentLine({ label, description, qty, descriptionField, qtyField, set, form }) {
  return (
    <div className="border-border/60 grid grid-cols-1 gap-3 border-b pb-3 last:border-b-0 sm:grid-cols-[7rem_1fr_5rem] sm:items-end">
      <div className="text-foreground text-sm font-semibold tracking-wide uppercase sm:pb-2">{label}</div>
      <Field label="Description">
        <Input onChange={set(descriptionField)} placeholder={description} value={form[descriptionField]} />
      </Field>
      {qtyField ? (
        <Field label="Qty">
          <Input inputMode="numeric" onChange={set(qtyField)} placeholder={qty} value={form[qtyField]} />
        </Field>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  )
}

function propertyAddressLine(form) {
  return [form.propertyAddress, form.propertyCity, form.propertyState, form.propertyZip]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(', ')
}

function SystemEquipmentCard({ form, set, onLayoutChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">System Equipment</CardTitle>
        <CardDescription>
          Matches the PDF table — Equipment, Description, and Qty for each line.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="border-border/60 grid grid-cols-1 gap-3 border-b pb-3 sm:grid-cols-[7rem_1fr_5.5rem_5rem] sm:items-end">
          <div className="text-sm font-semibold tracking-wide uppercase sm:pb-2">Solar Panels</div>
          <Field label="Make & model *">
            <Input
              onChange={set('panelMakeModel')}
              placeholder="Mission Solar MSX10-435HN0B"
              value={form.panelMakeModel}
            />
          </Field>
          <Field label="Watts *">
            <Input
              inputMode="numeric"
              onChange={set('panelWatts')}
              placeholder="435"
              value={form.panelWatts}
            />
          </Field>
          <Field label="Qty *">
            <Input
              inputMode="numeric"
              onChange={set('panelQuantity')}
              placeholder="21"
              value={form.panelQuantity}
            />
          </Field>
        </div>
        <EquipmentLine
          description="[INVERTER MAKE & MODEL]"
          descriptionField="inverterMakeModel"
          form={form}
          label="Inverter"
          qty="1"
          qtyField="inverterQuantity"
          set={set}
        />
        <EquipmentLine
          description="[BATTERY MAKE & MODEL]"
          descriptionField="batteryMakeModel"
          form={form}
          label="Battery(ies)"
          qty="[QTY]"
          qtyField="batteryQuantity"
          set={set}
        />
        <EquipmentLine
          description="[RACKING SYSTEM]"
          descriptionField="rackingSystem"
          form={form}
          label="Racking"
          qty="[QTY]"
          qtyField="rackingQuantity"
          set={set}
        />
        <EquipmentLine
          description="[MONITORING SYSTEM]"
          descriptionField="monitoringSystem"
          form={form}
          label="Monitoring"
          qty="[QTY]"
          qtyField="monitoringQuantity"
          set={set}
        />
        <EquipmentLine
          description="[WARRANTY DETAILS]"
          descriptionField="warrantyDetails"
          form={form}
          label="Warranty"
          set={set}
        />
        <SystemLayoutEditor
          address={propertyAddressLine(form)}
          imageUrl={form.systemLayoutUrl}
          layout={form.systemLayout}
          mode={form.systemLayoutMode === 'upload' ? 'upload' : 'map'}
          onChange={onLayoutChange}
        />
      </CardContent>
    </Card>
  )
}

function EnergyPricingCard({ form, set }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Energy & Pricing</CardTitle>
        <CardDescription>
          System price drives Investment Summary, Cash Price, and savings on the PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field hint="Gross installed system price before any utility rebate" label="System price ($) *">
          <Input
            className="h-11 text-base font-semibold"
            inputMode="decimal"
            onChange={set('systemPrice')}
            placeholder="32130"
            value={form.systemPrice}
          />
        </Field>
        <Field hint="Optional — only shown on the quote when entered" label="Discount ($)">
          <Input
            inputMode="decimal"
            onChange={set('discount')}
            placeholder="Leave blank for none"
            value={form.discount}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field hint="From design tool (PVWatts, Aurora…)" label="Annual production (kWh)">
            <Input
              inputMode="numeric"
              onChange={set('annualProductionKwh')}
              placeholder="11707"
              value={form.annualProductionKwh}
            />
          </Field>
          <Field hint="From the customer's utility bills" label="Annual consumption (kWh)">
            <Input
              inputMode="numeric"
              onChange={set('annualConsumptionKwh')}
              placeholder="12910"
              value={form.annualConsumptionKwh}
            />
          </Field>
          <Field label="Utility rate ($/kWh)">
            <Input inputMode="decimal" onChange={set('utilityRate')} value={form.utilityRate} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field hint="Annual energy cost increase" label="Rate escalation">
            <Input inputMode="decimal" onChange={set('rateEscalation')} value={form.rateEscalation} />
          </Field>
          {form.utilityProvider !== 'Austin Energy' ? (
            <Field hint="$/kWh credited for exported solar" label="Buyback rate">
              <Input inputMode="decimal" onChange={set('buybackRate')} value={form.buybackRate} />
            </Field>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function RepSignaturePad({ value, onChange }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const initialValueRef = useRef(value)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#16324f'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (initialValueRef.current) {
      const image = new window.Image()
      image.addEventListener('load', () => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      })
      image.src = initialValueRef.current
    }
  }, [])

  const pointerPos = (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const source = event.touches?.[0] || event
    return {
      x: (source.clientX - rect.left) * scaleX,
      y: (source.clientY - rect.top) * scaleY,
    }
  }

  const handleStart = (event) => {
    event.preventDefault()
    drawingRef.current = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = pointerPos(event)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleMove = (event) => {
    if (!drawingRef.current) {
      return
    }
    event.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = pointerPos(event)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const handleEnd = () => {
    if (!drawingRef.current) {
      return
    }
    drawingRef.current = false
    onChange(canvasRef.current.toDataURL('image/png'))
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rep Signature</CardTitle>
        <CardDescription>
          Draw your signature — it appears on the quote PDF as Authorized Representative.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <canvas
          ref={canvasRef}
          aria-label="Representative signature pad"
          className="border-border w-full cursor-crosshair touch-none rounded-md border bg-white"
          height={140}
          onMouseDown={handleStart}
          onMouseLeave={handleEnd}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchEnd={handleEnd}
          onTouchMove={handleMove}
          onTouchStart={handleStart}
          width={480}
        />
        <div className="flex justify-end">
          <Button onClick={handleClear} size="sm" type="button" variant="outline">
            Clear signature
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Right-panel sub-components ────────────────────────────────────────────────

function LiveSummaryCard({ computed, canCompute }) {
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-base">Live Quote Summary</CardTitle>
        <CardDescription>
          {canCompute
            ? 'Updates as you type — matches the PDF numbers.'
            : 'Enter panel qty, watts, and system price to unlock save.'}
        </CardDescription>
      </CardHeader>
      {computed ? (
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">System size</span>
            <span className="font-semibold">{computed.systemSizeKw} kW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Annual production</span>
            <span className="font-semibold">{num(computed.annualProductionKwh)} kWh</span>
          </div>
          {computed.consumptionOffsetPct ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consumption offset</span>
              <span className="font-semibold">{computed.consumptionOffsetPct}%</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted-foreground">System price</span>
            <span className="font-semibold">{money(computed.systemPrice)}</span>
          </div>
          {computed.rebate > 0 ? (
            <div className="flex justify-between text-amber-700 dark:text-amber-400">
              <span>{computed.rebateLabel || 'Utility rebate'}</span>
              <span className="font-semibold">−{money(computed.rebate)}</span>
            </div>
          ) : null}
          {computed.discount > 0 ? (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>Discount</span>
              <span className="font-semibold">−{money(computed.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Net system price</span>
            <span className="font-bold">{money(computed.netSystemPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">First-year savings</span>
            <span className="font-semibold">{money(computed.firstYearSavings)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">25-year savings</span>
            <span className="font-semibold">{money(computed.lifetimeSavings)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Net lifetime benefit</span>
            <span className="font-semibold text-emerald-600">{money(computed.netLifetimeSavings)}</span>
          </div>
          {computed.paybackYears ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payback</span>
              <span className="font-semibold">{computed.paybackYears} yrs</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted-foreground">CO₂ offset (25 yr)</span>
            <span className="font-semibold">{num(computed.co2OffsetTons)} tons</span>
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}

function TemplatePdfCard({ url, loading, error, onExpand }) {
  return (
    <Card className="border-primary/30">
      <CardContent className="p-2">
        <div className="relative">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            {loading ? (
              <div className="bg-background/90 rounded-full p-1.5 shadow">
                <Loader2 className="text-muted-foreground size-4 animate-spin" />
              </div>
            ) : null}
            {url ? (
              <Button
                className="bg-background/90 shadow"
                onClick={onExpand}
                size="icon"
                title="Expand preview"
                variant="ghost"
              >
                <Maximize2 className="size-4" />
              </Button>
            ) : null}
          </div>
          {url ? (
            <iframe
              className="h-[75vh] w-full rounded-md border bg-white"
              src={`${url}#toolbar=0&navpanes=0`}
              title="Quote template preview"
            />
          ) : error ? (
            <div className="text-destructive flex h-[75vh] items-center justify-center px-6 text-center text-sm">
              {error}
            </div>
          ) : (
            <div className="text-muted-foreground flex h-[75vh] items-center justify-center text-sm">
              <Loader2 className="mr-2 size-4 animate-spin" /> Rendering preview…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Dialog sub-components ────────────────────────────────────────────────────

function SendResultRow({ label, result }) {
  const cls = result?.ok ? 'text-emerald-600' : result?.skipped ? 'text-muted-foreground' : 'text-destructive'
  const text = result ? (result.ok ? 'Done' : result.skipped ? 'Skipped' : result.error || 'Failed') : '—'
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={cls}>{text}</span>
    </div>
  )
}

function SendDialog({
  target,
  email,
  message,
  onEmailChange,
  onMessageChange,
  results,
  sending,
  onClose,
  onSend,
}) {
  return (
    <Dialog onOpenChange={(open) => (open ? null : onClose())} open={Boolean(target)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email quote {target?.quoteNumber}</DialogTitle>
          <DialogDescription>
            Emails the PDF to the customer and archives to Zoho under &ldquo;{target?.customerName}&rdquo;.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Send to">
            <Input onChange={onEmailChange} type="email" value={email} />
          </Field>
          <Field label="Personal note (optional)">
            <Textarea
              onChange={onMessageChange}
              placeholder="It was great meeting you — here's the quote we discussed."
              rows={3}
              value={message}
            />
          </Field>
          {results ? (
            <div className="space-y-1 rounded-md border p-3 text-xs">
              <SendResultRow label="Email" result={results.email} />
              <SendResultRow label="Zoho Sheet" result={results.sheet} />
              <SendResultRow label="CRM" result={results.crm} />
              <SendResultRow label="WorkDrive" result={results.workdrive} />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button disabled={sending || !email.trim()} onClick={onSend}>
            {sending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}
            Send email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function buildSentDescription(quote) {
  if (quote.openedAt) {
    return `Sent to ${quote.emailedTo || 'customer'} · first opened ${shortDate(quote.openedAt)}`
  }
  if (quote.deliveredAt) {
    return `Sent to ${quote.emailedTo || 'customer'} · delivered ${shortDate(quote.deliveredAt)}`
  }
  return `Sent to ${quote.emailedTo || 'customer'}`
}

function SavedQuotePreviewDialog({ quote, onClose, onDuplicate, onSend }) {
  const sentDesc = quote?.status === 'sent' ? buildSentDescription(quote) : 'Draft — not sent yet.'

  return (
    <Dialog onOpenChange={(open) => (open ? null : onClose())} open={Boolean(quote)}>
      <DialogContent className="flex h-[92vh] w-[94vw] max-w-[1100px]! flex-col sm:max-w-[1100px]!">
        <DialogHeader>
          <DialogTitle>
            {quote?.quoteNumber} — {quote?.customerName}
          </DialogTitle>
          <DialogDescription>{sentDesc}</DialogDescription>
        </DialogHeader>
        {quote ? (
          <iframe
            className="h-full min-h-0 w-full flex-1 rounded-md border bg-white"
            src={`/api/quotes/${quote.id}/pdf#toolbar=0&navpanes=0`}
            title={`Quote ${quote.quoteNumber} preview`}
          />
        ) : null}
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button onClick={() => onDuplicate(quote)} variant="outline">
            <Copy className="mr-2 size-4" /> Use as template
          </Button>
          <Button onClick={() => onSend(quote)}>
            <Mail className="mr-2 size-4" /> Send / Sign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ExpandedPreviewDialog({ open, url, onClose }) {
  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="flex h-[94vh] w-[96vw] max-w-[1200px]! flex-col sm:max-w-[1200px]!">
        <DialogHeader>
          <DialogTitle>Template preview</DialogTitle>
          <DialogDescription>Live preview — updates as you edit the form.</DialogDescription>
        </DialogHeader>
        {url ? (
          <iframe
            className="h-full min-h-0 w-full flex-1 rounded-md border bg-white"
            src={`${url}#toolbar=0&navpanes=0`}
            title="Expanded quote template preview"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function QuotesClient({
  initialQuotes = [],
  dbConfigured,
  dbError,
  editId,
  dupeId,
  zohoConnected = false,
  zohoAuthEnabled = false,
}) {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [quotes, setQuotes] = useState(initialQuotes)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [savedQuote, setSavedQuote] = useState(null)
  const [sendTarget, setSendTarget] = useState(null)
  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResults, setSendResults] = useState(null)
  const [previewQuote, setPreviewQuote] = useState(null)
  const [rightTab, setRightTab] = useState('summary')
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const computed = useLiveMathPreview(form)
  const { pdfPreviewUrl, pdfPreviewLoading, pdfPreviewError } = usePdfTemplatePreview(form, rightTab)

  useEffect(() => {
    const found = resolveEditPreload(initialQuotes, editId, dupeId)
    if (!found) {
      return
    }
    setForm(quoteToForm(found))
    setEditingId(editId ? found.id : null)
    setNotice(
      editId
        ? `Editing quote ${found.quoteNumber}.`
        : `Loaded ${found.quoteNumber} as a template — saving creates a new quote.`,
    )
    router.replace('/quotes', { scroll: false })
  }, [editId, dupeId, initialQuotes, router])

  const refreshQuotes = useCallback(async () => {
    try {
      const response = await fetch('/api/quotes')
      if (response.ok) {
        const json = await response.json()
        setQuotes(json.quotes || [])
      }
    } catch {
      // Non-fatal.
    }
  }, [])

  const canCompute = useMemo(
    () => isQuoteComputable(form.panelQuantity, form.panelWatts, form.systemPrice),
    [form.panelQuantity, form.panelWatts, form.systemPrice],
  )

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: getFieldValue(event) }))

  const handleLayoutChange = useCallback((next) => {
    setForm((prev) => ({
      ...prev,
      systemLayoutMode: next.mode === 'upload' ? 'upload' : 'map',
      systemLayout: next.layout ?? prev.systemLayout,
      systemLayoutUrl: next.imageUrl ?? '',
    }))
  }, [])

  const handleUtilityProviderChange = useCallback((value) => {
    setForm((prev) => {
      const resolvedName = value === 'Other' ? prev.utilityProviderOther || 'Other' : value
      return {
        ...prev,
        utilityProvider: value,
        utilityRebate: String(defaultRebateForUtility(resolvedName)),
      }
    })
  }, [])

  const handleSelectZohoContact = (contact) => {
    setForm((prev) => ({
      ...prev,
      customerName: contact.name || prev.customerName,
      customerEmail: contact.email || prev.customerEmail,
      customerPhone: contact.phone || prev.customerPhone,
      propertyAddress: contact.propertyAddress || prev.propertyAddress,
      propertyCity: contact.propertyCity || prev.propertyCity,
      propertyState: contact.propertyState || prev.propertyState || 'TX',
      propertyZip: contact.propertyZip || prev.propertyZip,
    }))
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setSavedQuote(null)
    setError(null)
  }

  const persistQuote = async () => {
    if (!form.customerName.trim()) {
      throw new Error('Customer name is required')
    }
    if (!canCompute) {
      throw new Error('Enter panel quantity, watts per panel, and system price to save')
    }
    const { url, method } = buildSaveRequest(editingId)
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: formDataToInputs(form) }),
    })
    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload.error || 'Save failed')
    }
    setNotice(buildSaveNotice(editingId, payload.quote.quoteNumber, payload.results))
    setSavedQuote(payload.quote)
    setEditingId(payload.quote.id)
    await refreshQuotes()
    return payload.quote
  }

  const openSendDialog = (quote) => {
    setSendTarget(quote)
    setSendEmail(quote.customerEmail || form.customerEmail || '')
    setSendMessage('')
    setSendResults(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      await persistQuote()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEmailClick = async () => {
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const quote = savedQuote?.id === editingId && savedQuote ? savedQuote : await persistQuote()
      openSendDialog(quote)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDuplicate = (quote) => {
    setForm(quoteToForm(quote))
    setEditingId(null)
    setNotice(`Loaded ${quote.quoteNumber} as a template — saving creates a new quote.`)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!sendTarget) {
      return
    }
    setSending(true)
    setSendResults(null)
    try {
      const results = await sendQuoteEmail(sendTarget.id, sendEmail, sendMessage)
      setSendResults(results)
      await refreshQuotes()
    } catch (sendError) {
      setSendResults({ email: { ok: false, error: sendError.message } })
    } finally {
      setSending(false)
    }
  }

  if (!dbConfigured) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Quotes</CardTitle>
            <CardDescription>
              Database is not configured. Set DATABASE_URL (or NEON_DATABASE_URL) and reload.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Solar Quotes</h1>
          <p className="text-muted-foreground text-sm">
            Build a quote, review the math, then email it and archive to Zoho in one step.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editingId ? (
            <Button onClick={resetForm} size="sm" variant="outline">
              <Plus className="mr-1.5 size-4" /> New quote
            </Button>
          ) : null}
          <Button asChild size="sm" variant="ghost">
            <Link href="/quotes/history">
              <History className="mr-1.5 size-4" /> History
            </Link>
          </Button>
        </div>
      </div>

      {dbError ? (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {dbError.message}
        </p>
      ) : null}
      {error ? (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}
      {notice && !savedQuote ? (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          {notice}
        </p>
      ) : null}
      {savedQuote ? (
        <PostSaveBanner
          onSend={() => {
            const q = savedQuote
            setSavedQuote(null)
            openSendDialog(q)
          }}
          quote={savedQuote}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <CustomerPropertyCard
            form={form}
            onSelectZohoContact={handleSelectZohoContact}
            onUtilityProviderChange={handleUtilityProviderChange}
            set={set}
            zohoAuthEnabled={zohoAuthEnabled}
            zohoConnected={zohoConnected}
          />
          <SystemEquipmentCard form={form} onLayoutChange={handleLayoutChange} set={set} />
          <EnergyPricingCard form={form} set={set} />
          <RepSignaturePad onChange={set('repSignature')} value={form.repSignature} />
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Tabs onValueChange={setRightTab} value={rightTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="template">Template preview</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <LiveSummaryCard canCompute={canCompute} computed={computed} />
            </TabsContent>
            <TabsContent value="template">
              <TemplatePdfCard
                error={pdfPreviewError}
                loading={pdfPreviewLoading}
                onExpand={() => setPreviewExpanded(true)}
                url={pdfPreviewUrl}
              />
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button disabled={saving} onClick={handleSave} size="lg" variant="outline">
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileText className="mr-2 size-4" />
              )}
              {editingId ? 'Update quote' : 'Save quote'}
            </Button>
            <Button disabled={saving} onClick={handleEmailClick} size="lg">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}
              Email quote
            </Button>
          </div>
          {!canCompute || !form.customerName.trim() ? (
            <p className="text-muted-foreground text-xs">
              Required to save/email: customer name, panel qty, watts/panel, and system price.
            </p>
          ) : null}
        </div>
      </div>

      {quotes.length > 0 ? (
        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">
              {quotes.length} saved quote{quotes.length === 1 ? '' : 's'}
            </span>
            {quotes[0] ? <StatusBadgeInline quote={quotes[0]} /> : null}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setPreviewQuote(quotes[0] ?? null)} size="sm" variant="ghost">
              <Eye className="mr-1.5 size-4" /> Latest
            </Button>
            {quotes[0] ? (
              <Button asChild size="sm" variant="outline">
                <a href={`/api/quotes/${quotes[0].id}/pdf`} rel="noreferrer" target="_blank">
                  <Download className="mr-1.5 size-4" /> Download latest
                </a>
              </Button>
            ) : null}
            <Button asChild size="sm">
              <Link href="/quotes/history">
                <History className="mr-1.5 size-4" /> View all
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <ExpandedPreviewDialog
        onClose={() => setPreviewExpanded(false)}
        open={previewExpanded}
        url={pdfPreviewUrl}
      />
      <SavedQuotePreviewDialog
        onClose={() => setPreviewQuote(null)}
        onDuplicate={(q) => {
          handleDuplicate(q)
          setPreviewQuote(null)
        }}
        onSend={(q) => {
          setPreviewQuote(null)
          openSendDialog(q)
        }}
        quote={previewQuote}
      />
      <SendDialog
        email={sendEmail}
        message={sendMessage}
        onClose={() => setSendTarget(null)}
        onEmailChange={(e) => setSendEmail(e.target.value)}
        onMessageChange={(e) => setSendMessage(e.target.value)}
        onSend={handleSend}
        results={sendResults}
        sending={sending}
        target={sendTarget}
      />
    </div>
  )
}
