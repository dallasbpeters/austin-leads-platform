'use client'

import { Save, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const buildInitialForm = (settings) => ({
  templateKey: settings?.templateKey || 'christmas-classic',
  companyName: settings?.companyName || '',
  companyTagline: settings?.companyTagline || '',
  companyPhone: settings?.companyPhone || '',
  companyEmail: settings?.companyEmail || '',
  companyWebsite: settings?.companyWebsite || '',
  logoUrl: settings?.logoUrl || '',
  invoiceNumberPrefix: settings?.invoiceNumberPrefix || 'TCL',
  workdriveParentFolderId: settings?.workdriveParentFolderId || '',
  sheetResourceId: settings?.sheetResourceId || '',
  sheetWorksheetName: settings?.sheetWorksheetName || 'Christmas Invoices',
  terms: settings?.terms || '',
})

const fetchSettings = async () => {
  const response = await fetch('/api/christmas/invoice-settings', {
    method: 'GET',
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Unable to load invoice settings.')
  }
  return data.settings
}

const saveSettings = async (payload) => {
  const response = await fetch('/api/christmas/invoice-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Unable to save invoice settings.')
  }
  return data.settings
}

const StatusCard = ({ title, value, tone = 'neutral', detail }) => {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-border bg-muted/30 text-foreground'
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-2 text-lg font-semibold tracking-normal">{value}</div>
      {detail ? <div className="mt-2 text-sm leading-6 opacity-80">{detail}</div> : null}
    </div>
  )
}

