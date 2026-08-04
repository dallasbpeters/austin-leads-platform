'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

import {
  Download,
  Eye,
  FileText,
  Loader2,
  Mail,
  Maximize2,
  Pencil,
  Plus,
  Save,
  Settings2,
  Trash2,
  TriangleAlert,
  X,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import ZohoContactTypeahead from '@/components/admin/zoho-contact-typeahead'

import { computeChristmasInvoice, presetLineItems } from '@/lib/christmas/invoice-calc'

// ─── Formatters / helpers ────────────────────────────────────────────────────

const moneyCents = (cents) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100)

const shortDate = (value) =>
  value
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/Chicago' }).format(
        new Date(value),
      )
    : '—'

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

const emptyForm = (settings, presets) => {
  const firstPreset = presets?.[0]
  const items = presetLineItems(firstPreset?.id || 'custom')
  return {
    templateKey: settings?.templateKey || 'christmas-classic',
    customerName: '',
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
    lineItems: items.length
      ? items.map((item) => ({
          key: newKey(),
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: centsToInput(item.unitPriceCents),
        }))
      : [{ key: newKey(), description: '', quantity: '1', unitPrice: '' }],
    deposit: '',
    notes: '',
  }
}

const formToInputs = (form) => ({
  templateKey: form.templateKey,
  customerName: form.customerName,
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
    description: item.description,
    quantity: Number(item.quantity) || 0,
    unitPriceCents: inputToCents(item.unitPrice),
  })),
  depositCents: inputToCents(form.deposit),
  notes: form.notes,
})

const inputsToForm = (inputs, settings) => ({
  templateKey: inputs.templateKey || settings?.templateKey || 'christmas-classic',
  customerName: inputs.customerName || '',
  customerEmail: inputs.customerEmail || '',
  customerPhone: inputs.customerPhone || '',
  propertyAddress: inputs.propertyAddress || '',
  propertyCity: inputs.propertyCity || '',
  propertyState: inputs.propertyState || 'TX',
  propertyZip: inputs.propertyZip || '',
  invoiceDate: inputs.invoiceDate || todayISO(),
  dueDate: inputs.dueDate || addDays(30),
  installDate: inputs.installDate || '',
  packageId: inputs.packageId || 'custom',
  packageLabel: inputs.packageLabel || 'Custom Package',
  lineItems: (inputs.lineItems || []).map((item) => ({
    key: item.key || newKey(),
    description: item.description || '',
    quantity: String(item.quantity ?? 1),
    unitPrice: centsToInput(item.unitPriceCents),
  })),
  deposit: centsToInput(inputs.depositCents),
  notes: inputs.notes || '',
})

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
              className="h-[72vh] w-full rounded-md border bg-white"
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
      <DialogContent className="h-[92vh] max-w-4xl">
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

