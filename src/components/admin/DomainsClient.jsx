'use client'

import { startTransition } from 'react'
import { Globe2, Plus, RefreshCcw, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDomainsManager } from '@/hooks/useDomainsManager'

function DomainStatus({ status }) {
  const tone = status === 'active' ? 'default' : status === 'redirect-only' ? 'secondary' : status === 'not-added' ? 'outline' : 'outline'

  return <Badge variant={tone}>{status}</Badge>
}

export default function DomainsClient({ initialDomains, sites, vercelEnabled }) {
  const { domains, form, loading, query, addDomain, refreshDomains, setForm, setQuery, verifyDomain } = useDomainsManager({ initialDomains, sites, vercelEnabled })

  const filteredDomains = domains.filter((domainRecord) => [domainRecord.domain, domainRecord.siteSlug, domainRecord.redirectTarget, domainRecord.verificationStatus].filter(Boolean).some((value) => value.toLowerCase().includes(query.toLowerCase())))

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Domain operations</p>
          <h1 className="mt-2 text-3xl tracking-tight text-foreground">Manage Vercel project domains</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">The UI can add domains to the Vercel project, sync the actual attached project domains, keep track of which site each one should serve, and surface DNS instructions when verification is still pending.</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
        <span className="font-medium text-foreground">How to connect a domain:</span> add the domain below, copy the DNS record Vercel returns, create that record at your registrar, then come back here and click <span className="font-medium text-foreground">Verify</span>. A domain is only fully connected when its status shows <span className="font-medium text-foreground">active</span>.
      </div>

      <Card className="overflow-hidden border border-border bg-card/70">
        <CardContent className="p-4">
          <form className="space-y-4" onSubmit={addDomain}>
            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-10 rounded-lg border-border bg-background pl-11 text-base" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any domain" />
                </div>
              </div>
              <Input className="h-10 rounded-lg xl:w-[17rem]" value={form.domain} onChange={(event) => setForm((current) => ({ ...current, domain: event.target.value }))} placeholder="newdomain.com" />
              <Select value={form.siteSlug} onValueChange={(value) => setForm((current) => ({ ...current, siteSlug: value }))}>
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
              <Input className="h-10 rounded-lg xl:w-[17rem]" value={form.redirectTarget} onChange={(event) => setForm((current) => ({ ...current, redirectTarget: event.target.value }))} placeholder="Redirect target (optional)" />
              <Button type="submit" size="lg" className="h-10 rounded-lg" disabled={loading || !form.domain || !form.siteSlug}>
                <Plus className="mr-2 h-4 w-4" />
                Add domain
              </Button>
              <Button type="button" variant="outline" size="lg" className="h-10 rounded-lg" onClick={() => startTransition(refreshDomains)} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              {vercelEnabled ? 'Live Vercel credentials detected. Adding a domain here will attach it to the configured Vercel project, then this list will sync against the project domains API.' : 'Vercel credentials are not configured. The form can still record inventory locally, but it cannot add real domains to the Vercel project yet.'}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredDomains.map((domainRecord) => (
          <Card key={domainRecord.domain} className="overflow-hidden border border-border bg-card/80">
            <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="mt-1"></div>
                <div className="min-w-0">
                  <div className="truncate text-lg text-foreground flex items-center gap-2">
                    {domainRecord.domain}
                    <DomainStatus status={domainRecord.verificationStatus} />
                    <Badge variant={domainRecord.source === 'vercel' ? 'default' : domainRecord.source === 'merged' ? 'secondary' : 'outline'}>{domainRecord.source || 'local'}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{domainRecord.siteSlug}</span>
                    <span aria-hidden="true">•</span>
                    <span>{domainRecord.tier}</span>
                  </div>
                  <div className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {domainRecord.dnsInstructions?.length ? (
                      <div>
                        <span className="font-medium text-foreground">
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
                <Button variant="outline" size="lg" className="rounded-lg" onClick={() => startTransition(refreshDomains)} disabled={loading}>
                  Refresh
                </Button>
                <Button variant="outline" size="lg" className="rounded-lg" disabled={domainRecord.verificationStatus === 'active' || loading} onClick={() => verifyDomain(domainRecord.domain)}>
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!filteredDomains.length ? (
          <Card className="border border-border bg-card/60">
            <CardContent className="p-6 text-sm text-muted-foreground">No domains match the current search.</CardContent>
          </Card>
        ) : null}

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Globe2 className="h-4 w-4" />
            DNS operator note
          </div>
          <Textarea className="mt-3 min-h-[120px] bg-background" readOnly value="Use this view to keep the inventory accurate even before all DNS records are updated. The list doubles as a rollout checklist for hero, landing, and redirect domains, but the truth source for attached domains is the Vercel project sync." />
        </div>
      </div>
    </div>
  )
}
