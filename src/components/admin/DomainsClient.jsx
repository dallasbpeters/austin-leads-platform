'use client'

import { startTransition } from 'react'
import { Globe2, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import{ Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
    error,
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
    <div className="p-6 space-y-6 lg:p-10">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Domain operations</p>
          <h1 className="mt-2 text-3xl text-foreground tracking-tight">Manage Vercel project domains</h1>
          <p className="max-w-3xl mt-3 leading-7 text-base text-muted-foreground">
            The UI can add domains to the Vercel project, sync the actual attached project domains, keep track
            of which site each one should serve, and surface DNS instructions when verification is still
            pending.
          </p>
        </div>
      </div>

      <div className="p-4 leading-7 text-muted-foreground text-sm bg-muted/30 border border-border ">
        <span className="font-medium text-foreground">How to connect a domain:</span> add the domain below,
        copy the DNS record Vercel returns, create that record at your registrar, then come back here and
        click <span className="font-medium text-foreground">Verify</span>. A domain is only fully connected
        when its status shows <span className="font-medium text-foreground">active</span>.
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <Card className="bg-card/70 border border-border overflow-hidden">
        <CardContent className="p-4">
          <form className="space-y-4" onSubmit={addDomain}>
            <div className="grid gap-3 grid-cols-4 grid-rows-2">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute h-4 w-4 text-muted-foreground -translate-y-1/2 left-4 pointer-events-none top-1/2" />
                  <Input
                    className="h-10 pl-11 text-base bg-background border-border "
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search any domain"
                  />
                </div>
              </div>
              
              <Input
                className="btn"
                value={form.domain}
                onChange={(event) => setForm((current) => ({ ...current, domain: event.target.value }))}
                placeholder="newdomain.com"
              />
              <Select
                
                value={form.siteSlug}
                onValueChange={(value) => setForm((current) => ({ ...current, siteSlug: value }))}
              >
                <SelectTrigger className="w-full">
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
                className="btn"
                value={form.redirectTarget}
                onChange={(event) =>
                  setForm((current) => ({ ...current, redirectTarget: event.target.value }))
                }
                placeholder="Redirect target (optional)"
              />
              <Button
              size="medium"
                type="submit"
                className=" btn"
                disabled={loading || !form.domain || !form.siteSlug}
              >
                Add domain
              </Button>
              <Button
              size="medium"
                type="button"
                variant="outline"
                className=" btn"
                onClick={() => startTransition(refreshDomains)}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>

            <div className="p-4 leading-6 text-muted-foreground text-sm bg-muted/30 border border-border ">
              {vercelEnabled
                ? 'Live Vercel credentials detected. Adding a domain here will attach it to the configured Vercel project, then this list will sync against the project domains API.'
                : 'Vercel credentials are not configured. The form can still record inventory locally, but it cannot add real domains to the Vercel project yet.'}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card className="bg-card/70 border border-border overflow-hidden">
          <CardContent className="p-4">
            
       
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Redirect Target</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDomains.map((domainRecord) => (
              <TableRow key={domainRecord.domain}>
                <TableCell>{domainRecord.domain}</TableCell>
                <TableCell>{domainRecord.tier}</TableCell>
                <TableCell>{domainRecord.redirectTarget}</TableCell>
                <TableCell>
                  <DomainStatus status={domainRecord.verificationStatus} />
                </TableCell>
                <TableCell>
                  {domainRecord.source || 'local'}
                </TableCell>
                <TableCell>
                <Button
                  variant="ghost"
                  onClick={() =>
                    editingDomain === domainRecord.domain ? cancelEditing() : startEditing(domainRecord)
                  }
                  disabled={loading}
                >
                  {editingDomain === domainRecord.domain ? 'Close' : 'Edit'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => startTransition(refreshDomains)}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="ghost"
                  disabled={domainRecord.verificationStatus === 'active' || loading}
                  onClick={() => verifyDomain(domainRecord.domain)}
                >
                  Verify
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => removeDomain(domainRecord.domain)}
                  disabled={loading}
                >
                  Delete
                </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </CardContent>
        </Card>
        {!filteredDomains.length ? (
          <Card className="bg-card/60 border border-border">
            <CardContent className="p-6 text-muted-foreground text-sm">
              No domains match the current search.
            </CardContent>
          </Card>
        ) : null}

        <div className="p-4 bg-muted/30 border border-border rounded-xl">
          <div className="flex items-center gap-2 font-medium text-foreground text-sm">
            <Globe2 className="h-4 w-4" />
            DNS operator note
          </div>
          <Textarea
            className="min-h-[120px] mt-3 bg-background"
            readOnly
            value="Use this view to keep the inventory accurate even before all DNS records are updated. The list doubles as a rollout checklist for hero, landing, and redirect domains, but the truth source for attached domains is the Vercel project sync."
          />
        </div>
      </div>
    </div>
  )
}