function SavedInvoicePreviewDialog({ invoice, onClose, onEdit, onDuplicate }) {
  return (
    <Dialog onOpenChange={(next) => (next ? null : onClose())} open={Boolean(invoice)}>
      <DialogContent className="h-[92vh] max-w-4xl">
        {invoice ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b pb-3">
              <DialogTitle className="truncate">
                {invoice.customerName} — Invoice {invoice.invoiceNumber}
              </DialogTitle>
              <div className="flex shrink-0 items-center gap-2">
                <Button onClick={() => onEdit(invoice)} size="sm" variant="outline">
                  <Pencil className="mr-1.5 size-4" /> Edit
                </Button>
                <Button onClick={() => onDuplicate(invoice)} size="sm" variant="outline">
                  <Plus className="mr-1.5 size-4" /> Duplicate
                </Button>
                <Button asChild size="sm">
                  <a href={`/api/christmas/invoices/${invoice.id}/pdf`} rel="noreferrer" target="_blank">
                    <Download className="mr-1.5 size-4" /> Download
                  </a>
                </Button>
                <Button onClick={onClose} size="icon" variant="ghost" title="Close">
                  <X className="size-4" />
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

function DeleteConfirmDialog({ invoice, busy, onCancel, onConfirm }) {
  return (
    <Dialog onOpenChange={(next) => (next ? null : onCancel())} open={Boolean(invoice)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete invoice?</DialogTitle>
          <DialogDescription>
            {invoice
              ? `This permanently removes invoice ${invoice.invoiceNumber} for ${invoice.customerName}. The PDF already uploaded to Zoho WorkDrive is not deleted.`
              : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={busy} onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button disabled={busy} onClick={onConfirm} variant="destructive">
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
            Delete invoice
          </Button>
        </DialogFooter>
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

// ─── Main component ──────────────────────────────────────────────────────────

const ChristmasInvoicesClient = ({
  invoices: initialInvoices,
  presets = [],
  settings,
  templates = [],
  zohoConnected = false,
  zohoAuthEnabled = false,
}) => {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [form, setForm] = useState(() => emptyForm(settings, presets))
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [integrationResults, setIntegrationResults] = useState(null)
  const [message, setMessage] = useState('')
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false)
  const [pdfPreviewError, setPdfPreviewError] = useState('')
  const [sendTarget, setSendTarget] = useState(null)
  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResults, setSendResults] = useState(null)

  const previewTimerRef = useRef(null)
  const previewUrlRef = useRef(null)

  const computed = useMemo(() => computeChristmasInvoice(formToInputs(form)), [form])

  useEffect(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current)
    }
    previewTimerRef.current = setTimeout(async () => {
      setPdfPreviewLoading(true)
      try {
        const response = await fetch('/api/christmas/invoices/preview-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: formToInputs(form) }),
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
        setPdfPreviewError(fetchError.message || 'Preview request failed')
      } finally {
        setPdfPreviewLoading(false)
      }
    }, 800)
    return () => clearTimeout(previewTimerRef.current)
  }, [form])

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
      customerName: contact.name || current.customerName,
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
      lineItems: [...current.lineItems, { key: newKey(), description: '', quantity: '1', unitPrice: '' }],
    }))

  const removeLineItem = (key) =>
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.filter((item) => item.key !== key),
    }))

  const applyPreset = (presetId) => {
    const preset = presets.find((item) => item.id === presetId) || presets[0]
    const items = presetLineItems(presetId)
    setForm((current) => ({
      ...current,
      packageId: preset.id,
      packageLabel: preset.label,
      lineItems: items.length
        ? items.map((item) => ({
            key: newKey(),
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: centsToInput(item.unitPriceCents),
          }))
        : [{ key: newKey(), description: '', quantity: '1', unitPrice: '' }],
    }))
  }

  const resetForm = () => {
    setForm(emptyForm(settings, presets))
    setEditingId(null)
    setSaveError('')
    setIntegrationResults(null)
    setMessage('')
  }

  const openNew = () => {
    resetForm()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEdit = (invoice) => {
    setForm(inputsToForm(invoice.data?.inputs || {}, settings))
    setEditingId(invoice.id)
    setSaveError('')
    setIntegrationResults(null)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openDuplicate = (invoice) => {
    setForm(inputsToForm(invoice.data?.inputs || {}, settings))
    setEditingId(null)
    setSaveError('')
    setIntegrationResults(null)
    setMessage(`Loaded ${invoice.invoiceNumber} as a template — saving creates a new invoice.`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const persistInvoice = async () => {
    if (!form.customerName.trim()) {
      throw new Error('Customer name is required')
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

  const handleDelete = async () => {
    if (!deleting) {
      return
    }
    setDeleteBusy(true)
    setMessage('')
    try {
      const response = await fetch(`/api/christmas/invoices/${deleting.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      setInvoices((list) => list.filter((item) => item.id !== deleting.id))
      setDeleting(null)
    } catch (error) {
      setMessage(error.message || 'Unable to delete invoice.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const canSave = Boolean(form.customerName.trim()) && computed.lineItems.length > 0

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
              <CardTitle className="text-base">Customer & property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <ZohoContactTypeahead
                    onChange={(name) => update('customerName', name)}
                    onSelect={handleSelectZohoContact}
                    placeholder="Search Zoho contacts…"
                    value={form.customerName}
                    zohoAuthEnabled={zohoAuthEnabled}
                    zohoConnected={zohoConnected}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    onChange={(event) => update('customerPhone', event.target.value)}
                    placeholder="(512) 775-0561"
                    value={form.customerPhone}
                  />
                </div>
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

          <Card>
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
                {form.lineItems.map((item, index) => {
                  const itemAmountCents = inputToCents(item.unitPrice) * (Number(item.quantity) || 0)
                  return (
                    <div
                      key={item.key}
                      className="border-border bg-muted/20 flex items-end gap-2 rounded-xl border p-3"
                    >
                      <div className="grid min-w-0 flex-1 gap-1">
                        <Label className="text-muted-foreground text-xs" htmlFor={`li-desc-${index}`}>
                          Description
                        </Label>
                        <Input
                          id={`li-desc-${index}`}
                          onChange={(event) => setLineItem(item.key, 'description', event.target.value)}
                          placeholder={`Line item ${index + 1}`}
                          value={item.description}
                        />
                      </div>
                      <div className="grid w-16 gap-1">
                        <Label className="text-muted-foreground text-xs" htmlFor={`li-qty-${index}`}>
                          Qty
                        </Label>
                        <Input
                          id={`li-qty-${index}`}
                          onChange={(event) => setLineItem(item.key, 'quantity', event.target.value)}
                          value={item.quantity}
                        />
                      </div>
                      <div className="grid w-24 gap-1">
                        <Label className="text-muted-foreground text-xs" htmlFor={`li-price-${index}`}>
                          Unit $
                        </Label>
                        <Input
                          id={`li-price-${index}`}
                          onChange={(event) => setLineItem(item.key, 'unitPrice', event.target.value)}
                          value={item.unitPrice}
                        />
                      </div>
                      <div className="grid w-20 gap-1">
                        <span className="text-muted-foreground text-xs">Amount</span>
                        <div className="text-foreground h-9 truncate pt-1.5 text-sm font-semibold">
                          {moneyCents(itemAmountCents)}
                        </div>
                      </div>
                      <Button
                        className="mb-0"
                        onClick={() => removeLineItem(item.key)}
                        size="icon"
                        title="Remove line item"
                        variant="ghost"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )
                })}
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
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{form.packageLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Line items</span>
                <span className="font-medium">{computed.lineItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{moneyCents(computed.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit applied</span>
                <span className="font-medium">- {moneyCents(computed.depositCents)}</span>
              </div>
              <div className="bg-primary/10 text-primary flex items-center justify-between rounded-xl px-4 py-3">
                <span className="font-semibold">Balance due</span>
                <span className="text-lg font-bold">{moneyCents(computed.balanceDueCents)}</span>
              </div>
            </CardContent>
          </Card>

          <TemplatePreviewCard
            error={pdfPreviewError}
            loading={pdfPreviewLoading}
            onExpand={() => setPreviewExpanded(true)}
            url={pdfPreviewUrl}
          />

          {integrationResults ? <IntegrationResultsCard results={integrationResults} /> : null}
          {saveError ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <TriangleAlert className="size-4 shrink-0" />
              {saveError}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            {editingId ? (
              <Button onClick={openNew} variant="outline">
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
              Required to save/email: customer name and at least one line item.
            </p>
          ) : null}
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileText className="text-muted-foreground size-10" />
            <CardDescription>No Christmas invoices yet.</CardDescription>
            <Button onClick={openNew}>
              <Plus className="mr-2 size-4" /> Create the first invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date / Due</TableHead>
                  <TableHead>Balance due</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Zoho</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <div>{invoice.invoiceNumber}</div>
                      <Badge className="mt-1" variant={invoice.status === 'sent' ? 'outline' : 'secondary'}>
                        {invoice.status === 'sent' ? 'Sent' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-muted-foreground text-xs">
                        {[invoice.propertyCity, invoice.propertyState].filter(Boolean).join(', ') || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{shortDate(invoice.invoiceDate)}</div>
                      <div className="text-muted-foreground text-xs">Due {shortDate(invoice.dueDate)}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{moneyCents(invoice.balanceDueCents)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {templates.find((template) => template.key === invoice.templateKey)?.label ||
                          invoice.templateKey}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <span
                          className={invoice.workdriveFileId ? 'text-emerald-600' : 'text-muted-foreground'}
                        >
                          {invoice.workdriveFileId ? 'WorkDrive ✓' : 'WorkDrive —'}
                        </span>
                        <span
                          className={invoice.zohoSheetSyncedAt ? 'text-emerald-600' : 'text-muted-foreground'}
                        >
                          {invoice.zohoSheetSyncedAt ? 'Sheet ✓' : 'Sheet —'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          onClick={() => setViewing(invoice)}
                          size="icon"
                          title="Preview"
                          variant="ghost"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button asChild size="icon" title="Download PDF" variant="ghost">
                          <a
                            href={`/api/christmas/invoices/${invoice.id}/pdf`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <Download className="size-4" />
                          </a>
                        </Button>
                        <Button
                          onClick={() => openSendDialog(invoice)}
                          size="icon"
                          title="Email invoice"
                          variant="ghost"
                        >
                          <Mail className="size-4" />
                        </Button>
                        <Button onClick={() => openEdit(invoice)} size="icon" title="Edit" variant="ghost">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          onClick={() => openDuplicate(invoice)}
                          size="icon"
                          title="Duplicate"
                          variant="ghost"
                        >
                          <Plus className="size-4" />
                        </Button>
                        <Button
                          onClick={() => setDeleting(invoice)}
                          className="text-destructive"
                          size="icon"
                          title="Delete"
                          variant="ghost"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ExpandedPreviewDialog
        onClose={() => setPreviewExpanded(false)}
        open={previewExpanded}
        url={pdfPreviewUrl}
      />
      <SavedInvoicePreviewDialog
        invoice={viewing}
        onClose={() => setViewing(null)}
        onDuplicate={openDuplicate}
        onEdit={openEdit}
      />
      <DeleteConfirmDialog
        busy={deleteBusy}
        invoice={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
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
