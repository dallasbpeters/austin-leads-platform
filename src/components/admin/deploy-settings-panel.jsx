'use client'

/*
 * Deploy settings — sets the reel and social variables on Vercel and Railway
 * from here, and redeploys. Values go out and never come back: the page only
 * ever learns whether a variable is set.
 */

import { useCallback, useEffect, useState } from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  RefreshCw,
  Rocket,
  Wand2,
  Wrench,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

async function post(body) {
  const response = await fetch('/api/social/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))
  return { ok: response.ok, ...payload }
}

function PlaceBadge({ label, state }) {
  if (!state) {
    return null
  }
  if (state === 'set') {
    return (
      <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
        <CheckCircle2 className="size-3" />
        {label}
      </Badge>
    )
  }
  if (state === 'missing') {
    return (
      <Badge className="gap-1" variant="outline">
        <XCircle className="size-3" />
        {label}
      </Badge>
    )
  }
  return <Badge variant="secondary">{label} ?</Badge>
}

function Health({ ok, title, message }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
      )}
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground break-words">{message}</p>
      </div>
    </div>
  )
}

function SettingRow({ setting, onDone, disabled }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState(null)
  const [confirm, setConfirm] = useState(false)

  const save = async (action) => {
    setBusy(true)
    setNote(null)
    const result = await post({
      action,
      key: setting.key,
      value,
      confirmReplace: action === 'generate' && confirm,
    })
    setBusy(false)
    if (result.needsConfirm) {
      setConfirm(true)
      setNote({ error: `${result.error} Tap again to replace it.` })
      return
    }
    if (!result.ok) {
      setNote({ error: result.error })
      return
    }
    setValue('')
    setConfirm(false)
    setNote({ ok: `Saved to ${result.wrote.join(', ')}.` })
    onDone()
  }

  const everywhere = [setting.vercel, setting.railway].filter(Boolean).every((state) => state === 'set')

  return (
    <div className="space-y-2 border-t py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {setting.label}
            {setting.optional ? <span className="text-muted-foreground font-normal"> · optional</span> : null}
          </p>
          <p className="text-muted-foreground font-mono text-xs">{setting.key}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <PlaceBadge label="Vercel" state={setting.vercel} />
          <PlaceBadge label="Railway" state={setting.railway} />
        </div>
      </div>
      <p className="text-muted-foreground text-xs">{setting.help}</p>

      {setting.kind === 'generate' ? (
        <Button
          disabled={disabled || busy}
          onClick={() => save('generate')}
          size="sm"
          variant={confirm ? 'destructive' : everywhere ? 'outline' : 'default'}
        >
          {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Wand2 className="mr-1.5 size-4" />}
          {confirm ? 'Replace it anyway' : everywhere ? 'Generate a new one' : 'Generate and set'}
        </Button>
      ) : (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            save('set')
          }}
        >
          <Input
            autoComplete="off"
            className="min-w-0 flex-1 font-mono text-xs"
            disabled={disabled || busy}
            onChange={(event) => setValue(event.target.value)}
            placeholder={everywhere ? 'Set — paste to replace' : setting.placeholder || 'Paste the value'}
            spellCheck={false}
            type={setting.kind === 'secret' ? 'password' : 'text'}
            value={value}
          />
          <Button disabled={disabled || busy || !value.trim()} size="sm" type="submit">
            {busy ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <KeyRound className="mr-1.5 size-4" />
            )}
            Save
          </Button>
        </form>
      )}

      {disabled ? (
        <p className="text-xs text-amber-700">
          {setting.targets.includes('railway')
            ? 'Locked until Railway connects: save a working Railway project token above, then tap Redeploy site.'
            : 'Locked until Vercel connects.'}
        </p>
      ) : null}
      {note?.ok ? <p className="text-xs text-emerald-700">{note.ok}</p> : null}
      {note?.error ? <p className="text-xs text-red-700">{note.error}</p> : null}
    </div>
  )
}

function ActionButton({ id, action, disabled, icon: Icon, onClick, primary, children }) {
  return (
    <Button
      disabled={disabled || Boolean(action)}
      onClick={onClick}
      size="sm"
      variant={primary ? 'default' : 'outline'}
    >
      {action === id ? (
        <Loader2 className="mr-1.5 size-4 animate-spin" />
      ) : (
        <Icon className="mr-1.5 size-4" />
      )}
      {children}
    </Button>
  )
}

