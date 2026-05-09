'use client'

import { Fragment, startTransition } from 'react'
import { ChevronDown, ChevronRight, EllipsisVertical, ExternalLink, Globe2, RefreshCw, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDomainsManager } from '@/hooks/useDomainsManager'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const CATEGORY_OPTIONS = [
  { value: 'solar', label: 'Solar' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'remodeling', label: 'Remodeling' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'pest-control', label: 'Pest Control' },
  { value: 'general', label: 'General Home Services' },
]

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function DomainStatusBadge({ status }) {
  const variant =
    status === 'active'
      ? 'default'
      : status === 'redirect-only'
        ? 'secondary'
        : 'outline'

  return <Badge variant={variant}>{status ?? 'unknown'}</Badge>
}

function DnsInstructions({ instructions, status }) {
  if (!instructions?.length) {
    if (status === 'active') {
      return (
        <p className="text-muted-foreground text-sm">
          Domain is verified and active — no pending DNS records needed.
        </p>
      )
    }
    return (
      <p className="text-muted-foreground text-sm">
        No DNS records returned yet. Add the domain to Vercel to get your verification record.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {instructions.map((record, i) => (
        <div key={i} className="rounded-md bg-muted/40 border border-border px-4 py-3 text-sm font-mono space-y-1">
          <div className="flex gap-3 flex-wrap">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-semibold">{record.type}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className="text-muted-foreground">Name:</span>
            <span className="break-all">{record.domain}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className="text-muted-foreground">Value:</span>
            <span className="break-all">{record.value}</span>
          </div>
          {record.reason && (
            <p className="text-muted-foreground text-xs pt-1 font-sans">{record.reason}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default function DomainsClient({ initialDomains, vercelEnabled }) {
  const {
    domains,
    editForm,
    editingDomain,
    error,
    expandedDns,
    lastCreatedSite,
    loading,
    query,
    redirectForm,
    siteForm,
    addLandingPage,
    addRedirectDomain,
    cancelEditing,
    refreshDomains,
    removeDomain,
    saveDomain,
    setEditForm,
    setLastCreatedSite,
    setQuery,
    setRedirectForm,
    setSiteForm,
    startEditing,
    toggleDns,
    verifyDomain,
  } = useDomainsManager({ initialDomains, vercelEnabled })

  const filteredDomains = domains.filter((record) =>
    [record.domain, record.siteSlug, record.redirectTarget, record.verificationStatus]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <div className="p-6 space-y-8 lg:p-10">
      {/* Page header */}
      <div>
        <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Domain operations</p>
        <h1 className="mt-2 text-3xl text-foreground tracking-tight">Domains</h1>
        <p className="max-w-3xl mt-3 leading-7 text-base text-muted-foreground">
          Add domains to your Vercel project, create landing pages backed by Sanity, or configure
          redirect-only domains. DNS records are surfaced per row after Vercel processes the domain.
        </p>
      </div>

      {/* Vercel status banner */}
      <div
        className={`px-4 py-3 text-sm border rounded-md ${
          vercelEnabled
            ? 'bg-muted/30 border-border text-muted-foreground'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        }`}
      >
        {vercelEnabled
          ? 'Live Vercel credentials detected — domain changes are applied directly to the Vercel project.'
          : 'Vercel credentials are not configured. Changes are stored locally only and will not affect the Vercel project.'}
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm font-medium">
          {error}
        </p>
      ) : null}

      {lastCreatedSite ? (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 flex items-start justify-between gap-4">
          <div className="text-sm space-y-0.5">
            <p className="font-semibold text-green-700 dark:text-green-400">
              Landing page created — {lastCreatedSite.site?.name ?? lastCreatedSite.domain?.domain}
            </p>
            <p className="text-muted-foreground">
              Sanity site document{' '}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {lastCreatedSite.site?._id}
              </code>{' '}
              and homepage were created.
              {lastCreatedSite.vercel?.verified === false &&
                lastCreatedSite.vercel?.verificationStatus !== 'active' && (
                  <span> Domain verification pending — check DNS instructions below.</span>
                )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLastCreatedSite(null)}
            className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* Add domain tabs */}
      <Card className="bg-card/70 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Add a domain</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="landing">
            <TabsList className="mb-4">
              <TabsTrigger value="landing">Create landing page</TabsTrigger>
              <TabsTrigger value="redirect">Add as redirect</TabsTrigger>
            </TabsList>

            {/* ── Landing page tab ── */}
            <TabsContent value="landing">
              <form onSubmit={addLandingPage} className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Creates a <strong className="text-foreground">Sanity site</strong> and a
                  scaffold homepage, then attaches the domain to the Vercel project. The page is
                  immediately editable in the Sanity Studio.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="lp-domain">Domain</Label>
                    <Input
                      id="lp-domain"
                      placeholder="austinhvacpros.com"
                      value={siteForm.domain}
                      onChange={(e) => setSiteForm((f) => ({ ...f, domain: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lp-name">Site name</Label>
                    <Input
                      id="lp-name"
                      placeholder="Austin HVAC Pros"
                      value={siteForm.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setSiteForm((f) => ({
                          ...f,
                          name,
                          slug: f.slug || slugify(name),
                        }))
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lp-slug">Site slug</Label>
                    <Input
                      id="lp-slug"
                      placeholder="austin-hvac-pros"
                      value={siteForm.slug}
                      onChange={(e) => setSiteForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Used as the internal content key — lowercase with hyphens.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lp-category">Category</Label>
                    <Select
                      value={siteForm.category}
                      onValueChange={(value) => setSiteForm((f) => ({ ...f, category: value }))}
                    >
                      <SelectTrigger id="lp-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={loading || !siteForm.domain || !siteForm.name || !siteForm.slug}
                  >
                    Create landing page
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Creates the Sanity site document, homepage, and attaches the domain to Vercel.
                  </span>
                </div>
              </form>
            </TabsContent>

            {/* ── Redirect tab ── */}
            <TabsContent value="redirect">
              <form onSubmit={addRedirectDomain} className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Attaches the domain to the Vercel project and configures it to permanently
                  redirect (308) to the target URL. No Sanity content is created.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="rd-domain">Domain</Label>
                    <Input
                      id="rd-domain"
                      placeholder="old-domain.com"
                      value={redirectForm.domain}
                      onChange={(e) => setRedirectForm((f) => ({ ...f, domain: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rd-target">Redirect target URL</Label>
                    <Input
                      id="rd-target"
                      placeholder="https://austinsolarandroofing.com"
                      value={redirectForm.redirectTarget}
                      onChange={(e) =>
                        setRedirectForm((f) => ({ ...f, redirectTarget: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={loading || !redirectForm.domain}
                  >
                    Add redirect domain
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search + refresh bar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute h-4 w-4 text-muted-foreground top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
          <Input
            className="pl-10"
            placeholder="Search domains…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh domains"
          onClick={() => startTransition(refreshDomains)}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Domains table */}
      <div className="space-y-3">
        <Card className="bg-card/70 border-border overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Domain</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Redirect Target</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDomains.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                      {query ? 'No domains match the search.' : 'No domains found. Add one above.'}
                    </TableCell>
                  </TableRow>
                )}

                {filteredDomains.map((record) => (
                  <Fragment key={record.domain}>
                    <TableRow className="group">
                      <TableCell className="pl-4 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Globe2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {record.domain}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {record.siteSlug || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {record.tier || '—'}
                      </TableCell>
                      <TableCell>
                        <DomainStatusBadge status={record.verificationStatus} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                        {record.redirectTarget ? (
                          <a
                            href={
                              record.redirectTarget.startsWith('http')
                                ? record.redirectTarget
                                : `https://${record.redirectTarget}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                          >
                            {record.redirectTarget}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* DNS / expand */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDns(record.domain)}
                            aria-label="Show DNS instructions"
                          >
                            {expandedDns === record.domain ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                            DNS
                          </Button>
                          <DropdownMenu asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <EllipsisVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40" align="start">
                            <DropdownMenuItem
                            onClick={() =>
                              editingDomain === record.domain
                                ? cancelEditing()
                                : startEditing(record)
                            }
                            disabled={loading}>
                            {editingDomain === record.domain ? 'Cancel' : 'Edit'}
                          </DropdownMenuItem>
                          {/* Verify */}
                          <DropdownMenuItem
                          disabled={record.verificationStatus === 'active' || loading}
                          onClick={() => verifyDomain(record.domain)}
                        >
                          Verify
                          </DropdownMenuItem>
                          {/* Delete */}
                          <DropdownMenuItem
                          disabled={loading}
                          onClick={() => removeDomain(record.domain)}
                        >
                          Remove
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                          </DropdownMenu>
                          
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Inline edit row */}
                    {editingDomain === record.domain && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={6} className="px-4 py-4">
                          <p className="text-sm font-medium text-foreground mb-4">
                            Edit <span className="font-mono">{record.domain}</span>
                          </p>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Site slug</Label>
                              <Input
                                placeholder="austin-solar-pros"
                                value={editForm.siteSlug}
                                onChange={(e) =>
                                  setEditForm((f) => ({
                                    ...f,
                                    siteSlug: e.target.value,
                                    createSite: false,
                                  }))
                                }
                                autoFocus
                              />
                              <p className="text-xs text-muted-foreground">
                                Which Sanity site handles this domain.
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs">Tier</Label>
                              <Select
                                value={editForm.tier}
                                onValueChange={(value) =>
                                  setEditForm((f) => ({ ...f, tier: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hero">Hero</SelectItem>
                                  <SelectItem value="landing">Landing</SelectItem>
                                  <SelectItem value="redirect">Redirect</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs">Redirect target</Label>
                              <Input
                                placeholder="https://target.com (leave empty to clear)"
                                value={editForm.redirectTarget}
                                onChange={(e) =>
                                  setEditForm((f) => ({ ...f, redirectTarget: e.target.value }))
                                }
                              />
                              <p className="text-xs text-muted-foreground">
                                308 redirect via Vercel. Clear to remove.
                              </p>
                            </div>
                          </div>

                          {/* Create Sanity site toggle */}
                          <div className="mt-4 pt-3 border-t border-border space-y-3">
                            <button
                              type="button"
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() =>
                                setEditForm((f) => ({ ...f, createSite: !f.createSite }))
                              }
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  editForm.createSite
                                    ? 'bg-primary border-primary'
                                    : 'border-border bg-background'
                                }`}
                              >
                                {editForm.createSite && (
                                  <svg
                                    viewBox="0 0 10 8"
                                    className="w-2.5 h-2 text-primary-foreground fill-current"
                                  >
                                    <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              Also create a new Sanity site for this slug
                            </button>

                            {editForm.createSite && (
                              <div className="grid gap-4 sm:grid-cols-2 pl-6">
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Site name</Label>
                                  <Input
                                    placeholder="Austin HVAC Pros"
                                    value={editForm.siteName}
                                    onChange={(e) =>
                                      setEditForm((f) => ({ ...f, siteName: e.target.value }))
                                    }
                                    autoFocus
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs">Category</Label>
                                  <Select
                                    value={editForm.siteCategory}
                                    onValueChange={(value) =>
                                      setEditForm((f) => ({ ...f, siteCategory: value }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CATEGORY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <p className="sm:col-span-2 text-xs text-muted-foreground">
                                  Creates a Sanity <code>site</code> document and a scaffold homepage,
                                  then saves this domain record. The site slug above is used as the
                                  document ID.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-4">
                            <Button
                              size="sm"
                              onClick={() => saveDomain(record.domain)}
                              disabled={
                                loading ||
                                (editForm.createSite && (!editForm.siteName || !editForm.siteSlug))
                              }
                            >
                              {editForm.createSite ? 'Create site & save' : 'Save changes'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* DNS instructions row */}
                    {expandedDns === record.domain && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={6} className="px-4 py-4">
                          <p className="text-sm font-medium text-foreground mb-3">
                            DNS verification record for <span className="font-mono">{record.domain}</span>
                          </p>
                          <DnsInstructions instructions={record.dnsInstructions} status={record.verificationStatus} />
                          {record.verificationStatus !== 'active' && (
                            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                              <p className="text-xs text-muted-foreground flex-1">
                                After creating the DNS record at your registrar, click Verify to
                                check propagation.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => verifyDomain(record.domain)}
                                disabled={loading || record.verificationStatus === 'active'}
                              >
                                Verify now
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* DNS workflow note */}
        <div className="flex items-start gap-2 p-4 bg-muted/30 border border-border rounded-md text-sm text-muted-foreground">
          <Globe2 className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            <strong className="text-foreground">Workflow:</strong> Add the domain → copy the DNS
            record from the row expander → create it at your registrar → click{' '}
            <strong className="text-foreground">Verify</strong>. Status moves to{' '}
            <strong className="text-foreground">active</strong> once Vercel confirms propagation.
            Redirect-only domains show <strong className="text-foreground">redirect-only</strong>{' '}
            status and do not require DNS verification.
          </p>
        </div>
      </div>
    </div>
  )
}
