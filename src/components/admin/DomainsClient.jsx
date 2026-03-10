"use client";

import { startTransition } from "react";
import { Globe2, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDomainsManager } from "@/hooks/useDomainsManager";

function DomainStatus({ status }) {
  const tone =
    status === "active" ? "default" : status === "redirect-only" ? "secondary" : "outline";

  return <Badge variant={tone}>{status}</Badge>;
}

export default function DomainsClient({ initialDomains, sites, vercelEnabled }) {
  const { domains, form, loading, addDomain, refreshDomains, setForm, verifyDomain } =
    useDomainsManager({ initialDomains, sites });

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Domain operations</p>
          <h1 className="mt-2 text-3xl tracking-tight text-foreground">
            Connect and verify domains on Vercel
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            The UI can add domains to the Vercel project, keep track of which site each domain should
            serve, and surface DNS instructions when verification is still pending.
          </p>
        </div>
        <Button variant="outline" onClick={() => startTransition(refreshDomains)} disabled={loading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh domains
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add domain</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={addDomain}>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                {vercelEnabled
                  ? "Live Vercel credentials detected. New domains will be added against the configured project."
                  : "Vercel credentials are not configured, so this form currently records the domain locally and shows placeholder DNS instructions."}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Domain</label>
                <Input
                  value={form.domain}
                  onChange={(event) => setForm((current) => ({ ...current, domain: event.target.value }))}
                  placeholder="newdomain.com"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Site target</label>
                <Select value={form.siteSlug} onValueChange={(value) => setForm((current) => ({ ...current, siteSlug: value }))}>
                  <SelectTrigger>
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
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Redirect target (optional)</label>
                <Input
                  value={form.redirectTarget}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, redirectTarget: event.target.value }))
                  }
                  placeholder="austinsolarpros.com"
                />
              </div>
              <Button type="submit" disabled={loading || !form.domain || !form.siteSlug}>
                Add domain
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>DNS instructions</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domainRecord) => (
                  <TableRow key={domainRecord.domain}>
                    <TableCell>
                      <div className="font-medium text-foreground">{domainRecord.domain}</div>
                      <div className="text-xs text-muted-foreground">{domainRecord.tier}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{domainRecord.siteSlug}</TableCell>
                    <TableCell>
                      <DomainStatus status={domainRecord.verificationStatus} />
                    </TableCell>
                    <TableCell>
                      {domainRecord.dnsInstructions?.length ? (
                        <div className="space-y-2">
                          {domainRecord.dnsInstructions.slice(0, 1).map((instruction) => (
                            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-6" key={instruction.domain}>
                              <div className="font-medium text-foreground">
                                {instruction.type} {instruction.domain}
                              </div>
                              <div className="text-muted-foreground">{instruction.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No action required.</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={domainRecord.verificationStatus === "active" || loading}
                        onClick={() => verifyDomain(domainRecord.domain)}
                      >
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Globe2 className="h-4 w-4" />
                DNS operator note
              </div>
              <Textarea
                className="mt-3 min-h-[120px] bg-background"
                readOnly
                value="Use this view to keep the inventory accurate even before all DNS records are updated. The record table doubles as a rollout checklist for hero, landing, and redirect domains."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
