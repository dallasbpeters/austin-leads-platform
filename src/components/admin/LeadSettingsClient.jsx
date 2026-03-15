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
      <div className="font-medium text-sm">{title}</div>
      <div className="mt-2 font-semibold text-2xl tracking-tight">{value}</div>
      {detail ? <div className="mt-2 leading-6 text-sm opacity-80">{detail}</div> : null}
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
    <div className="p-6 space-y-6 lg:p-10">
      <div>
        <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Lead operations</p>
        <h1 className="mt-2 text-3xl text-foreground tracking-tight">Lead settings</h1>
        <p className="max-w-3xl mt-3 leading-7 text-base text-muted-foreground">
          Control where new lead notifications go, what sender appears in the inbox, and whether Resend
          notifications are active. You can also point notifications at a Resend template. The API key stays
          server-side in env vars.
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

      <Card className="bg-card/80 border border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email routing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="flex items-start gap-3 p-4 bg-muted/20 border border-border rounded-xl">
              <input
                type="checkbox"
                className="h-4 w-4 mt-1 accent-current"
                checked={form.emailNotificationsEnabled}
                onChange={(event) => updateField('emailNotificationsEnabled', event.target.checked)}
              />
              <div>
                <div className="font-medium text-foreground">Enable lead notification emails</div>
                <div className="mt-1 leading-6 text-muted-foreground text-sm">
                  When enabled, every successful lead submission will send a Resend email notification after
                  the record is saved to the database.
                </div>
              </div>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="font-medium text-foreground text-sm">Notification recipient</label>
                <Input
                  type="email"
                  value={form.notificationToEmail}
                  onChange={(event) => updateField('notificationToEmail', event.target.value)}
                  placeholder="kathy@texassolarandroofing.com"
                />
              </div>
              <div className="grid gap-2">
                <label className="font-medium text-foreground text-sm">Subject prefix</label>
                <Input
                  value={form.subjectPrefix}
                  onChange={(event) => updateField('subjectPrefix', event.target.value)}
                  placeholder="New lead"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="font-medium text-foreground text-sm">Sender name</label>
                <Input
                  value={form.fromName}
                  onChange={(event) => updateField('fromName', event.target.value)}
                  placeholder="Texas Solar and Roofing Pros"
                />
              </div>
              <div className="grid gap-2">
                <label className="font-medium text-foreground text-sm">Sender email</label>
                <Input
                  type="email"
                  value={form.fromEmail}
                  onChange={(event) => updateField('fromEmail', event.target.value)}
                  placeholder="leads@texassolarandroofing.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="font-medium text-foreground text-sm">Resend template ID</label>
              <Input
                value={form.resendTemplateId}
                onChange={(event) => updateField('resendTemplateId', event.target.value)}
                placeholder="tpl_123456789"
              />
              <div className="leading-6 text-muted-foreground text-sm">
                Optional. If set, lead notifications will send through this Resend template using the lead
                data as template variables.
              </div>
            </div>

            {!settings.canSave ? (
              <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl">
                Saving is unavailable because `DATABASE_URL` or `NEON_DATABASE_URL` is not configured for this
                runtime.
              </div>
            ) : null}

            <div className="p-4 leading-6 text-sm bg-muted/30 border border-border rounded-xl">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4" />
                What stays in env vars
              </div>
              <div className="mt-2 text-muted-foreground">
                The Resend API key remains server-side in env vars. This screen only controls the sender,
                recipient, subject prefix, template ID, and whether the notification flow is enabled.
              </div>
            </div>

            {error ? (
              <div className="p-4 text-rose-900 text-sm bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-2 font-medium">
                  <TriangleAlert className="h-4 w-4" />
                  {error}
                </div>
              </div>
            ) : null}

            {message ? (
              <div className="p-4 text-emerald-900 text-sm bg-emerald-50 border border-emerald-200 rounded-xl">
                {message}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={saveDisabled}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving…' : isSyncing ? 'Syncing…' : 'Save lead settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
