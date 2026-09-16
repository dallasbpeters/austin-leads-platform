// oxlint-disable react-hooks/exhaustive-deps
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  Camera,
  Download,
  Eye,
  History,
  Loader2,
  Mail,
  Maximize2,
  Pencil,
  Plus,
  Save,
  Settings2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react'

import ZohoContactTypeahead from '@/components/admin/zoho-contact-typeahead'
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
import { Textarea } from '@/components/ui/textarea'

import {
  CHRISTMAS_LIGHT_COLORS,
  CHRISTMAS_SERVICE_TYPES,
  computeChristmasInvoice,
  optionsWithCurrent,
  presetLineItems,
} from '@/lib/christmas/invoice-calc'
import { MOCKUP_LINE_ITEMS_STORAGE_KEY, parseMockupHandoff } from '@/lib/christmas/mockup-geometry'

// ─── Formatters / helpers ────────────────────────────────────────────────────

const moneyCents = (cents) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100)

const todayISO = () => new Date().toISOString().split('T')[0]

const addDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const newKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `li-${Date.now()}-${Math.random().toString(36).slice(2)}`

const centsToInput = (cents) => (Number(cents || 0) / 100).toString()

const inputToCents = (value) => Math.round((Number(value) || 0) * 100)

const blankLineItem = () => ({
  key: newKey(),
  category: '',
  description: '',
  location: '',
  color: '',
  nr: '',
  quantity: '1',
  unitPrice: '',
})

const presetItemToFormLineItem = (item) => ({
  key: newKey(),
  category: item.category || '',
  description: item.description,
  location: item.location || '',
  color: item.color || '',
  nr: item.nr || '',
  quantity: String(item.quantity),
  unitPrice: centsToInput(item.unitPriceCents),
})

const blankPaymentMilestone = () => ({ key: newKey(), label: '', percent: '', date: '' })

const inputMilestoneToFormMilestone = (milestone) => ({
  key: milestone.key || newKey(),
  label: milestone.label || '',
  percent: String(milestone.percent ?? ''),
  date: milestone.date || '',
})

const inputLineItemToFormLineItem = (item) => ({
  key: item.key || newKey(),
  category: item.category || '',
  description: item.description || '',
  location: item.location || '',
  color: item.color || '',
  nr: item.nr || '',
  quantity: String(item.quantity ?? 1),
  unitPrice: centsToInput(item.unitPriceCents),
})

/** Best-effort split for invoices saved before the first/last name fields existed. */
const splitLegacyName = (fullName) => {
  const trimmed = String(fullName || '').trim()
  const spaceIndex = trimmed.indexOf(' ')
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: '' }
  }
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) }
}

/** Falls back to splitting the old combined name only when neither new field is present. */
const resolveLegacyName = (inputs) => {
  if (inputs.customerFirstName || inputs.customerLastName || !inputs.customerName) {
    return { firstName: '', lastName: '' }
  }
  return splitLegacyName(inputs.customerName)
}

const emptyForm = (settings, presets) => {
  const firstPreset = presets?.[0]
  const items = presetLineItems(firstPreset?.id || 'custom')
  return {
    templateKey: settings?.templateKey || 'christmas-classic',
    customerFirstName: '',
    customerLastName: '',
    customerEmail: '',
    customerPhone: '',
    propertyAddress: '',
    propertyCity: '',
    propertyState: 'TX',
    propertyZip: '',
    invoiceDate: todayISO(),
    dueDate: addDays(30),
    installDate: '',
    packageId: firstPreset?.id || 'custom',
    packageLabel: firstPreset?.label || 'Custom Package',
    lineItems: items.length ? items.map(presetItemToFormLineItem) : [blankLineItem()],
    deposit: '',
    notes: '',
    projectNumber: '',
    quoteCreatedBy: '',
    colorLights: '',
    quoteValidDays: '30',
    paymentMilestones: [],
  }
}

const formToInputs = (form) => ({
  templateKey: form.templateKey,
  customerFirstName: form.customerFirstName,
  customerLastName: form.customerLastName,
  customerEmail: form.customerEmail,
  customerPhone: form.customerPhone,
  propertyAddress: form.propertyAddress,
  propertyCity: form.propertyCity,
  propertyState: form.propertyState,
  propertyZip: form.propertyZip,
  invoiceDate: form.invoiceDate,
  dueDate: form.dueDate,
  installDate: form.installDate,
  packageId: form.packageId,
  packageLabel: form.packageLabel,
  lineItems: form.lineItems.map((item) => ({
    key: item.key,
    category: item.category,
    description: item.description,
    location: item.location,
    color: item.color,
    nr: item.nr,
    quantity: Number(item.quantity) || 0,
    unitPriceCents: inputToCents(item.unitPrice),
  })),
  depositCents: inputToCents(form.deposit),
  notes: form.notes,
  projectNumber: form.projectNumber,
  quoteCreatedBy: form.quoteCreatedBy,
  colorLights: form.colorLights,
  quoteValidDays: Number(form.quoteValidDays) || 30,
  paymentMilestones: form.paymentMilestones.map((milestone) => ({
    key: milestone.key,
    label: milestone.label,
    percent: Number(milestone.percent) || 0,
    date: milestone.date,
  })),
})

/* Debounce before re-rendering the preview PDF; each render is a full server-side PDF build. */
const PREVIEW_DEBOUNCE_MS = 1000

const orDefault = (value, fallback) => value || fallback