function railwayMessage(status) {
  const service = status.railwayService
  if (status.railway.error || service?.error) {
    return status.railway.error || service.error
  }
  const last = service?.deployment ? ` · last deploy ${service.deployment.status.toLowerCase()}` : ''
  return `${service?.service} in ${service?.project}${last}`
}

export default function DeploySettingsPanel() {
  const [status, setStatus] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [action, setAction] = useState('')
  const [message, setMessage] = useState(null)
  const [savedSinceDeploy, setSavedSinceDeploy] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/social/settings', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || `Status ${response.status}`)
      }
      setStatus(payload)
      setLoadError(null)
    } catch (error) {
      setLoadError(error.message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const run = async (name, body) => {
    setAction(name)
    setMessage(null)
    const result = await post(body)
    setAction('')
    setMessage(result.ok ? { ok: result.message } : { error: result.error })
    if (result.ok && body.target === 'vercel') {
      setSavedSinceDeploy(false)
    }
    load()
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
          {loadError ? (
            <span className="text-red-700">{loadError}</span>
          ) : (
            <>
              <Loader2 className="size-4 animate-spin" /> Checking Vercel and Railway…
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  const groups = [...new Set(status.settings.map((setting) => setting.group))]
  const stale = status.settings.filter((setting) => setting.vercel === 'set' && !setting.live)
  const railwayOk = status.railway.ready && !status.railwayService?.error

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">Deploy settings</CardTitle>
          <Button onClick={load} size="sm" variant="ghost">
            <RefreshCw className="mr-1.5 size-4" />
            Check again
          </Button>
        </div>
        <CardDescription>
          Paste a key once and it is saved to Vercel, Railway, or both. Saved values are never shown again.
          {status.local ? ' On this computer they also go to .env.local.' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Health message={status.vercel.error || 'Connected.'} ok={status.vercel.ready} title="Vercel" />
          <Health message={railwayMessage(status)} ok={railwayOk} title="Railway" />
          <Health message={status.renderer.message} ok={status.renderer.ok} title="Renderer" />
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton
            action={action}
            disabled={!status.vercel.ready}
            icon={Rocket}
            id="vercel"
            onClick={() => run('vercel', { action: 'redeploy', target: 'vercel' })}
            primary={stale.length > 0 || savedSinceDeploy}
          >
            Redeploy site
          </ActionButton>
          <ActionButton
            action={action}
            disabled={!railwayOk}
            icon={Rocket}
            id="railway"
            onClick={() => run('railway', { action: 'redeploy', target: 'railway' })}
          >
            Redeploy renderer
          </ActionButton>
          <ActionButton
            action={action}
            disabled={!railwayOk}
            icon={Wrench}
            id="fix"
            onClick={() => run('fix', { action: 'fix-railway' })}
            primary={!status.renderer.ok}
          >
            Fix renderer build
          </ActionButton>
        </div>
        {message?.ok ? <p className="text-sm text-emerald-700">{message.ok}</p> : null}
        {message?.error ? <p className="text-sm text-red-700">{message.error}</p> : null}

        {!status.local && (stale.length > 0 || savedSinceDeploy) ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Saved to Vercel, but the live site still runs without it
            {stale.length > 0 ? ` (${stale.map((setting) => setting.key).join(', ')})` : ''}. Tap Redeploy
            site.
          </p>
        ) : null}

        {groups.map((group) => (
          <section className="space-y-3" key={group}>
            <h3 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">{group}</h3>
            <div className="rounded-lg border p-4">
              {status.settings
                .filter((setting) => setting.group === group)
                .map((setting) => (
                  <SettingRow
                    disabled={
                      (setting.targets.includes('vercel') && !status.vercel.ready) ||
                      (setting.targets.includes('railway') && !railwayOk)
                    }
                    key={setting.key}
                    onDone={() => {
                      if (setting.targets.includes('vercel')) {
                        setSavedSinceDeploy(true)
                      }
                      load()
                    }}
                    setting={setting}
                  />
                ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  )
}
