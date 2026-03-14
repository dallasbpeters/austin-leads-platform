'use client'

import { startTransition } from 'react'
import { Globe2, Pencil, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDomainsManager } from '@/hooks/useDomainsManager'

function DomainStatus({ status }) {
  const tone =
    status === 'active'
      ? 'default'
      : status === 'redirect-only'
        ? 'secondary'
        : status === 'not-added'
          ? 'outline'
          : 'outline'

  return <Badge variant={tone}>{status}</Badge>
}

export default function DomainsClient({ initialDomains, sites, vercelEnabled }) {
  const {
    domains,
    editForm,
    editingDomain,
    form,
    loading,
    query,
    addDomain,
    cancelEditing,
    refreshDomains,
    removeDomain,
    saveDomain,
    setEditForm,
    setForm,
    setQuery,
    startEditing,
    verifyDomain,
  } = useDomainsManager({ initialDomains, sites, vercelEnabled })

  const filteredDomains = domains.filter((domainRecord) =>
    [domainRecord.domain, domainRecord.siteSlug, domainRecord.redirectTarget, domainRecord.verificationStatus]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Domain operations</p>
          <h1 className="text-foreground mt-2 text-3xl tracking-tight">Manage Vercel project domains</h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
            The UI can add domains to the Vercel project, sync the actual attached project domains, keep track
            of which site each one should serve, and surface DNS instructions when verification is still
            pending.
          </p>
        </div>
      </div>

      <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border p-4 text-sm leading-7">
        <span className="text-foreground font-medium">How to connect a domain:</span> add the domain below,
        copy the DNS record Vercel returns, create that record at your registrar, then come back here and
        click <span className="text-foreground font-medium">Verify</span>. A domain is only fully connected
        when its status shows <span className="text-foreground font-medium">active</span>.
      </div>

      <Card className="border-border bg-card/70 overflow-hidden border">
        <CardContent className="p-4">
          <form className="space-y-4" onSubmit={addDomain}>
            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                  <Input
                    className="border-border bg-background h-10 rounded-lg pl-11 text-base"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search any domain"
                  />
                </div>
              </div>
              <Input
                className="h-10 rounded-lg xl:w-[17rem]"
                value={form.domain}
                onChange={(event) => setForm((current) => ({ ...current, domain: event.target.value }))}
                placeholder="newdomain.com"
              />
              <Select
                value={form.siteSlug}
                onValueChange={(value) => setForm((current) => ({ ...current, siteSlug: value }))}
              >
                <SelectTrigger className="h-10 rounded-lg xl:w-[15rem]">
                  <SelectValue placeholder="Choose site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.slug} value={site.slug}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="h-10 rounded-lg xl:w-[17rem]"
                value={form.redirectTarget}
                onChange={(event) =>
                  setForm((current) => ({ ...current, redirectTarget: event.target.value }))
                }
                placeholder="Redirect target (optional)"
              />
              <Button
                type="submit"
                size="lg"
                className="h-10 rounded-lg"
                disabled={loading || !form.domain || !form.siteSlug}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add domain
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-10 rounded-lg"
                onClick={() => startTransition(refreshDomains)}
                disabled={loading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border p-4 text-sm leading-6">
              {vercelEnabled
                ? 'Live Vercel credentials detected. Adding a domain here will attach it to the configured Vercel project, then this list will sync against the project domains API.'
                : 'Vercel credentials are not configured. The form can still record inventory locally, but it cannot add real domains to the Vercel project yet.'}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredDomains.map((domainRecord) => (
          <Card key={domainRecord.domain} className="border-border bg-card/80 overflow-hidden border">
            <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="mt-1"></div>
                <div className="min-w-0">
                  <div className="text-foreground flex items-center gap-2 truncate text-lg">
                    {domainRecord.domain}
                    <DomainStatus status={domainRecord.verificationStatus} />
                    <Badge
                      variant={
                        domainRecord.source === 'vercel'
                          ? 'default'
                          : domainRecord.source === 'merged'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {domainRecord.source || 'local'}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span>{domainRecord.siteSlug}</span>
                    <span aria-hidden="true">•</span>
                    <span>{domainRecord.tier}</span>
                  </div>
                  <div className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
                    {domainRecord.dnsInstructions?.length ? (
                      <div>
                        <span className="text-foreground font-medium">
                          {domainRecord.dnsInstructions[0].type} {domainRecord.dnsInstructions[0].domain}
                        </span>{' '}
                        {domainRecord.dnsInstructions[0].value}
                      </div>
                    ) : domainRecord.redirectTarget ? (
                      <div>Redirects to {domainRecord.redirectTarget}</div>
                    ) : (
                      <div>No DNS action required.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 self-end lg:self-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg"
                  onClick={() =>
                    editingDomain === domainRecord.domain ? cancelEditing() : startEditing(domainRecord)
                  }
                  disabled={loading}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {editingDomain === domainRecord.domain ? 'Close' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg"
                  onClick={() => startTransition(refreshDomains)}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg"
                  disabled={domainRecord.verificationStatus === 'active' || loading}
                  onClick={() => verifyDomain(domainRecord.domain)}
                >
                  Verify
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg"
                  onClick={() => removeDomain(domainRecord.domain)}
                  disabled={loading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
            {editingDomain === domainRecord.domain ? (
              <CardContent className="border-border border-t pt-0">
                <div className="grid gap-4 pt-4 md:grid-cols-4">
                  <Select
                    value={editForm.siteSlug}
                    onValueChange={(value) => setEditForm((current) => ({ ...current, siteSlug: value }))}
                  >
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Choose site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.slug} value={site.slug}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={editForm.tier}
                    onValueChange={(value) => setEditForm((current) => ({ ...current, tier: value }))}
                  >
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landing">Landing</SelectItem>
                      <SelectItem value="redirect">Redirect</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-10 rounded-lg md:col-span-2"
                    value={editForm.redirectTarget}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, redirectTarget: event.target.value }))
                    }
                    placeholder="Redirect target (optional)"
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  <Button onClick={() => saveDomain(domainRecord.domain)} disabled={loading}>
                    Save changes
                  </Button>
                  <Button variant="outline" onClick={cancelEditing} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            ) : null}
          </Card>
        ))}

        {!filteredDomains.length ? (
          <Card className="border-border bg-card/60 border">
            <CardContent className="text-muted-foreground p-6 text-sm">
              No domains match the current search.
            </CardContent>
          </Card>
        ) : null}

        <div className="border-border bg-muted/30 rounded-xl border p-4">
          <div className="text-foreground flex items-center gap-2 text-sm font-medium">
            <Globe2 className="h-4 w-4" />
            DNS operator note
          </div>
          <Textarea
            className="bg-background mt-3 min-h-[120px]"
            readOnly
            value="Use this view to keep the inventory accurate even before all DNS records are updated. The list doubles as a rollout checklist for hero, landing, and redirect domains, but the truth source for attached domains is the Vercel project sync."
          />
        </div>
      </div>
    </div>
  )
}