const inputsToForm = (inputs, settings) => {
  const legacy = resolveLegacyName(inputs)

  return {
    templateKey: orDefault(inputs.templateKey, orDefault(settings?.templateKey, 'christmas-classic')),
    customerFirstName: orDefault(inputs.customerFirstName, legacy.firstName),
    customerLastName: orDefault(inputs.customerLastName, legacy.lastName),
    customerEmail: orDefault(inputs.customerEmail, ''),
    customerPhone: orDefault(inputs.customerPhone, ''),
    propertyAddress: orDefault(inputs.propertyAddress, ''),
    propertyCity: orDefault(inputs.propertyCity, ''),
    propertyState: orDefault(inputs.propertyState, 'TX'),
    propertyZip: orDefault(inputs.propertyZip, ''),
    invoiceDate: orDefault(inputs.invoiceDate, todayISO()),
    dueDate: orDefault(inputs.dueDate, addDays(30)),
    installDate: orDefault(inputs.installDate, ''),
    packageId: orDefault(inputs.packageId, 'custom'),
    packageLabel: orDefault(inputs.packageLabel, 'Custom Package'),
    lineItems: orDefault(inputs.lineItems, []).map(inputLineItemToFormLineItem),
    deposit: centsToInput(inputs.depositCents),
    notes: orDefault(inputs.notes, ''),
    projectNumber: orDefault(inputs.projectNumber, ''),
    quoteCreatedBy: orDefault(inputs.quoteCreatedBy, ''),
    colorLights: orDefault(inputs.colorLights, ''),
    quoteValidDays: String(orDefault(inputs.quoteValidDays, 30)),
    paymentMilestones: orDefault(inputs.paymentMilestones, []).map(inputMilestoneToFormMilestone),
  }
}

/*
 * ?edit= / ?dupe= is resolved on the server into `preloadInvoice`, and these
 * seed the builder's initial state from it.
 */
const preloadForm = (preloadInvoice, settings, presets) =>
  preloadInvoice ? inputsToForm(preloadInvoice.data?.inputs || {}, settings) : emptyForm(settings, presets)

/*
 * List rows carry no `data` snapshot (listInvoices omits the column), so the
 * full invoice is fetched before the form is populated.
 */
const loadInvoiceInputs = async (invoice) => {
  if (invoice.data?.inputs) {
    return invoice.data.inputs
  }
  const response = await fetch(`/api/christmas/invoices/${invoice.id}`)
  if (!response.ok) {
    throw new Error('Could not load that invoice.')
  }
  const payload = await response.json()
  return payload.invoice?.data?.inputs || {}
}

const duplicateMessage = (invoiceNumber) =>
  `Loaded ${invoiceNumber} as a template — saving creates a new invoice.`

const preloadMessage = (preloadInvoice, dupeId) =>
  dupeId && preloadInvoice ? duplicateMessage(preloadInvoice.invoiceNumber) : ''

const preloadEditingId = (preloadInvoice, editId) => (editId && preloadInvoice ? preloadInvoice.id : null)

const isLoadingInvoice = (loadingInvoiceId, invoice) => Boolean(invoice) && loadingInvoiceId === invoice.id

const LINE_ITEMS_SECTION_ID = 'invoice-line-items'

/*
 * "Add lights to a quote" on the mockup page stashes one line per service +
 * color. A new invoice starts from just those lines (a custom package); an
 * existing invoice gets them added to its lines. The stash is cleared right
 * away so a refresh doesn't add them twice.
 *
 * Returns a ref holding a mockup id to link once a *new* invoice is saved.
 */
