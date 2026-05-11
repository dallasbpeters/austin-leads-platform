'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, Mail, Phone, RefreshCw, Search, ShieldCheck, UserRound, CircleDot } from 'lucide-react'

import { useCrmManager } from '@/hooks/useCrmManager'
import { LEAD_PIPELINE_STAGES, LEAD_PRIORITIES, LEAD_STATUSES } from '@/lib/leads/constants'
import { LEAD_SERVICE_OPTIONS } from '@/lib/leads/service-options'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

const serviceLabelMap = Object.fromEntries(LEAD_SERVICE_OPTIONS.map((option) => [option.value, option.label]))

function formatDate(value) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleString()
}

function formatServiceInterest(value) {
  return serviceLabelMap[value] || value || 'Not specified'
}

function formatLabel(value) {
  return String(value || 'new').replace(/[-_]/g, ' ')
}

function badgeTone(value) {
  if (value === 'won') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
  if (value === 'lost' || value === 'closed') return 'bg-slate-500/10 text-slate-700 border-slate-500/20'
  if (value === 'urgent') return 'bg-red-500/10 text-red-700 border-red-500/20'
  if (value === 'high') return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
  if (value === 'inspection' || value === 'quoted') return 'bg-sky-500/10 text-sky-700 border-sky-500/20'
  if (value === 'qualified') return 'bg-orange-500/10 text-orange-700 border-orange-500/20'
  return 'bg-muted text-muted-foreground border-border'
}