const ChristmasInvoiceSettingsClient = ({ initialSettings, templates = [] }) => {
  const router = useRouter()
  const [settings, setSettings] = useState(initialSettings)
  const [form, setForm] = useState(() => buildInitialForm(initialSettings))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    let active = true

    const syncSettings = async () => {
      setIsSyncing(true)
      try {
        const nextSettings = await fetchSettings()
        if (!active) {
          return
        }
        setSettings(nextSettings)
        setForm(buildInitialForm(nextSettings))
      } catch {
        // Keep server-rendered settings if the client sync fails.
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

  const updateField = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const persist = async () => {
      setIsSaving(true)
      try {
        const nextSettings = await saveSettings(form)
        setSettings(nextSettings)
        setForm(buildInitialForm(nextSettings))
        setMessage('Christmas invoice settings saved.')
        router.refresh()
      } catch (saveError) {
        setError(saveError.message || 'Unable to save invoice settings.')
      } finally {
        setIsSaving(false)
      }
    }

    persist()
  }

  const saveDisabled = isSaving || isSyncing || !settings?.canSave

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div>
        <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Christmas lights</p>
        <h1 className="text-foreground mt-2 text-3xl tracking-normal">Invoice template settings</h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-[1rem] leading-7">
          Control the Christmas invoice template: which template is active, the company details printed in the
          header, and the Zoho destinations the invoice PDF and row sync to on creation. Secrets stay
          server-side in env vars.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          detail={
            templates.find((template) => template.key === settings?.templateKey)?.description ||
            'Template used for new invoices.'
          }
          title="Active template"
          tone={settings?.templateKey ? 'success' : 'warning'}
          value={
            templates.find((template) => template.key === settings?.templateKey)?.label ||
            settings?.templateKey ||
            'Default'
          }
        />
        <StatusCard
          detail={
            settings?.sheetReady
              ? 'Rows append to the configured Zoho Sheet worksheet.'
              : 'Set Zoho credentials + a sheet resource id to enable row sync.'
          }
          title="Zoho Sheet"
          tone={settings?.sheetReady ? 'success' : 'warning'}
          value={settings?.sheetReady ? 'Ready' : 'Not configured'}
        />
        <StatusCard
          detail={
            settings?.workdriveReady
              ? `PDFs file under ${settings.workdriveFolder || 'a configured folder'}.`
              : 'Set Zoho credentials + a WorkDrive parent folder to enable PDF sync.'
          }
          title="Zoho WorkDrive"
          tone={settings?.workdriveReady ? 'success' : 'warning'}
          value={settings?.workdriveReady ? 'Ready' : 'Not configured'}
        />
      </div>

      <Card className="bg-card/80 border-border overflow-hidden border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Christmas invoice template</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="templateKey">Active template</Label>
                <Select onValueChange={(value) => updateField('templateKey', value)} value={form.templateKey}>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoiceNumberPrefix">Invoice number prefix</Label>
                <Input
                  id="invoiceNumberPrefix"
                  onChange={(event) => updateField('invoiceNumberPrefix', event.target.value)}
                  placeholder="TCL"
                  value={form.invoiceNumberPrefix}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  onChange={(event) => updateField('companyName', event.target.value)}
                  placeholder="Texas Christmas Lights"
                  value={form.companyName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyTagline">Tagline</Label>
                <Input
                  id="companyTagline"
                  onChange={(event) => updateField('companyTagline', event.target.value)}
                  placeholder="Professional installation in Austin and surrounding areas"
                  value={form.companyTagline}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  onChange={(event) => updateField('companyPhone', event.target.value)}
                  placeholder="(512) 775-0561"
                  value={form.companyPhone}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  onChange={(event) => updateField('companyEmail', event.target.value)}
                  placeholder="hello@tx-christmaslights.com"
                  type="email"
                  value={form.companyEmail}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  onChange={(event) => updateField('companyWebsite', event.target.value)}
                  placeholder="www.tx-christmaslights.com"
                  value={form.companyWebsite}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Logo path (in /public)</Label>
                <Input
                  id="logoUrl"
                  onChange={(event) => updateField('logoUrl', event.target.value)}
                  placeholder="/images/tx-christmas-logo-full.png"
                  value={form.logoUrl}
                />
                <div className="text-muted-foreground text-sm leading-6">
                  Relative to <span className="font-medium">/public</span>, e.g.
                  /images/tx-christmas-logo-full.png. Defaults to the Christmas Lights wordmark.
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sheetWorksheetName">Zoho Sheet worksheet name</Label>
                <Input
                  id="sheetWorksheetName"
                  onChange={(event) => updateField('sheetWorksheetName', event.target.value)}
                  placeholder="Christmas Invoices"
                  value={form.sheetWorksheetName}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="workdriveParentFolderId">WorkDrive parent folder id</Label>
                <Input
                  id="workdriveParentFolderId"
                  onChange={(event) => updateField('workdriveParentFolderId', event.target.value)}
                  placeholder="syvbh…"
                  value={form.workdriveParentFolderId}
                />
                <div className="text-muted-foreground text-sm leading-6">
                  Falls back to CHRISTMAS_WORKDRIVE_PARENT_FOLDER_ID, then ZOHO_WORKDRIVE_PARENT_FOLDER_ID.
                  Invoices upload to <span className="font-medium">{'{Client Name}/Invoices/'}</span>.
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sheetResourceId">Zoho Sheet resource id</Label>
                <Input
                  id="sheetResourceId"
                  onChange={(event) => updateField('sheetResourceId', event.target.value)}
                  placeholder="From the sheet URL after /sheet/open/"
                  value={form.sheetResourceId}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="terms">Default terms / notes (printed)</Label>
              <Textarea
                id="terms"
                onChange={(event) => updateField('terms', event.target.value)}
                rows={3}
                value={form.terms}
              />
            </div>

            {!settings?.canSave ? (
              <div className="text-muted-foreground bg-muted/30 border-border rounded-xl border p-4 text-sm leading-6">
                Saving is unavailable because no Postgres connection string is configured for this runtime.
              </div>
            ) : null}

            <div className="bg-muted/30 border-border rounded-xl border p-4 text-sm leading-6">
              <div className="text-foreground flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4" />
                What stays in env vars
              </div>
              <div className="text-muted-foreground mt-2">
                Zoho OAuth credentials (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN) stay
                server-side. This screen only overrides company details, the active template, and the Zoho
                destinations.
              </div>
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <TriangleAlert className="size-4 shrink-0" />
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {message}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button disabled={saveDisabled} type="submit">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving…' : isSyncing ? 'Syncing…' : 'Save invoice settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChristmasInvoiceSettingsClient
