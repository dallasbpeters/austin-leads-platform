'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import {
  Copy,
  Download,
  Eye,
  Loader2,
  Mail,
  MailCheck,
  MailOpen,
  MailWarning,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { EMAIL_STATUS_LABELS } from '@/lib/christmas/invoice-email-labels'

const moneyCents = (cents) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100)

const shortDate = (value) => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/Chicago' }).format(date)
}

const stamp = (value) =>
  value
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Chicago',
      }).format(new Date(value))
    : ''

/*
 * Delivery state comes from Resend's `last_event`, pulled on demand by
 * POST /api/christmas/invoices/[id]/email-status. "Sent" only means Resend
 * accepted the message; "Delivered" is the confirmation that it landed.
 */
const DELIVERY_TONES = {
  opened: { className: 'bg-emerald-600 hover:bg-emerald-600', icon: MailOpen },
  clicked: { className: 'bg-emerald-600 hover:bg-emerald-600', icon: MailOpen },
  delivered: { className: 'bg-sky-600 hover:bg-sky-600', icon: MailCheck },
  bounced: { variant: 'destructive', icon: MailWarning },
  complained: { variant: 'destructive', icon: MailWarning },
  failed: { variant: 'destructive', icon: MailWarning },
  suppressed: { variant: 'destructive', icon: MailWarning },
  canceled: { variant: 'destructive', icon: MailWarning },
  delivery_delayed: { className: 'bg-amber-600 hover:bg-amber-600', icon: MailWarning },
}

function DeliveryBadge({ invoice }) {
  if (invoice.status !== 'sent' && !invoice.emailStatus) {
    return <Badge variant="secondary">Draft</Badge>
  }

  const status = invoice.emailStatus
  const tone = DELIVERY_TONES[status]
  const label = EMAIL_STATUS_LABELS[status] || 'Sent'
  const Icon = tone?.icon || Mail
  const checked = invoice.emailCheckedAt
    ? `Confirmed with Resend ${stamp(invoice.emailCheckedAt)}`
    : 'Not verified yet — use Check delivery'

  return (
    <Badge
      className={tone?.className}
      title={`${label} · sent to ${invoice.emailedTo || 'customer'} ${stamp(invoice.sentAt)} · ${checked}`}
      variant={tone?.variant || (tone?.className ? undefined : 'outline')}
    >
      <Icon className="mr-1 size-3" />
      {label}
    </Badge>
  )
}

function JobberResultLine({ result }) {
  if (!result) {
    return null
  }
  if (result.ok) {
    return <p className="mt-1 text-right text-xs text-emerald-600">Pushed to Jobber.</p>
  }
  if (result.skipped) {
    return <p className="text-muted-foreground mt-1 text-right text-xs">{`Skipped — ${result.reason}`}</p>
  }
  return <p className="text-destructive mt-1 text-right text-xs">{result.error || 'Push failed.'}</p>
}

