'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Save, ShieldCheck, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function buildInitialForm(settings) {
  return {
    emailNotificationsEnabled: settings.emailNotificationsEnabled !== false,
    notificationToEmail: settings.notificationToEmail || '',
    fromName: settings.fromName || '',
    fromEmail: settings.fromEmail || '',
    subjectPrefix: settings.subjectPrefix || '',
    resendTemplateId: settings.resendTemplateId || '',
  }
}

async function saveLeadSettings(payload) {
  const response = await fetch('/api/leads/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Unable to save lead settings.')
  }

  return data.settings
}

async function fetchLeadSettings() {
  const response = await fetch('/api/leads/settings', {
    method: 'GET',
    cache: 'no-store',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Unable to load lead settings.')
  }

  return data.settings
}

function StatusCard({ title, value, tone = 'neutral', detail }) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-border bg-muted/30 text-foreground'

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {detail ? <div className="mt-2 text-sm leading-6 opacity-80">{detail}</div> : null}
    </div>
  )
}

export default function LeadSettingsClient({ initialSettings }) {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [form, setForm] = useState(() => buildInitialForm(initialSettings))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    let active = true

    async function syncSettings() {
      setIsSyncing(true)

      try {
        const nextSettings = await fetchLeadSettings()

        if (!active) {
          return
        }

        setSettings(nextSettings)
        setForm(buildInitialForm(nextSettings))
      } catch {
        // Keep the server-rendered settings if the client sync fails.
      } finally {
        if (active) {
          setIsSyncing(false)
        }
      }
    }

    syncSettings()

    return () => {
      active = false
    }
  }, [])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    async function persist() {
      setIsSaving(true)

      try {
        const nextSettings = await saveLeadSettings(form)
        setSettings(nextSettings)
        setForm(buildInitialForm(nextSettings))
        setMessage('Lead routing settings saved.')
        router.refresh()
      } catch (saveError) {
        setError(saveError.message || 'Unable to save lead settings.')
      } finally {
        setIsSaving(false)
      }
    }

    persist()
  }

  const saveDisabled = isSaving || isSyncing || !settings.canSave
  const providerTone = settings.providerReady ? 'success' : settings.apiKeyConfigured ? 'warning' : 'warning'

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div>
        <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Lead operations</p>
        <h1 className="text-foreground mt-2 text-3xl tracking-tight">Lead settings</h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
          Control where new lead notifications go, what sender appears in the inbox, and whether Resend
          notifications are active. You can also point notifications at a Resend template. The API key
          stays server-side in env vars.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Provider"
          value={settings.apiKeyConfigured ? 'Resend ready' : 'API key missing'}
          tone={providerTone}
          detail={
            settings.apiKeyConfigured
              ? 'The Resend API key is configured on the server.'
              : 'Add RESEND_API_KEY in the runtime env before email notifications can send.'
          }
        />
        <StatusCard
          title="Sender"
          value={settings.fromEmail || 'Not configured'}
          tone={settings.fromEmail ? 'success' : 'warning'}
          detail={settings.fromName || 'Sender name is not set yet.'}
        />
        <StatusCard
          title="Destination"
          value={settings.notificationToEmail || 'Not configured'}
          tone={settings.notificationToEmail ? 'success' : 'warning'}
          detail={
            settings.emailNotificationsEnabled
              ? 'New form submissions will notify this inbox.'
              : 'Email notifications are currently disabled.'
          }
        />
        <StatusCard
          title="Template"
          value={settings.resendTemplateId || 'Raw HTML email'}
          tone={settings.resendTemplateId ? 'success' : 'neutral'}
          detail={
            settings.resendTemplateId
              ? 'Lead notifications will use the configured Resend template.'
              : 'No template configured. The built-in HTML email will be used.'
          }
        />
      </div>

      <Card className="border-border bg-card/80 overflow-hidden border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email routing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="border-border bg-muted/20 flex items-start gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-current"
                checked={form.emailNotificationsEnabled}
                onChange={(event) => updateField('emailNotificationsEnabled', event.target.checked)}
              />
              <div>
                <div className="text-foreground font-medium">Enable lead notification emails</div>
                <div className="text-muted-foreground mt-1 text-sm leading-6">
                  When enabled, every successful lead submission will send a Resend email notification after
                  the record is saved to the database.
                </div>
              </div>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium">Notification recipient</label>
                <Input
                  type="email"
                  value={form.notificationToEmail}
                  onChange={(event) => updateField('notificationToEmail', event.target.value)}
                  placeholder="kathy@texassolarandroofing.com"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium">Subject prefix</label>
                <Input
                  value={form.subjectPrefix}
                  onChange={(event) => updateField('subjectPrefix', event.target.value)}
                  placeholder="New lead"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium">Sender name</label>
                <Input
                  value={form.fromName}
                  onChange={(event) => updateField('fromName', event.target.value)}
                  placeholder="Texas Solar and Roofing Pros"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium">Sender email</label>
                <Input
                  type="email"
                  value={form.fromEmail}
                  onChange={(event) => updateField('fromEmail', event.target.value)}
                  placeholder="leads@texassolarandroofing.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-foreground text-sm font-medium">Resend template ID</label>
              <Input
                value={form.resendTemplateId}
                onChange={(event) => updateField('resendTemplateId', event.target.value)}
                placeholder="tpl_123456789"
              />
              <div className="text-muted-foreground text-sm leading-6">
                Optional. If set, lead notifications will send through this Resend template using the lead
                data as template variables.
              </div>
            </div>

            {!settings.canSave ? (
              <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-4 text-sm leading-6">
                Saving is unavailable because `SANITY_API_WRITE_TOKEN` is not configured for this runtime.
              </div>
            ) : null}

            <div className="border-border bg-muted/30 rounded-xl border p-4 text-sm leading-6">
              <div className="text-foreground flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4" />
                What stays in env vars
              </div>
              <div className="text-muted-foreground mt-2">
                The Resend API key remains server-side in env vars. This screen only controls the sender,
                recipient, subject prefix, template ID, and whether the notification flow is enabled.
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <div className="flex items-center gap-2 font-medium">
                  <TriangleAlert className="h-4 w-4" />
                  {error}
                </div>
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {message}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={saveDisabled}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving…' : isSyncing ? 'Syncing…' : 'Save lead settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