export default function CrmClient({ initialOverview, initialPipeline, initialLeads, leadDbReady }) {
  const {
    error,
    filters,
    isRefreshing,
    isSaving,
    leads,
    overview,
    pipeline,
    selectedLead,
    setSelectedLeadId,
    refresh,
    saveLead,
    updateFilter,
  } = useCrmManager({
    initialOverview,
    initialPipeline,
    initialLeads,
  })
  const [draftNotes, setDraftNotes] = useState('')
  const [draftAssignedTo, setDraftAssignedTo] = useState('')
  const [draftFollowUpAt, setDraftFollowUpAt] = useState('')

  useEffect(() => {
    setDraftNotes(selectedLead?.internal_notes || '')
    setDraftAssignedTo(selectedLead?.assigned_to || '')
    setDraftFollowUpAt(selectedLead?.follow_up_at ? selectedLead.follow_up_at.slice(0, 16) : '')
  }, [selectedLead])

  function closeSheet(open) {
    if (!open) {
      setSelectedLeadId(null)
    }
  }

  function handleSaveDetail() {
    saveLead({
      assignedTo: draftAssignedTo,
      followUpAt: draftFollowUpAt || null,
      internalNotes: draftNotes,
    })
  }

  if (!leadDbReady) {
    return (
      <div className="p-4 md:p-8">
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle>CRM</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm leading-7">
            Add <code>DATABASE_URL</code> or <code>NEON_DATABASE_URL</code>, then run{' '}
            <code>pnpm db:setup</code> to enable the CRM.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Lead management</p>
          <h1 className="text-foreground mt-2 tracking-normal">CRM</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-7">
            Review leads, filter quickly, and open the selected contact in a detail drawer.
          </p>
        </div>
        <Button variant="outline" onClick={() => refresh()} disabled={isRefreshing}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total leads"
          value={overview.total}
          detail={`${overview.last_30_days} in the last 30 days`}
        />
        <MetricCard label="Open" value={overview.open} detail={`${overview.qualified} qualified`} />
        <MetricCard
          label="Inspections"
          value={overview.inspections}
          detail={`${overview.quoted} quoted / ${overview.won} won`}
        />
        <MetricCard
          label="Pipeline"
          value={pipeline.reduce((sum, stage) => sum + Number(stage.count || 0), 0)}
          detail="Current tracked stages"
        />
      </div>

      <Card className="bg-card/80 border-border">
        <CardHeader className="border-border/70 border-b">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardTitle>Leads</CardTitle>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(320px,1fr)_170px_170px_220px]">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="Search name, email, phone, or domain"
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                />
              </div>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.pipelineStage}
                onValueChange={(value) => updateFilter('pipelineStage', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pipeline stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {LEAD_PIPELINE_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {formatLabel(stage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.serviceInterest}
                onValueChange={(value) => updateFilter('serviceInterest', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Service interest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {LEAD_SERVICE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Contact</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="pr-4">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length ? (
                leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    data-state={selectedLead?.id === lead.id ? 'selected' : undefined}
                    className="cursor-pointer"
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <TableCell className="pl-4">
                      <div className="space-y-1 whitespace-normal">
                        <div className="text-foreground font-medium">{lead.full_name}</div>
                        <div className="text-muted-foreground text-sm">{lead.email}</div>
                        <div className="text-muted-foreground text-sm">
                          {lead.phone || 'No phone provided'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {formatServiceInterest(lead.service_interest)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={badgeTone(lead.pipeline_stage)}>
                        {formatLabel(lead.pipeline_stage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={badgeTone(lead.status)}>
                        {formatLabel(lead.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={badgeTone(lead.priority)}>
                        {formatLabel(lead.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal">{formatDate(lead.created_at)}</TableCell>
                    <TableCell className="pr-4">
                      <div className="space-y-1 whitespace-normal">
                        <div>{lead.source_domain}</div>
                        <div className="text-muted-foreground text-sm">{lead.page_path}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground px-4 py-8 text-center">
                    No leads matched the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedLead)} onOpenChange={closeSheet}>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader className="border-border/70 border-b">
            <SheetTitle>{selectedLead?.full_name || 'Lead detail'}</SheetTitle>
            <SheetDescription>
              Review contact details, update pipeline state, and save internal notes.
            </SheetDescription>
          </SheetHeader>

          {selectedLead ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
              <div className="space-y-5">
                <div className="bg-muted/20 border-border/70 rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-background border-border/70 flex h-12 w-12 items-center justify-center rounded-full border">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-foreground font-medium">{selectedLead.full_name}</div>
                      <div className="text-muted-foreground space-y-1 text-sm">
                        <div className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedLead.email}
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {selectedLead.phone || 'No phone provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Status">
                    <Select
                      value={selectedLead.status}
                      onValueChange={(value) => saveLead({ status: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {formatLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Pipeline stage">
                    <Select
                      value={selectedLead.pipeline_stage}
                      onValueChange={(value) => saveLead({ pipelineStage: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_PIPELINE_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {formatLabel(stage)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Priority">
                    <Select
                      value={selectedLead.priority}
                      onValueChange={(value) => saveLead({ priority: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {formatLabel(priority)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Owner">
                    <Input
                      value={draftAssignedTo}
                      onChange={(event) => setDraftAssignedTo(event.target.value)}
                      placeholder="Assign owner"
                    />
                  </Field>
                </div>

                <div className="grid gap-3">
                  <InfoRow
                    icon={ShieldCheck}
                    label="Service interest"
                    value={formatServiceInterest(selectedLead.service_interest)}
                  />
                  <InfoRow icon={CircleDot} label="Lead type" value={formatLabel(selectedLead.source_type)} />
                  <InfoRow
                    icon={UserRound}
                    label="Source"
                    value={`${selectedLead.source_domain} · ${selectedLead.page_path}`}
                  />
                  <InfoRow icon={CalendarClock} label="Created" value={formatDate(selectedLead.created_at)} />
                  <InfoRow
                    icon={CalendarClock}
                    label="Last contacted"
                    value={formatDate(selectedLead.last_contacted_at)}
                  />
                </div>

                <Field label="Follow-up at">
                  <Input
                    type="datetime-local"
                    value={draftFollowUpAt}
                    onChange={(event) => setDraftFollowUpAt(event.target.value)}
                  />
                </Field>

                <Field label="Internal notes">
                  <Textarea
                    rows={8}
                    value={draftNotes}
                    onChange={(event) => setDraftNotes(event.target.value)}
                    placeholder="Add call notes, quote context, claim details, or next action."
                  />
                </Field>

                <div className="bg-muted/20 border-border/70 rounded-xl border p-4 text-sm leading-6">
                  <div>
                    <span className="text-foreground font-medium">Page:</span>{' '}
                    {selectedLead.page_title || 'Untitled'}
                  </div>
                  <div>
                    <span className="text-foreground font-medium">Section:</span>{' '}
                    {selectedLead.source_section || 'Not tracked'}
                  </div>
                  <div>
                    <span className="text-foreground font-medium">Notes from form:</span>{' '}
                    {selectedLead.notes || 'None provided'}
                  </div>
                </div>
              </div>

              <SheetFooter className="border-border/70 mt-6 border-t px-0 pt-4">
                <Button onClick={handleSaveDetail} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
                <Button variant="outline" onClick={() => saveLead({ touch: true })} disabled={isSaving}>
                  Mark contacted
                </Button>
              </SheetFooter>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function MetricCard({ label, value, detail }) {
  return (
    <Card className="bg-card/80 border-border">
      <CardContent className="space-y-2 p-5">
        <div className="text-muted-foreground text-sm">{label}</div>
        <div className="text-foreground font-semibold tracking-normal">{value}</div>
        <div className="text-muted-foreground text-sm">{detail}</div>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-foreground font-medium">{label}</span>
      {children}
    </label>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="bg-muted/20 border-border/70 rounded-xl border p-4">
      <div className="text-muted-foreground inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-foreground mt-2 text-sm leading-6">{value}</div>
    </div>
  )
}
