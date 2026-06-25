'use client'

import { Copy, ExternalLink, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

export default function DocumentRequestActions({
  requestId,
  recipientLinks = [],
  canSync = true,
  canEmail = true,
  canDelete = true,
  previewHref = '',
}) {
  const router = useRouter()
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const primaryLink = useMemo(() => recipientLinks.find((link) => link.url)?.url || '', [recipientLinks])

  async function runAction(action, handler) {
    setBusyAction(action)
    setError('')
    setStatusMessage('')
    try {
      const result = await handler()
      if (result) {
        setStatusMessage(result)
      }
      router.refresh()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Action failed.')
    } finally {
      setBusyAction('')
    }
  }

  async function copyLink() {
    if (!primaryLink) {
      throw new Error('No signing link available yet.')
    }
    await navigator.clipboard.writeText(primaryLink)
  }

  async function openLink() {
    if (!primaryLink) {
      throw new Error('No signing link available yet.')
    }
    window.open(primaryLink, '_blank', 'noopener,noreferrer')
  }

  async function resendEmail() {
    const response = await fetch(`/api/documents/signature-requests/${requestId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.error || 'Unable to resend the email.')
    }
    if (data?.email?.status === 'sent') {
      return `Resend sent${data.email.id ? ` (${data.email.id})` : ''}.`
    }
    if (data?.email?.status === 'skipped') {
      return `Resend skipped: ${data.email.reason || 'no delivery performed.'}`
    }
    if (data?.email?.status === 'error') {
      return `Resend error: ${data.email.reason || 'Resend returned an error.'}`
    }
    return 'Resend request completed.'
  }

  async function syncRequest() {
    const response = await fetch(`/api/docuseal/submissions/${requestId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.error || 'Unable to sync the request.')
    }
  }

  async function deleteRequest() {
    if (!window.confirm('Delete this request? This cannot be undone.')) {
      return
    }

    const response = await fetch(`/api/documents/signature-requests/${requestId}`, {
      method: 'DELETE',
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.error || 'Unable to delete the request.')
    }

    window.location.assign('/documents/history')
  }

  return (
    <div className="space-y-3">
      {error ? <div className="text-destructive text-sm">{error}</div> : null}
      {statusMessage ? <div className="text-sm text-emerald-700">{statusMessage}</div> : null}
      <div className="flex flex-wrap gap-2">
        {previewHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={previewHref}>
              <ExternalLink className="h-4 w-4" />
              Preview email
            </Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!primaryLink || busyAction}
          onClick={() => runAction('open', openLink)}
        >
          <ExternalLink className="h-4 w-4" />
          Open
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!primaryLink || busyAction}
          onClick={() => runAction('copy', copyLink)}
        >
          <Copy className="h-4 w-4" />
          Copy link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canSync || busyAction}
          onClick={() => runAction('sync', syncRequest)}
        >
          <RefreshCw className={busyAction === 'sync' ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Sync
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canEmail || busyAction}
          onClick={() => runAction('email', resendEmail)}
        >
          <RefreshCw className={busyAction === 'email' ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Resend email
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={!canDelete || busyAction}
          onClick={() => runAction('delete', deleteRequest)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}