function useMockupLineItems({ fromMockup, isExistingInvoice, setForm, setMessage }) {
  const pendingMockupIdRef = useRef(null)

  useEffect(() => {
    if (!fromMockup) {
      return
    }
    let handoff
    try {
      handoff = parseMockupHandoff(localStorage.getItem(MOCKUP_LINE_ITEMS_STORAGE_KEY))
      localStorage.removeItem(MOCKUP_LINE_ITEMS_STORAGE_KEY)
    } catch {
      return
    }
    if (!handoff.items.length) {
      return
    }
    pendingMockupIdRef.current = isExistingInvoice ? null : handoff.mockupId
    const mockupLines = handoff.items.map(presetItemToFormLineItem)
    setForm((current) =>
      isExistingInvoice
        ? {
            ...current,
            lineItems: [
              ...current.lineItems.filter((item) => item.description || Number(item.unitPrice) > 0),
              ...mockupLines,
            ],
          }
        : { ...current, packageId: 'custom', packageLabel: 'Custom Package', lineItems: mockupLines },
    )
    const count = handoff.items.length
    setMessage(
      `Added ${count} line${count === 1 ? '' : 's'} from the lights mockup. Check the prices below, then save.`,
    )
    // Let the new lines render, then bring them into view.
    requestAnimationFrame(() =>
      document
        .querySelector(`#${LINE_ITEMS_SECTION_ID}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }, [fromMockup])

  return pendingMockupIdRef
}

// ─── Small presentational pieces ─────────────────────────────────────────────

function IntegrationResultsCard({ results }) {
  if (!results) {
    return null
  }
  const rows = [
    { label: 'Zoho Sheet', result: results.sheet },
    { label: 'Zoho WorkDrive', result: results.workdrive },
  ]
  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardContent className="space-y-2 p-4">
        {rows.map(({ label, result }) => {
          const cls = result?.ok
            ? 'text-emerald-700'
            : result?.skipped
              ? 'text-muted-foreground'
              : 'text-destructive'
          const text = result
            ? result.ok
              ? 'Synced'
              : result.skipped
                ? `Skipped — ${result.reason}`
                : result.error || 'Failed'
            : '—'
          return (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span className={cls}>{text}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

/**
 * Jobber is opt-in per invoice — pushed only when this button is clicked, not
 * automatically on every save. That way, if the Jobber trial expires and the
 * business doesn't subscribe, saving/emailing invoices keeps working exactly
 * as before; nothing depends on Jobber staying connected.
 */
function JobberPushCard({ invoice, onPush, pushing, result }) {
  const alreadySynced = Boolean(invoice?.jobberInvoiceId)
  const statusText = result
    ? result.ok
      ? 'Pushed to Jobber.'
      : result.skipped
        ? `Skipped — ${result.reason}`
        : result.error || 'Push failed.'
    : alreadySynced
      ? `Synced to Jobber${invoice.jobberSyncedAt ? ` — ${new Date(invoice.jobberSyncedAt).toLocaleString()}` : ''}`
      : 'Not pushed to Jobber yet.'
  const statusClass = (result ? result.ok : alreadySynced)
    ? 'text-emerald-700'
    : result?.skipped
      ? 'text-muted-foreground'
      : result && !result.ok
        ? 'text-destructive'
        : 'text-muted-foreground'

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Jobber</p>
            <p className={`text-xs ${statusClass}`}>{statusText}</p>
            {result?.note ? <p className="text-muted-foreground text-xs">{result.note}</p> : null}
          </div>
          <Button
            disabled={!invoice || pushing}
            onClick={onPush}
            size="sm"
            title={!invoice ? 'Save the invoice first' : undefined}
            variant="outline"
          >
            {pushing ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 size-4" />
            )}
            {alreadySynced ? 'Re-push to Jobber' : 'Push to Jobber'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function OptionSelect({ id, value, options, placeholder, onChange }) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {optionsWithCurrent(options, value).map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function LineItemRow({ item, index, onChange, onRemove }) {
  const itemAmountCents = inputToCents(item.unitPrice) * (Number(item.quantity) || 0)
  return (
    <div className="border-border bg-muted/20 space-y-2 rounded-xl border p-3">
      <div className="grid gap-1">
        <Label className="text-muted-foreground text-xs" htmlFor={`li-desc-${index}`}>
          Description
        </Label>
        <Input
          id={`li-desc-${index}`}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder={`Line item ${index + 1}`}
          value={item.description}
        />
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid min-w-36 flex-1 gap-1">
          <Label className="text-muted-foreground text-xs" htmlFor={`li-category-${index}`}>
            Service
          </Label>
          <OptionSelect
            id={`li-category-${index}`}
            onChange={(value) => onChange('category', value)}
            options={CHRISTMAS_SERVICE_TYPES}
            placeholder="Pick a service"
            value={item.category}
          />
        </div>
        <div className="grid min-w-28 flex-1 gap-1">
          <Label className="text-muted-foreground text-xs" htmlFor={`li-location-${index}`}>
            Location
          </Label>
          <Input
            id={`li-location-${index}`}
            onChange={(event) => onChange('location', event.target.value)}
            placeholder="Front yard"
            value={item.location}
          />
        </div>
        <div className="grid min-w-32 flex-1 gap-1">
          <Label className="text-muted-foreground text-xs" htmlFor={`li-color-${index}`}>
            Color
          </Label>
          <OptionSelect
            id={`li-color-${index}`}
            onChange={(value) => onChange('color', value)}
            options={CHRISTMAS_LIGHT_COLORS}
            placeholder="Pick a color"
            value={item.color}
          />
        </div>
        <div className="grid w-20 gap-1">
          <Label className="text-muted-foreground text-xs" htmlFor={`li-nr-${index}`}>
            N/R
          </Label>
          <Select onValueChange={(value) => onChange('nr', value)} value={item.nr}>
            <SelectTrigger id={`li-nr-${index}`}>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N">N</SelectItem>
              <SelectItem value="R">R</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-16 gap-1">
          <Label className="text-muted-foreground text-xs" htmlFor={`li-qty-${index}`}>
            Qty
          </Label>
          <Input
            id={`li-qty-${index}`}
            onChange={(event) => onChange('quantity', event.target.value)}
            value={item.quantity}
          />
        </div>
        <div className="grid w-24 gap-1">
          <Label className="text-muted-foreground text-xs" htmlFor={`li-price-${index}`}>
            Unit $
          </Label>
          <Input
            id={`li-price-${index}`}
            onChange={(event) => onChange('unitPrice', event.target.value)}
            value={item.unitPrice}
          />
        </div>
        <div className="grid w-20 gap-1">
          <span className="text-muted-foreground text-xs">Amount</span>
          <div className="text-foreground h-9 truncate pt-1.5 text-sm font-semibold">
            {moneyCents(itemAmountCents)}
          </div>
        </div>
        <Button className="mb-0" onClick={onRemove} size="icon" title="Remove line item" variant="ghost">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}

/*
 * Opens the lights mockup for this invoice. A saved invoice links its mockup
 * (and shows the saved picture); an unsaved one can still open a scratch
 * mockup, but saving needs an invoice to attach to.
 */
function MockupCard({ invoiceId, refreshKey = 0 }) {
  const [mockup, setMockup] = useState(null)

  useEffect(() => {
    setMockup(null)
    if (!invoiceId) {
      return
    }
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch(`/api/christmas/invoices/${invoiceId}/mockup`, {
          signal: controller.signal,
        })
        const payload = await response.json()
        setMockup(payload.mockup || null)
      } catch {
        // No thumbnail is fine — the button still opens the mockup.
      }
    }
    load()
    return () => controller.abort()
  }, [invoiceId, refreshKey])

  const href = invoiceId ? `/christmas/mockup?invoice=${invoiceId}` : '/christmas/mockup'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lights mockup</CardTitle>
        <CardDescription>
          {invoiceId
            ? 'Show the customer their house with lights, and save it with this invoice.'
            : 'Save the invoice first to keep a mockup with it.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockup ? (
          <Link className="block overflow-hidden rounded-xl border" href={href}>
            {/* oxlint-disable-next-line next/no-img-element -- auth-gated API image; next/image can't fetch it */}
            <img
              alt="Saved lights mockup"
              className="max-h-64 w-full object-contain"
              src={`/api/christmas/invoices/${invoiceId}/mockup/rendered?v=${encodeURIComponent(mockup.updatedAt)}`}
            />
          </Link>
        ) : null}
        <Button asChild size="sm" variant="outline">
          <Link href={href}>
            <Camera className="mr-1.5 size-4" />
            {mockup ? 'Edit mockup' : 'Open lights mockup'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function PaymentMilestoneRow({ milestone, index, onChange, onRemove }) {
  return (
    <div className="border-border bg-muted/20 flex flex-wrap items-end gap-2 rounded-xl border p-3">
      <div className="grid min-w-32 flex-1 gap-1">
        <Label className="text-muted-foreground text-xs" htmlFor={`pm-label-${index}`}>
          Label
        </Label>
        <Input
          id={`pm-label-${index}`}
          onChange={(event) => onChange('label', event.target.value)}
          placeholder={index === 0 ? 'Deposit' : 'Payment'}
          value={milestone.label}
        />
      </div>
      <div className="grid w-24 gap-1">
        <Label className="text-muted-foreground text-xs" htmlFor={`pm-percent-${index}`}>
          Percent
        </Label>
        <Input
          id={`pm-percent-${index}`}
          inputMode="decimal"
          onChange={(event) => onChange('percent', event.target.value)}
          placeholder="25"
          value={milestone.percent}
        />
      </div>
      <div className="grid w-40 gap-1">
        <Label className="text-muted-foreground text-xs" htmlFor={`pm-date-${index}`}>
          Due date
        </Label>
        <Input
          id={`pm-date-${index}`}
          onChange={(event) => onChange('date', event.target.value)}
          type="date"
          value={milestone.date}
        />
      </div>
      <Button
        className="mb-0"
        onClick={onRemove}
        size="icon"
        title="Remove payment milestone"
        variant="ghost"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}

function QuotePricingSummaryCard({ computed }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quote pricing</CardTitle>
        <CardDescription>Regular price vs. paying early (per the settings discount %).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Materials total</span>
          <span className="font-medium">{moneyCents(computed.materialsTotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sales tax ({computed.salesTaxRatePercent}%)</span>
          <span className="font-medium">{moneyCents(computed.salesTaxCents)}</span>
        </div>
        <div className="border-border flex justify-between border-t pt-3">
          <span className="text-muted-foreground">Early price materials</span>
          <span className="font-medium">{moneyCents(computed.earlyMaterialsTotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Early price sales tax</span>
          <span className="font-medium">{moneyCents(computed.earlySalesTaxCents)}</span>
        </div>
        <div className="bg-primary/10 text-primary flex items-center justify-between rounded-xl px-4 py-3">
          <span className="font-semibold">Total contract cost</span>
          <span className="text-lg font-bold">{moneyCents(computed.totalContractCostCents)}</span>
        </div>
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>Save {computed.payInFullDiscountPercent}% paying in full today</span>
          <span>
            -{moneyCents(computed.payInFullSavingsCents)} → {moneyCents(computed.payInFullAmountCents)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function TemplatePreviewCard({ url, loading, error, onExpand }) {
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
              className="aspect-8/10.5 w-full rounded-md border bg-white"
              src={`${url}#toolbar=0&navpanes=0`}
              title="Invoice template preview"
            />
          ) : error ? (
            <div className="text-destructive flex h-[72vh] items-center justify-center px-6 text-center text-sm">
              {error}
            </div>
          ) : (
            <div className="text-muted-foreground flex h-[72vh] items-center justify-center text-sm">
              <Loader2 className="mr-2 size-4 animate-spin" /> Rendering preview…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ExpandedPreviewDialog({ open, url, onClose }) {
  return (
    <Dialog onOpenChange={(next) => (next ? null : onClose())} open={open}>
      <DialogContent className="h-[92vh] w-[90vw] sm:max-w-[90vw]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b pb-3">
            <DialogTitle>Invoice template preview</DialogTitle>
            <Button onClick={onClose} size="icon" title="Close" variant="ghost">
              <X className="size-4" />
            </Button>
          </div>
          <iframe
            className="mt-3 min-h-0 w-full flex-1 rounded-md border bg-white"
            src={url ? `${url}#toolbar=1` : undefined}
            title="Expanded invoice preview"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SavedInvoicePreviewDialog({ invoice, onClose, onEdit, onDuplicate, busy = false }) {
  return (
    <Dialog onOpenChange={(next) => (next ? null : onClose())} open={Boolean(invoice)}>
      <DialogContent className="h-[92vh] w-[90vw] overflow-hidden sm:max-w-[90vw]">
        {invoice ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b pb-3">
              <DialogTitle className="truncate">
                {invoice.customerName} — Invoice {invoice.invoiceNumber}
              </DialogTitle>
              <div className="flex shrink-0 items-center gap-2">
                <Button disabled={busy} onClick={() => onEdit(invoice)} size="sm" variant="outline">
                  {busy ? (
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <Pencil className="mr-1.5 size-4" />
                  )}
                  Edit
                </Button>
                <Button disabled={busy} onClick={() => onDuplicate(invoice)} size="sm" variant="outline">
                  <Plus className="mr-1.5 size-4" /> Duplicate
                </Button>
                <Button asChild size="sm">
                  <a href={`/api/christmas/invoices/${invoice.id}/pdf`} rel="noreferrer" target="_blank">
                    <Download className="mr-1.5 size-4" /> Download
                  </a>
                </Button>
              </div>
            </div>
            <iframe
              className="mt-3 min-h-0 w-full flex-1 rounded-md border bg-white"
              src={`/api/christmas/invoices/${invoice.id}/pdf#toolbar=1`}
              title="Saved invoice"
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

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
    <Dialog onOpenChange={(next) => (next ? null : onClose())} open={Boolean(target)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email invoice {target?.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Emails the PDF to the customer and re-syncs Zoho Sheet + WorkDrive under &ldquo;
            {target?.customerName}&rdquo;.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-xs font-medium">Send to</Label>
            <Input onChange={onEmailChange} type="email" value={email} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-xs font-medium">Personal note (optional)</Label>
            <Textarea
              onChange={onMessageChange}
              placeholder="Happy holidays! Here's your invoice for the installation."
              rows={3}
              value={message}
            />
          </div>
          {results ? (
            <div className="space-y-1 rounded-md border p-3 text-xs">
              <SendResultRow label="Email" result={results.email} />
              <SendResultRow label="Zoho Sheet" result={results.sheet} />
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
            Send invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SavedInvoicesSummaryBar({ invoices, onPreviewLatest }) {
  if (invoices.length === 0) {
    return null
  }
  const latest = invoices[0]
  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">
          {invoices.length} saved invoice{invoices.length === 1 ? '' : 's'}
        </span>
        <Badge variant={latest.status === 'sent' ? 'outline' : 'secondary'}>
          {latest.status === 'sent' ? 'Sent' : 'Draft'}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onPreviewLatest} size="sm" variant="ghost">
          <Eye className="mr-1.5 size-4" /> Latest
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={`/api/christmas/invoices/${latest.id}/pdf`} rel="noreferrer" target="_blank">
            <Download className="mr-1.5 size-4" /> Download latest
          </a>
        </Button>
        <Button asChild size="sm">
          <Link href="/christmas/invoices/history">
            <History className="mr-1.5 size-4" /> View all
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

const ChristmasInvoicesClient = ({
  invoices: initialInvoices,
  preloadInvoice,
  presets = [],
  settings,
  templates = [],
  editId = null,
  dupeId = null,
  fromMockup,
  zohoConnected = false,
  zohoAuthEnabled = false,
}) => {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  /*
   * ?edit= / ?dupe= is resolved on the server and seeded straight into state.
   * It used to be applied from an effect that then called router.replace() to
   * strip the query param -- the resulting re-render raced the state update and
   * left the builder showing a blank new invoice, so Edit and Duplicate in the
   * history table appeared to do nothing. Seeding here also keeps the URL
   * meaningful, so refreshing an edit screen reopens the same invoice.
   */
  const [form, setForm] = useState(() => preloadForm(preloadInvoice, settings, presets))
  const [editingId, setEditingId] = useState(() => preloadEditingId(preloadInvoice, editId))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [integrationResults, setIntegrationResults] = useState(null)
  const [loadingInvoiceId, setLoadingInvoiceId] = useState(null)
  const [jobberPushing, setJobberPushing] = useState(false)
  const [jobberResult, setJobberResult] = useState(null)
  const [message, setMessage] = useState(() => preloadMessage(preloadInvoice, dupeId))
  const [viewing, setViewing] = useState(null)
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false)
  const [pdfPreviewError, setPdfPreviewError] = useState('')
  const [sendTarget, setSendTarget] = useState(null)
  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResults, setSendResults] = useState(null)

  const pendingMockupIdRef = useMockupLineItems({
    fromMockup,
    isExistingInvoice: Boolean(preloadEditingId(preloadInvoice, editId)),
    setForm,
    setMessage,
  })
  const [mockupRefresh, setMockupRefresh] = useState(0)

  const previewTimerRef = useRef(null)
  const previewUrlRef = useRef(null)
  const previewAbortRef = useRef(null)

  const computed = useMemo(
    () =>
      computeChristmasInvoice({
        ...formToInputs(form),
        salesTaxRatePercent: settings?.salesTaxRatePercent,
        earlyPaymentDiscountPercent: settings?.earlyPaymentDiscountPercent,
        payInFullDiscountPercent: settings?.payInFullDiscountPercent,
      }),
    [form, settings],
  )

  /*
   * Each preview renders the whole PDF server-side, so it is debounced and
   * every superseded request is aborted. Without the abort, a slow render
   * begun mid-edit kept running and could resolve after a newer one, leaving
   * a stale preview on screen while the server did duplicate work.
   */
  useEffect(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current)
    }
    previewAbortRef.current?.abort()

    const controller = new AbortController()
    previewAbortRef.current = controller

    previewTimerRef.current = setTimeout(async () => {
      setPdfPreviewLoading(true)
      try {
        const response = await fetch('/api/christmas/invoices/preview-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: formToInputs(form), invoiceId: editingId || undefined }),
          signal: controller.signal,
        })
        if (response.ok) {
          const url = URL.createObjectURL(await response.blob())
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current)
          }
          previewUrlRef.current = url
          setPdfPreviewUrl(url)
          setPdfPreviewError('')
        } else {
          const payload = await response.json().catch(() => ({}))
          setPdfPreviewError(payload.error || `Preview failed (HTTP ${response.status})`)
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setPdfPreviewError(fetchError.message || 'Preview request failed')
        }
      } finally {
        if (!controller.signal.aborted) {
          setPdfPreviewLoading(false)
        }
      }
    }, PREVIEW_DEBOUNCE_MS)

    return () => {
      clearTimeout(previewTimerRef.current)
      controller.abort()
    }
  }, [form, editingId, mockupRefresh])

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    },
    [],
  )

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const handleSelectZohoContact = (contact) =>
    setForm((current) => ({
      ...current,
      customerFirstName: contact.firstName || current.customerFirstName,
      customerLastName: contact.lastName || current.customerLastName,
      customerEmail: contact.email || current.customerEmail,
      customerPhone: contact.phone || current.customerPhone,
      propertyAddress: contact.propertyAddress || current.propertyAddress,
      propertyCity: contact.propertyCity || current.propertyCity,
      propertyState: contact.propertyState || current.propertyState || 'TX',
      propertyZip: contact.propertyZip || current.propertyZip,
    }))

  const setLineItem = (key, field, value) =>
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    }))

  const addLineItem = () =>
    setForm((current) => ({
      ...current,
      lineItems: [...current.lineItems, blankLineItem()],
    }))

  const removeLineItem = (key) =>
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.filter((item) => item.key !== key),
    }))

  const setPaymentMilestone = (key, field, value) =>
    setForm((current) => ({
      ...current,
      paymentMilestones: current.paymentMilestones.map((milestone) =>
        milestone.key === key ? { ...milestone, [field]: value } : milestone,
      ),
    }))

  const addPaymentMilestone = () =>
    setForm((current) => ({
      ...current,
      paymentMilestones: [...current.paymentMilestones, blankPaymentMilestone()],
    }))

  const removePaymentMilestone = (key) =>
    setForm((current) => ({
      ...current,
      paymentMilestones: current.paymentMilestones.filter((milestone) => milestone.key !== key),
    }))

  const applyPreset = (presetId) => {
    const preset = presets.find((item) => item.id === presetId) || presets[0]
    const items = presetLineItems(presetId)
    setForm((current) => ({
      ...current,
      packageId: preset.id,
      packageLabel: preset.label,
      lineItems: items.length ? items.map(presetItemToFormLineItem) : [blankLineItem()],
    }))
  }

  const resetForm = () => {
    setForm(emptyForm(settings, presets))
    setEditingId(null)
    setSaveError('')
    setIntegrationResults(null)
    setJobberResult(null)
    setMessage('')
  }

  const openNew = () => {
    resetForm()
    // Drop ?edit= / ?dupe= so a refresh doesn't reopen the invoice just closed.
    router.replace('/christmas/invoices', { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openLoadedInvoice = async (invoice, { asDuplicate }) => {
    setLoadingInvoiceId(invoice.id)
    setSaveError('')
    try {
      const inputs = await loadInvoiceInputs(invoice)
      setForm(inputsToForm(inputs, settings))
      setEditingId(asDuplicate ? null : invoice.id)
      setIntegrationResults(null)
      setJobberResult(null)
      setMessage(asDuplicate ? duplicateMessage(invoice.invoiceNumber) : '')
      setViewing(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSaveError(error.message)
    } finally {
      setLoadingInvoiceId(null)
    }
  }

  const openEdit = (invoice) => openLoadedInvoice(invoice, { asDuplicate: false })

  const openDuplicate = (invoice) => openLoadedInvoice(invoice, { asDuplicate: true })

  /* A new invoice started from a mockup gets tied to that mockup on its first save. */
  const linkPendingMockup = async (invoiceId) => {
    const mockupId = pendingMockupIdRef.current
    if (!mockupId) {
      return
    }
    pendingMockupIdRef.current = null
    try {
      await fetch(`/api/christmas/invoices/${invoiceId}/mockup/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mockupId }),
      })
      setMockupRefresh((tick) => tick + 1)
    } catch (error) {
      console.error('[christmas/invoices] linking the mockup failed', error)
    }
  }

  const persistInvoice = async () => {
    if (!form.customerFirstName.trim()) {
      throw new Error('Customer first name is required')
    }
    if (computed.lineItems.length === 0) {
      throw new Error('Add at least one line item to save')
    }
    const inputs = formToInputs(form)
    const url = editingId ? `/api/christmas/invoices/${editingId}` : '/api/christmas/invoices'
    const method = editingId ? 'PUT' : 'POST'
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error || `Save failed (HTTP ${response.status})`)
    }
    setIntegrationResults(data.results)
    setInvoices((list) => [data.invoice, ...list.filter((item) => item.id !== data.invoice.id)])
    setMessage(editingId ? 'Invoice updated.' : 'Invoice created.')
    setEditingId(data.invoice.id)
    await linkPendingMockup(data.invoice.id)
    return data.invoice
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    setMessage('')
    try {
      await persistInvoice()
    } catch (error) {
      setSaveError(error.message || 'Unable to save invoice.')
    } finally {
      setSaving(false)
    }
  }

  const handlePushToJobber = async () => {
    if (!editingId) {
      return
    }
    setJobberPushing(true)
    setJobberResult(null)
    try {
      const response = await fetch(`/api/christmas/invoices/${editingId}/jobber`, { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || `Push failed (HTTP ${response.status})`)
      }
      setJobberResult(data.result)
      setInvoices((list) => list.map((item) => (item.id === data.invoice.id ? data.invoice : item)))
    } catch (error) {
      setJobberResult({ ok: false, error: error.message })
    } finally {
      setJobberPushing(false)
    }
  }

  const openSendDialog = (invoice) => {
    setSendTarget(invoice)
    setSendEmail(invoice.customerEmail || form.customerEmail || '')
    setSendMessage('')
    setSendResults(null)
  }

  const handleEmailClick = async () => {
    setSaving(true)
    setSaveError('')
    setMessage('')
    try {
      const invoice = await persistInvoice()
      openSendDialog(invoice)
    } catch (error) {
      setSaveError(error.message || 'Unable to prepare invoice for email.')
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    if (!sendTarget) {
      return
    }
    setSending(true)
    setSendResults(null)
    try {
      const response = await fetch(`/api/christmas/invoices/${sendTarget.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: sendEmail, message: sendMessage }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || 'Send failed')
      }
      setSendResults(payload.results)
      if (payload.invoice) {
        setInvoices((list) => [payload.invoice, ...list.filter((item) => item.id !== payload.invoice.id)])
      }
    } catch (error) {
      setSendResults({ email: { ok: false, error: error.message } })
    } finally {
      setSending(false)
    }
  }

  const canSave = Boolean(form.customerFirstName.trim()) && computed.lineItems.length > 0
  const currentInvoice = editingId ? invoices.find((item) => item.id === editingId) : null

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Christmas lights</p>
          <h1 className="text-foreground mt-2 text-3xl tracking-normal">Christmas invoices</h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-[1rem] leading-7">
            Build a custom package invoice for any client, pick the template, and save it. On save the PDF is
            filed in Zoho WorkDrive under <span className="font-medium">{'Client Name/Invoices'}</span> and a
            row is appended to the Christmas invoices Zoho Sheet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/christmas/invoices/history">
              <History className="mr-2 size-4" /> History
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/christmas/invoices/settings">
              <Settings2 className="mr-2 size-4" /> Template settings
            </Link>
          </Button>
          <Button onClick={openNew}>
            <Plus className="mr-2 size-4" /> New invoice
          </Button>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="templateKey">Invoice template</Label>
              <Select onValueChange={(value) => update('templateKey', value)} value={form.templateKey}>
                <SelectTrigger id="templateKey">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.key} value={template.key}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs leading-5">
                {templates.find((template) => template.key === form.templateKey)?.description ||
                  'Template selected on this invoice.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quote details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="projectNumber">Project #</Label>
                  <Input
                    id="projectNumber"
                    onChange={(event) => update('projectNumber', event.target.value)}
                    placeholder="7/2/2026 - 1047a"
                    value={form.projectNumber}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quoteCreatedBy">Quote created by</Label>
                  <Input
                    id="quoteCreatedBy"
                    onChange={(event) => update('quoteCreatedBy', event.target.value)}
                    placeholder="Kathie Millen"
                    value={form.quoteCreatedBy}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="colorLights">Color lights</Label>
                  <OptionSelect
                    id="colorLights"
                    onChange={(value) => update('colorLights', value)}
                    options={CHRISTMAS_LIGHT_COLORS}
                    placeholder="Pick a color"
                    value={form.colorLights}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quoteValidDays">Quote good for (days)</Label>
                  <Input
                    id="quoteValidDays"
                    inputMode="numeric"
                    onChange={(event) => update('quoteValidDays', event.target.value)}
                    placeholder="30"
                    value={form.quoteValidDays}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer & property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <ZohoContactTypeahead
                    label="First name *"
                    onChange={(name) => update('customerFirstName', name)}
                    onSelect={handleSelectZohoContact}
                    placeholder="Search Zoho contacts or type a name…"
                    value={form.customerFirstName}
                    zohoAuthEnabled={zohoAuthEnabled}
                    zohoConnected={zohoConnected}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerLastName">Last name</Label>
                  <Input
                    id="customerLastName"
                    onChange={(event) => update('customerLastName', event.target.value)}
                    placeholder="Doe"
                    value={form.customerLastName}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    onChange={(event) => update('customerPhone', event.target.value)}
                    placeholder="(512) 775-0561"
                    value={form.customerPhone}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    onChange={(event) => update('customerEmail', event.target.value)}
                    placeholder="jane@example.com"
                    type="email"
                    value={form.customerEmail}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="propertyAddress">Property address</Label>
                <Input
                  id="propertyAddress"
                  onChange={(event) => update('propertyAddress', event.target.value)}
                  placeholder="123 Holly Lane"
                  value={form.propertyAddress}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="propertyCity">City</Label>
                  <Input
                    id="propertyCity"
                    onChange={(event) => update('propertyCity', event.target.value)}
                    placeholder="Austin"
                    value={form.propertyCity}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="propertyState">State</Label>
                  <Input
                    id="propertyState"
                    onChange={(event) => update('propertyState', event.target.value)}
                    value={form.propertyState}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="propertyZip">ZIP</Label>
                  <Input
                    id="propertyZip"
                    onChange={(event) => update('propertyZip', event.target.value)}
                    placeholder="78701"
                    value={form.propertyZip}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="invoiceDate">Invoice date</Label>
                <Input
                  id="invoiceDate"
                  onChange={(event) => update('invoiceDate', event.target.value)}
                  type="date"
                  value={form.invoiceDate}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due date</Label>
                <Input
                  id="dueDate"
                  onChange={(event) => update('dueDate', event.target.value)}
                  type="date"
                  value={form.dueDate}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="installDate">Install date</Label>
                <Input
                  id="installDate"
                  onChange={(event) => update('installDate', event.target.value)}
                  type="date"
                  value={form.installDate}
                />
              </div>
            </CardContent>
          </Card>

          <MockupCard invoiceId={editingId} refreshKey={mockupRefresh} />

          <Card className="scroll-mt-6" id={LINE_ITEMS_SECTION_ID}>
            <CardHeader>
              <CardTitle className="text-base">Package & line items</CardTitle>
              <CardDescription>
                Start from a package preset, then customize the line items for this client.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="packageId">Package preset</Label>
                  <Select onValueChange={applyPreset} value={form.packageId}>
                    <SelectTrigger id="packageId">
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="packageLabel">Package label (printed)</Label>
                  <Input
                    id="packageLabel"
                    onChange={(event) => update('packageLabel', event.target.value)}
                    value={form.packageLabel}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {form.lineItems.map((item, index) => (
                  <LineItemRow
                    index={index}
                    item={item}
                    key={item.key}
                    onChange={(field, value) => setLineItem(item.key, field, value)}
                    onRemove={() => removeLineItem(item.key)}
                  />
                ))}
                <Button onClick={addLineItem} size="sm" variant="outline">
                  <Plus className="mr-1.5 size-4" /> Add line item
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="deposit">Deposit applied ($)</Label>
                  <Input
                    id="deposit"
                    onChange={(event) => update('deposit', event.target.value)}
                    placeholder="0"
                    value={form.deposit}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (printed)</Label>
                <Textarea
                  id="notes"
                  onChange={(event) => update('notes', event.target.value)}
                  placeholder="Optional message to the client, e.g. schedule or scope details."
                  rows={3}
                  value={form.notes}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment terms</CardTitle>
              <CardDescription>
                Custom milestones (e.g. 25% deposit, 40% by a date, 35% final) as a % of the total contract
                cost.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {form.paymentMilestones.map((milestone, index) => (
                <PaymentMilestoneRow
                  index={index}
                  key={milestone.key}
                  milestone={milestone}
                  onChange={(field, value) => setPaymentMilestone(milestone.key, field, value)}
                  onRemove={() => removePaymentMilestone(milestone.key)}
                />
              ))}
              <Button onClick={addPaymentMilestone} size="sm" variant="outline">
                <Plus className="mr-1.5 size-4" /> Add payment milestone
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <QuotePricingSummaryCard computed={computed} />

          <TemplatePreviewCard
            error={pdfPreviewError}
            loading={pdfPreviewLoading}
            onExpand={() => setPreviewExpanded(true)}
            url={pdfPreviewUrl}
          />

          {integrationResults ? <IntegrationResultsCard results={integrationResults} /> : null}
          <JobberPushCard
            invoice={currentInvoice}
            onPush={handlePushToJobber}
            pushing={jobberPushing}
            result={jobberResult}
          />
          {saveError ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <TriangleAlert className="size-4 shrink-0" />
              {saveError}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            {editingId ? (
              <Button onClick={openNew} size="lg" variant="outline">
                <Plus className="mr-1.5 size-4" /> New
              </Button>
            ) : null}
            <Button disabled={saving} onClick={handleSave} size="lg" variant="outline" className="flex-1">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              {editingId ? 'Update invoice' : 'Create invoice'}
            </Button>
            <Button disabled={saving || !canSave} onClick={handleEmailClick} size="lg" className="flex-1">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}
              Email invoice
            </Button>
          </div>
          {!canSave ? (
            <p className="text-muted-foreground text-xs">
              Required to save/email: customer first name and at least one line item.
            </p>
          ) : null}
        </div>
      </div>

      <SavedInvoicesSummaryBar invoices={invoices} onPreviewLatest={() => setViewing(invoices[0] ?? null)} />

      <ExpandedPreviewDialog
        onClose={() => setPreviewExpanded(false)}
        open={previewExpanded}
        url={pdfPreviewUrl}
      />
      <SavedInvoicePreviewDialog
        busy={isLoadingInvoice(loadingInvoiceId, viewing)}
        invoice={viewing}
        onClose={() => setViewing(null)}
        onDuplicate={openDuplicate}
        onEdit={openEdit}
      />
      <SendDialog
        email={sendEmail}
        message={sendMessage}
        onClose={() => setSendTarget(null)}
        onEmailChange={(event) => setSendEmail(event.target.value)}
        onMessageChange={(event) => setSendMessage(event.target.value)}
        onSend={handleSend}
        results={sendResults}
        sending={sending}
        target={sendTarget}
      />
    </div>
  )
}

export default ChristmasInvoicesClient
