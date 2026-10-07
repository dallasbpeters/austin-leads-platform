'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import {
  Copy,
  Download,
  Eye,
  FileSignature,
  Loader2,
  Mail,
  MailCheck,
  MailOpen,
  MailWarning,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
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

function StatusBadge({ quote }) {
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

function buildSentDescription(quote) {
  if (quote.openedAt) {
    return `Sent to ${quote.emailedTo || 'customer'} · first opened ${shortDate(quote.openedAt)}`
  }
  if (quote.deliveredAt) {
    return `Sent to ${quote.emailedTo || 'customer'} · delivered ${shortDate(quote.deliveredAt)}`
  }
  return `Sent to ${quote.emailedTo || 'customer'}`
}

async function apiSendQuote(id, email, message) {
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

async function apiRequestSignature(id, email, message) {
  const response = await fetch(`/api/quotes/${id}/signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, message }),
  })
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error || 'Signature request failed')
  }
  return { signature: { ok: true, to: email } }
}

function SendResultRow({ label, result }) {
  const statusClass = result?.ok
    ? 'text-emerald-600'
    : result?.skipped
      ? 'text-muted-foreground'
      : 'text-destructive'
  const statusText = result
    ? result.ok
      ? 'Done'
      : result.skipped
        ? 'Skipped'
        : result.error || 'Failed'
    : '—'
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={statusClass}>{statusText}</span>
    </div>
  )
}

export default function QuotesHistoryClient({ initialQuotes = [], dbConfigured, dbError }) {
  const router = useRouter()
  const [quotes, setQuotes] = useState(initialQuotes)
  const [sendTarget, setSendTarget] = useState(null)
  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResults, setSendResults] = useState(null)
  const [previewQuote, setPreviewQuote] = useState(null)

  const refreshQuotes = useCallback(async () => {
    try {
      const response = await fetch('/api/quotes')
      if (response.ok) {
        const payload = await response.json()
        setQuotes(payload.quotes ?? [])
      }
    } catch {
      // Non-fatal.
    }
  }, [])

  const [syncingDelivery, setSyncingDelivery] = useState(false)

  const syncDeliveryAndRefresh = async () => {
    setSyncingDelivery(true)
    try {
      await fetch('/api/quotes/email-status', { method: 'POST' })
    } catch {
      // Non-fatal: the list still reloads with the stored status.
    } finally {
      await refreshQuotes()
      setSyncingDelivery(false)
    }
  }

  const openSendDialog = (quote) => {
    setSendTarget(quote)
    setSendEmail(quote.customerEmail || '')
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
      const results = await apiSendQuote(sendTarget.id, sendEmail, sendMessage)
      setSendResults(results)
      await refreshQuotes()
    } catch (sendError) {
      setSendResults({ email: { ok: false, error: sendError.message } })
    } finally {
      setSending(false)
    }
  }

  const handleRequestSignature = async () => {
    if (!sendTarget) {
      return
    }
    setSending(true)
    setSendResults(null)
    try {
      const results = await apiRequestSignature(sendTarget.id, sendEmail, sendMessage)
      setSendResults(results)
      await refreshQuotes()
    } catch (signError) {
      setSendResults({ signature: { ok: false, error: signError.message } })
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (quote) => {
    if (!window.confirm(`Delete quote ${quote.quoteNumber} for ${quote.customerName}?`)) {
      return
    }
    await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' })
    await refreshQuotes()
  }

  const handleEdit = (quote) => router.push(`/quotes?edit=${quote.id}`)
  const handleDuplicate = (quote) => router.push(`/quotes?dupe=${quote.id}`)

  if (!dbConfigured) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Quote History</CardTitle>
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
          <h1 className="text-2xl font-semibold tracking-tight">Quote History</h1>
          <p className="text-muted-foreground text-sm">
            All saved quotes — preview, send, or edit any quote.
          </p>
        </div>
        <div className="flex gap-2">
          <Button disabled={syncingDelivery} onClick={syncDeliveryAndRefresh} size="sm" variant="outline">
            <RefreshCw className={`mr-1.5 size-4${syncingDelivery ? ' animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => router.push('/quotes')} size="sm">
            <Plus className="mr-1.5 size-4" /> New quote
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
          <CardTitle className="text-base">All Quotes</CardTitle>
          <CardDescription>{quotes.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No quotes yet —{' '}
              <button className="text-primary underline" onClick={() => router.push('/quotes')} type="button">
                build your first one
              </button>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Net Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-xs">{quote.quoteNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{quote.customerName}</div>
                      <div className="text-muted-foreground text-xs">{quote.customerEmail}</div>
                      <div className="text-muted-foreground text-xs">{quote.propertyCity}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {quote.systemSizeKw} kW
                      <br />
                      <span className="text-muted-foreground text-xs">
                        {num(quote.annualProductionKwh)} kWh/yr
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{money(quote.netPrice)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {shortDate(quote.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge quote={quote} />
                      {quote.signatureRequestedAt ? (
                        <div className="text-muted-foreground mt-1 flex items-center text-[11px]">
                          <FileSignature className="mr-1 size-3" /> Signature requested
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          onClick={() => setPreviewQuote(quote)}
                          size="icon"
                          title="Preview PDF"
                          variant="ghost"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button asChild size="icon" title="Download PDF" variant="ghost">
                          <a href={`/api/quotes/${quote.id}/pdf`} rel="noreferrer" target="_blank">
                            <Download className="size-4" />
                          </a>
                        </Button>
                        <Button
                          onClick={() => openSendDialog(quote)}
                          size="icon"
                          title="Send email / request signature"
                          variant="ghost"
                        >
                          <Mail className="size-4" />
                        </Button>
                        <Button onClick={() => handleEdit(quote)} size="icon" title="Edit" variant="ghost">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          onClick={() => handleDuplicate(quote)}
                          size="icon"
                          title="Use as template"
                          variant="ghost"
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(quote)}
                          size="icon"
                          title="Delete"
                          variant="ghost"
                        >
                          <Trash2 className="text-destructive size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Saved quote preview dialog ── */}
      <Dialog onOpenChange={(open) => (open ? null : setPreviewQuote(null))} open={Boolean(previewQuote)}>
        <DialogContent className="flex h-[92vh] w-[94vw] max-w-[1100px]! flex-col sm:max-w-[1100px]!">
          <DialogHeader>
            <DialogTitle>
              {previewQuote?.quoteNumber} — {previewQuote?.customerName}
            </DialogTitle>
            <DialogDescription>
              {previewQuote?.status === 'sent' ? buildSentDescription(previewQuote) : 'Draft — not sent yet.'}
            </DialogDescription>
          </DialogHeader>
          {previewQuote ? (
            <iframe
              className="h-full min-h-0 w-full flex-1 rounded-md border bg-white"
              src={`/api/quotes/${previewQuote.id}/pdf#toolbar=0&navpanes=0`}
              title={`Quote ${previewQuote.quoteNumber} preview`}
            />
          ) : null}
          <DialogFooter>
            <Button onClick={() => setPreviewQuote(null)} variant="outline">
              Close
            </Button>
            <Button onClick={() => handleDuplicate(previewQuote)} variant="outline">
              <Copy className="mr-2 size-4" /> Use as template
            </Button>
            <Button
              onClick={() => {
                const target = previewQuote
                setPreviewQuote(null)
                openSendDialog(target)
              }}
            >
              <Mail className="mr-2 size-4" /> Send / Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Send / signature dialog ── */}
      <Dialog onOpenChange={(open) => (open ? null : setSendTarget(null))} open={Boolean(sendTarget)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send quote {sendTarget?.quoteNumber}</DialogTitle>
            <DialogDescription>
              Emails the PDF to the customer, logs to Zoho Sheet, and files in WorkDrive under &ldquo;
              {sendTarget?.customerName}&rdquo;. Or request a customer e-signature via DocuSeal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-medium">Send to</Label>
              <Input onChange={(event) => setSendEmail(event.target.value)} type="email" value={sendEmail} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-medium">Personal note (optional)</Label>
              <Textarea
                onChange={(event) => setSendMessage(event.target.value)}
                placeholder="It was great meeting you — here's the quote we discussed."
                rows={3}
                value={sendMessage}
              />
            </div>
            {sendResults ? (
              <div className="space-y-1 rounded-md border p-3 text-xs">
                <SendResultRow label="Email" result={sendResults.email} />
                <SendResultRow label="Zoho Sheet" result={sendResults.sheet} />
                <SendResultRow label="WorkDrive" result={sendResults.workdrive} />
                <SendResultRow label="E-Signature" result={sendResults.signature} />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={() => setSendTarget(null)} variant="outline">
              Close
            </Button>
            <Button
              disabled={sending || !sendEmail.trim()}
              onClick={handleRequestSignature}
              title="Customer gets a DocuSeal signing link — their signature is captured digitally"
              variant="outline"
            >
              {sending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileSignature className="mr-2 size-4" />
              )}
              Request signature
            </Button>
            <Button disabled={sending || !sendEmail.trim()} onClick={handleSend}>
              {sending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}
              Send & archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
