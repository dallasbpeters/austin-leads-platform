'use client'

import { useState } from 'react'
import { CalendarClock, CircleDot, Mail, Phone, RefreshCw, Search, UserRound } from 'lucide-react'

import { useCrmManager } from '@/hooks/useCrmManager'
import { LEAD_PIPELINE_STAGES, LEAD_PRIORITIES, LEAD_STATUSES } from '@/lib/leads/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

function formatDate(value) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString()
}

function statusTone(value) {
  if (value === 'won') return 'bg-emerald-100 text-emerald-800'
  if (value === 'lost' || value === 'closed') return 'bg-slate-200 text-slate-700'
  if (value === 'inspection' || value === 'quoted') return 'bg-blue-100 text-blue-800'
  if (value === 'triage' || value === 'traige') return 'bg-orange-100 text-orange-800'
  if (value === 'qualified') return 'bg-amber-100 text-amber-800'
  return 'bg-emerald-100 text-emerald-800'
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
  const [draftNotes, setDraftNotes] = useState(selectedLead?.internal_notes || '')
  const [draftAssignedTo, setDraftAssignedTo] = useState(selectedLead?.assigned_to || '')
  const [draftFollowUpAt, setDraftFollowUpAt] = useState(
    selectedLead?.follow_up_at ? selectedLead.follow_up_at.slice(0, 16) : '',
  )

  function handleLeadSelect(lead) {
    setSelectedLeadId(lead.id)
    setDraftNotes(lead.internal_notes || '')
    setDraftAssignedTo(lead.assigned_to || '')
    setDraftFollowUpAt(lead.follow_up_at ? lead.follow_up_at.slice(0, 16) : '')
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
        <div className="mx-auto max-w-8xl">
          <Card className="shadow-theme-sm">
            <CardHeader>
              <CardTitle>CRM</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-7">
              Add <code>DATABASE_URL</code> or <code>NEON_DATABASE_URL</code>, then run{' '}
              <code>pnpm db:setup</code> to enable the CRM.
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-8xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Lead management</p>
            <h1 className="text-foreground mt-2 text-3xl tracking-tight">CRM</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-7">
              Triage inbound leads, assign follow-up, track inspection and quote stages, and keep notes in one
              place.
            </p>
          </div>
          <Button variant="outline" onClick={() => refresh()} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Total leads" value={overview.total} />
          <MetricCard label="Last 30 days" value={overview.last_30_days} />
          <MetricCard label="Open" value={overview.open} />
          <MetricCard label="Qualified" value={overview.qualified} />
          <MetricCard label="Inspections" value={overview.inspections} />
          <MetricCard label="Quoted / Won" value={`${overview.quoted} / ${overview.won}`} />
        </div>

        <Card className="shadow-theme-sm">
          <CardHeader>
            <CardTitle className="text-base">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
              {pipeline.map((stage) => (
                <div key={stage.stage} className="border-border bg-muted/30 rounded-xl border p-4">
                  <div className="text-muted-foreground text-sm tracking-[0.18em] uppercase">
                    {stage.stage}
                  </div>
                  <div className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
                    {stage.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-theme-sm">
          <CardHeader>
            <CardTitle className="text-base">Filter leads</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr]">
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
                    {status}
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
                    {stage}
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
                <SelectItem value="solar-roofing">Solar + roofing</SelectItem>
                <SelectItem value="solar">Solar</SelectItem>
                <SelectItem value="roofing">Roofing</SelectItem>
                <SelectItem value="hail">Hail</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="shadow-theme-sm">
            <CardHeader>
              <CardTitle className="text-base">Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leads.length ? (
                leads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => handleLeadSelect(lead)}
                    className={`grid w-full gap-3 rounded-xl border p-4 text-left transition-colors ${selectedLead?.id === lead.id ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/30'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-foreground text-base font-semibold">{lead.full_name}</div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          {lead.service_interest || lead.source_type} · {lead.source_domain}
                        </div>
                      </div>
                      <div
                        className={`rounded-full px-2.5 py-1 text-sm font-medium ${statusTone(lead.pipeline_stage)}`}
                      >
                        {lead.pipeline_stage}
                      </div>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {lead.email}
                      </span>
                      {lead.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {lead.phone}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-muted-foreground text-sm tracking-[0.16em] uppercase">
                      {new Date(lead.created_at).toLocaleString()} · {lead.page_path}
                    </div>
                  </button>
                ))
              ) : (
                <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-6 text-sm">
                  No leads matched the current filters.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-theme-sm">
            <CardHeader>
              <CardTitle className="text-base">Lead detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedLead ? (
                <>
                  <div className="space-y-2">
                    <div className="text-foreground text-xl font-semibold tracking-tight">
                      {selectedLead.full_name}
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedLead.email}
                      </span>
                      {selectedLead.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedLead.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
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
                              {status}
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
                              {stage}
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
                              {priority}
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow
                      icon={CircleDot}
                      label="Service interest"
                      value={selectedLead.service_interest || 'Not specified'}
                    />
                    <InfoRow
                      icon={UserRound}
                      label="Source"
                      value={`${selectedLead.source_domain} · ${selectedLead.page_path}`}
                    />
                    <InfoRow
                      icon={CalendarClock}
                      label="Created"
                      value={formatDate(selectedLead.created_at)}
                    />
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

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSaveDetail} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save lead details'}
                    </Button>
                    <Button variant="outline" onClick={() => saveLead({ touch: true })} disabled={isSaving}>
                      Mark contacted now
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-6 text-sm">
                  Select a lead to review notes, update stage, and schedule follow-up.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <Card className="shadow-theme-sm">
      <CardContent className="p-5">
        <div className="text-muted-foreground text-sm font-medium">{label}</div>
        <div className="text-foreground mt-2 text-3xl font-semibold tracking-tight">{value}</div>
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
    <div className="border-border bg-muted/30 rounded-xl border p-4">
      <div className="text-muted-foreground inline-flex items-center gap-2 text-sm tracking-[0.16em] uppercase">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-foreground mt-2 text-sm font-medium">{value}</div>
    </div>
  )
}