function DeliveryResultLine({ result }) {
  if (!result) {
    return null
  }
  if (result.ok) {
    const label = EMAIL_STATUS_LABELS[result.status] || result.status
    return (
      <p className="text-muted-foreground mt-1 text-right text-xs">{`Resend: ${label} — ${result.to}`}</p>
    )
  }
  return (
    <p className="text-destructive mt-1 text-right text-xs">
      {result.reason || result.error || 'Could not verify.'}
    </p>
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

export default function ChristmasInvoicesHistoryClient({
  initialInvoices = [],
  templates = [],
  dbConfigured,
  dbError,
}) {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [viewing, setViewing] = useState(null)
  const [sendTarget, setSendTarget] = useState(null)
  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResults, setSendResults] = useState(null)
  const [jobberPushingId, setJobberPushingId] = useState(null)
  const [jobberResults, setJobberResults] = useState({})
  const [checkingId, setCheckingId] = useState(null)
  const [deliveryResults, setDeliveryResults] = useState({})

  const refreshInvoices = useCallback(async () => {
    try {
      const response = await fetch('/api/christmas/invoices')
      if (response.ok) {
        const payload = await response.json()
        setInvoices(payload.invoices ?? [])
      }
    } catch {
      // Non-fatal.
    }
  }, [])

  const openSendDialog = (invoice) => {
    setSendTarget(invoice)
    setSendEmail(invoice.customerEmail || '')
    setSendMessage('')
    setSendResults(null)
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
      await refreshInvoices()
    } catch (error) {
      setSendResults({ email: { ok: false, error: error.message } })
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (invoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber} for ${invoice.customerName}?`)) {
      return
    }
    await fetch(`/api/christmas/invoices/${invoice.id}`, { method: 'DELETE' })
    await refreshInvoices()
  }

  const handleEdit = (invoice) => router.push(`/christmas/invoices?edit=${invoice.id}`)
  const handleDuplicate = (invoice) => router.push(`/christmas/invoices?dupe=${invoice.id}`)

  /*
   * Asks Resend what actually happened to the invoice email. The send only
   * proves Resend accepted it; this confirms delivery (or surfaces a bounce).
   */
  const handleCheckDelivery = async (invoice) => {
    setCheckingId(invoice.id)
    setDeliveryResults((current) => ({ ...current, [invoice.id]: null }))
    try {
      const response = await fetch(`/api/christmas/invoices/${invoice.id}/email-status`, {
        method: 'POST',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Delivery check failed')
      }
      setDeliveryResults((current) => ({ ...current, [invoice.id]: data.result }))
      if (data.invoice) {
        setInvoices((list) => list.map((item) => (item.id === data.invoice.id ? data.invoice : item)))
        setViewing((current) => (current?.id === data.invoice.id ? data.invoice : current))
      }
    } catch (error) {
      setDeliveryResults((current) => ({ ...current, [invoice.id]: { ok: false, error: error.message } }))
    } finally {
      setCheckingId(null)
    }
  }

  /** Pushed on-demand only — see src/lib/christmas/invoice-integrations.js for why this isn't automatic. */
  const handlePushToJobber = async (invoice) => {
    setJobberPushingId(invoice.id)
    setJobberResults((current) => ({ ...current, [invoice.id]: null }))
    try {
      const response = await fetch(`/api/christmas/invoices/${invoice.id}/jobber`, { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Push failed')
      }
      setJobberResults((current) => ({ ...current, [invoice.id]: data.result }))
      setInvoices((list) => list.map((item) => (item.id === data.invoice.id ? data.invoice : item)))
      setViewing((current) => (current?.id === data.invoice.id ? data.invoice : current))
    } catch (error) {
      setJobberResults((current) => ({ ...current, [invoice.id]: { ok: false, error: error.message } }))
    } finally {
      setJobberPushingId(null)
    }
  }

  if (!dbConfigured) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>Database is not configured. Set DATABASE_URL and reload.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoice History</h1>
          <p className="text-muted-foreground text-sm">
            All saved Christmas invoices — preview, send, edit, or delete any invoice.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshInvoices} size="sm" variant="outline">
            <RefreshCw className="mr-1.5 size-4" /> Refresh
          </Button>
          <Button onClick={() => router.push('/christmas/invoices')} size="sm">
            <Plus className="mr-1.5 size-4" /> New invoice
          </Button>
        </div>
      </div>

      {dbError ? (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {dbError.message}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Invoices</CardTitle>
          <CardDescription>{invoices.length} total</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No invoices yet —{' '}
              <button
                className="text-primary underline"
                onClick={() => router.push('/christmas/invoices')}
                type="button"
              >
                build your first one
              </button>
              .
            </p>
          ) : (
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
                      <div className="mt-1">
                        <DeliveryBadge invoice={invoice} />
                      </div>
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
                        <span
                          className={invoice.jobberInvoiceId ? 'text-emerald-600' : 'text-muted-foreground'}
                        >
                          {invoice.jobberInvoiceId ? 'Jobber ✓' : 'Jobber —'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
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
                        <Button
                          disabled={checkingId === invoice.id || invoice.status !== 'sent'}
                          onClick={() => handleCheckDelivery(invoice)}
                          size="icon"
                          title={invoice.status === 'sent' ? 'Check delivery with Resend' : 'Not emailed yet'}
                          variant="ghost"
                        >
                          {checkingId === invoice.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="size-4" />
                          )}
                        </Button>
                        <Button onClick={() => handleEdit(invoice)} size="icon" title="Edit" variant="ghost">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          onClick={() => handleDuplicate(invoice)}
                          size="icon"
                          title="Duplicate"
                          variant="ghost"
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          disabled={jobberPushingId === invoice.id}
                          onClick={() => handlePushToJobber(invoice)}
                          size="icon"
                          title={invoice.jobberInvoiceId ? 'Re-push to Jobber' : 'Push to Jobber'}
                          variant="ghost"
                        >
                          {jobberPushingId === invoice.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Upload className="size-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDelete(invoice)}
                          size="icon"
                          title="Delete"
                          variant="ghost"
                        >
                          <Trash2 className="text-destructive size-4" />
                        </Button>
                      </div>
                      <DeliveryResultLine result={deliveryResults[invoice.id]} />
                      <JobberResultLine result={jobberResults[invoice.id]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Saved invoice preview dialog ── */}
      <Dialog onOpenChange={(next) => (next ? null : setViewing(null))} open={Boolean(viewing)}>
        <DialogContent className="h-[92vh] w-[90vw] sm:max-w-[90vw]" showCloseButton={false}>
          {viewing ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <DialogTitle className="truncate">
                  {viewing.customerName} — Invoice {viewing.invoiceNumber}
                </DialogTitle>
                <div className="flex shrink-0 items-center gap-2">
                  <Button onClick={() => handleEdit(viewing)} size="sm" variant="outline">
                    <Pencil className="mr-1.5 size-4" /> Edit
                  </Button>
                  <Button onClick={() => handleDuplicate(viewing)} size="sm" variant="outline">
                    <Copy className="mr-1.5 size-4" /> Duplicate
                  </Button>
                  <Button asChild size="sm">
                    <a href={`/api/christmas/invoices/${viewing.id}/pdf`} rel="noreferrer" target="_blank">
                      <Download className="mr-1.5 size-4" /> Download
                    </a>
                  </Button>
                  <Button
                    disabled={jobberPushingId === viewing.id}
                    onClick={() => handlePushToJobber(viewing)}
                    size="sm"
                    variant="outline"
                  >
                    {jobberPushingId === viewing.id ? (
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                    ) : (
                      <Upload className="mr-1.5 size-4" />
                    )}
                    {viewing.jobberInvoiceId ? 'Re-push to Jobber' : 'Push to Jobber'}
                  </Button>
                  <Button onClick={() => setViewing(null)} size="icon" title="Close" variant="ghost">
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
              <iframe
                className="mt-3 min-h-0 w-full flex-1 rounded-md border bg-white"
                src={`/api/christmas/invoices/${viewing.id}/pdf#toolbar=1`}
                title="Saved invoice"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ── Send dialog ── */}
      <Dialog onOpenChange={(next) => (next ? null : setSendTarget(null))} open={Boolean(sendTarget)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email invoice {sendTarget?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              Emails the PDF to the customer and re-syncs Zoho Sheet + WorkDrive under &ldquo;
              {sendTarget?.customerName}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label className="text-muted-foreground text-xs font-medium">Send to</Label>
              <Input onChange={(event) => setSendEmail(event.target.value)} type="email" value={sendEmail} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-muted-foreground text-xs font-medium">Personal note (optional)</Label>
              <Textarea
                onChange={(event) => setSendMessage(event.target.value)}
                placeholder="Happy holidays! Here's your invoice for the installation."
                rows={3}
                value={sendMessage}
              />
            </div>
            {sendResults ? (
              <div className="space-y-1 rounded-md border p-3 text-xs">
                <SendResultRow label="Email" result={sendResults.email} />
                <SendResultRow label="Zoho Sheet" result={sendResults.sheet} />
                <SendResultRow label="WorkDrive" result={sendResults.workdrive} />
                {sendResults.email?.ok ? (
                  <div className="border-t pt-2">
                    <p className="text-muted-foreground mb-2">
                      Resend accepted the message. Confirm it reached the inbox:
                    </p>
                    <Button
                      disabled={checkingId === sendTarget?.id}
                      onClick={() => handleCheckDelivery(sendTarget)}
                      size="sm"
                      variant="outline"
                    >
                      {checkingId === sendTarget?.id ? (
                        <Loader2 className="mr-1.5 size-3 animate-spin" />
                      ) : (
                        <ShieldCheck className="mr-1.5 size-3" />
                      )}
                      Check delivery
                    </Button>
                    <DeliveryResultLine result={deliveryResults[sendTarget?.id]} />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={() => setSendTarget(null)} variant="outline">
              Close
            </Button>
            <Button disabled={sending || !sendEmail.trim()} onClick={handleSend}>
              {sending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}
              Send invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
