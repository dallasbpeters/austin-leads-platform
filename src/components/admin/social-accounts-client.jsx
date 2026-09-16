'use client'

/*
 * Social accounts — the plug-and-play page for TikTok and Instagram.
 *
 * Each platform walks through three states on its own:
 *   1. Setup needed  → the checklist, the exact redirect URI to paste, and the
 *                      env vars to fill in.
 *   2. Ready         → a Connect button (the env vars are in).
 *   3. Connected     → who is connected, token health, Test and Disconnect.
 */

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AlertTriangle, CheckCircle2, Copy, Link2, Loader2, PlugZap, RefreshCw, Unplug } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const when = (value) =>
  value
    ? new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—'

const daysUntil = (value) =>
  value ? Math.round((new Date(value).getTime() - Date.now()) / 86_400_000) : null

function CopyValue({ value }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked (e.g. inside another site's frame); the value is still selectable.
    }
  }
  return (
    <span className="bg-muted inline-flex max-w-full items-center gap-2 rounded-md px-2 py-1 font-mono text-xs">
      <span className="truncate select-all">{value}</span>
      <button
        aria-label="Copy"
        className="text-muted-foreground hover:text-foreground shrink-0"
        onClick={copy}
        type="button"
      >
        {copied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  )
}

function StatusBadge({ platform }) {
  if (platform.account) {
    return <Badge className="bg-emerald-600 hover:bg-emerald-600">Connected</Badge>
  }
  if (platform.configured) {
    return <Badge variant="secondary">Ready to connect</Badge>
  }
  return <Badge variant="outline">Setup needed</Badge>
}

function SetupSteps({ platform }) {
  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        {platform.setup.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">Redirect URI</p>
        <CopyValue value={platform.redirectUri} />
        {platform.redirectUri.startsWith('http://') ? (
          <p className="text-xs text-amber-700">
            TikTok and Instagram only accept https. Open this page on the live site to get the real address,
            or set <code>SOCIAL_REDIRECT_BASE</code> to it.
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">Environment variables</p>
        <div className="flex flex-wrap gap-2">
          {platform.envVars.map((name) => (
            <CopyValue key={name} value={name} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ConnectedAccount({ platform, onChanged }) {
  const [busy, setBusy] = useState('')
  const [result, setResult] = useState(null)
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)
  const { account } = platform
  const days = daysUntil(account.expiresAt)

  const test = async () => {
    setBusy('test')
    setResult(null)
    try {
      const response = await fetch(`/api/social/${platform.id}/test`, { method: 'POST' })
      const payload = await response.json()
      setResult(
        response.ok ? { ok: `Working — signed in as ${payload.username}.` } : { error: payload.error },
      )
      onChanged()
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setBusy('')
    }
  }

  const disconnect = async () => {
    if (!confirmingDisconnect) {
      setConfirmingDisconnect(true)
      return
    }
    setBusy('disconnect')
    await fetch(`/api/social/${platform.id}/disconnect`, { method: 'POST' })
    setBusy('')
    onChanged()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {account.avatarUrl ? (
          // oxlint-disable-next-line next/no-img-element -- platform avatar on a signed CDN URL
          <img alt="" className="size-12 rounded-full object-cover" src={account.avatarUrl} />
        ) : (
          <div className="bg-muted size-12 rounded-full" />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">
            {account.username ? `@${account.username}` : account.accountId}
          </p>
          <p className="text-muted-foreground text-xs">
            Connected {when(account.connectedAt)}
            {account.connectedBy ? ` by ${account.connectedBy}` : ''}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Access token</dt>
        <dd>
          {days === null
            ? 'No expiry'
            : days < 0
              ? 'Expired — refreshes on next use'
              : `Good for ${days} more day${days === 1 ? '' : 's'}`}
        </dd>
        {account.refreshExpiresAt ? (
          <>
            <dt className="text-muted-foreground">Reconnect by</dt>
            <dd>{when(account.refreshExpiresAt)}</dd>
          </>
        ) : null}
        <dt className="text-muted-foreground">Permissions</dt>
        <dd className="text-xs">{account.scopes.join(', ') || '—'}</dd>
      </dl>

      {account.lastError ? (
        <p className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {account.lastError}
        </p>
      ) : null}
      {result?.ok ? <p className="text-sm text-emerald-700">{result.ok}</p> : null}
      {result?.error ? <p className="text-sm text-red-700">{result.error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button disabled={Boolean(busy)} onClick={test} size="sm" variant="outline">
          {busy === 'test' ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <PlugZap className="mr-1.5 size-4" />
          )}
          Test connection
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={`/api/social/${platform.id}/connect`}>
            <RefreshCw className="mr-1.5 size-4" />
            Reconnect
          </a>
        </Button>
        <Button
          disabled={busy === 'disconnect'}
          onClick={disconnect}
          size="sm"
          variant={confirmingDisconnect ? 'destructive' : 'ghost'}
        >
          <Unplug className="mr-1.5 size-4" />
          {confirmingDisconnect ? 'Click again to disconnect' : 'Disconnect'}
        </Button>
      </div>
    </div>
  )
}

export default function SocialAccountsClient({ platforms, tokenKeySet, connected, error, dbError }) {
  const router = useRouter()
  const refresh = () => router.refresh()
  const justConnected = platforms.find((platform) => platform.id === connected)

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div>
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Texas Christmas Lights</p>
        <h1 className="text-2xl font-semibold">Social accounts</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Connect TikTok and Instagram once, and the Reel studio can post straight to them. Each platform
          shows exactly what to set up first.
        </p>
      </div>

      {justConnected ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" />
          {justConnected.label} is connected.
        </p>
      ) : null}
      {error ? (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
      {dbError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Database: {dbError}
        </p>
      ) : null}
      {tokenKeySet ? null : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">One more variable first: SOCIAL_TOKEN_KEY</p>
          <p className="mt-1">
            Tokens are encrypted before they are stored. Set <code>SOCIAL_TOKEN_KEY</code> to a long random
            value (for example the output of <code>openssl rand -hex 32</code>) in Vercel and{' '}
            <code>.env.local</code>. Keep it stable — changing it disconnects every account.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{platform.label}</CardTitle>
                <StatusBadge platform={platform} />
              </div>
              <CardDescription>
                {platform.id === 'tiktok'
                  ? 'Posts to your drafts until TikTok audits the app, then straight to the feed.'
                  : 'Posts Reels to your professional Instagram account.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {platform.account ? (
                <ConnectedAccount onChanged={refresh} platform={platform} />
              ) : platform.configured ? (
                <div className="space-y-4">
                  <p className="text-sm">
                    The app keys are in. Sign in to the {platform.label} account to connect it.
                  </p>
                  <Button asChild disabled={!tokenKeySet}>
                    <a
                      aria-disabled={!tokenKeySet}
                      href={tokenKeySet ? `/api/social/${platform.id}/connect` : undefined}
                    >
                      <Link2 className="mr-1.5 size-4" />
                      Connect {platform.label}
                    </a>
                  </Button>
                  <details className="text-sm">
                    <summary className="text-muted-foreground cursor-pointer">Setup checklist</summary>
                    <div className="mt-3">
                      <SetupSteps platform={platform} />
                    </div>
                  </details>
                </div>
              ) : (
                <SetupSteps platform={platform} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
