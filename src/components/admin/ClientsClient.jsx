'use client'

import { AlertTriangle, LoaderCircle, Plus, RefreshCw, Search, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

const emptyClient = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  notes: '',
}

function formatDate(value) {
  if (!value) return 'Never'
  return new Date(value).toLocaleDateString()
}

export default function ClientsClient({ initialClients, clientDbReady, dbConfigured, dbError }) {
  const [clients, setClients] = useState(initialClients)
  const [form, setForm] = useState(emptyClient)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return clients
    return clients.filter((client) =>
      [client.name, client.email, client.company, client.phone].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(query),
      ),
    )
  }, [clients, search])

  async function refreshClients() {
    setRefreshing(true)
    setError('')

    try {
      const response = await fetch('/api/clients?limit=300')
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Unable to load clients.')
      setClients(data.clients || [])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load clients.')
    } finally {
      setRefreshing(false)
    }
  }

  async function saveClient(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Unable to save client.')
      setClients((current) => [data.client, ...current.filter((client) => client.id !== data.client.id)])
      setForm(emptyClient)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save client.')
    } finally {
      setSaving(false)
    }
  }

  if (!clientDbReady) {
    return (
      <div className="p-6 lg:p-10">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Persistent client records require the platform database.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm leading-7">
            <p>
              {dbConfigured
                ? 'The database is configured, but client tables could not be loaded.'
                : 'Add DATABASE_URL, STORAGEDB_POSTGRES_URL, or POSTGRES_URL, then run the database setup flow.'}
            </p>
            {dbError ? (
              <pre className="bg-muted text-foreground/80 overflow-x-auto rounded border p-3 text-xs">
                {JSON.stringify(dbError, null, 2)}
              </pre>
            ) : null}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Client records</p>
          <h1 className="text-foreground mt-2 text-3xl tracking-normal">Clients</h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
            Store client identity and contact details before sending documents for signature.
          </p>
        </div>
        <Button variant="outline" onClick={refreshClients} disabled={refreshing}>
          <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="absolute top-3.5 left-4 h-4 w-4" />
          <AlertTitle>Client operation failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4" />
              Add client
            </CardTitle>
            <CardDescription>Client name and email are required for signature requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={saveClient}>
              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium">Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Jane Customer"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-foreground text-sm font-medium">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="(512) 555-0199"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-foreground text-sm font-medium">Company</label>
                  <Input
                    value={form.company}
                    onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium">Address</label>
                <Input
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Service or billing address"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium">Notes</label>
                <Textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Internal notes"
                />
              </div>
              <Button type="submit" disabled={saving} fullWidth>
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save client'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base">Stored clients</CardTitle>
                <CardDescription>{clients.length} total client records</CardDescription>
              </div>
              <div className="relative md:w-80">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search clients"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="text-foreground font-medium">{client.name}</div>
                      <div className="text-muted-foreground text-sm">{client.company || 'Individual'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground text-sm">{client.email}</div>
                      <div className="text-muted-foreground text-sm">{client.phone || 'No phone'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-sm">
                      {formatDate(client.updated_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
