'use client'

import { useState } from 'react'

const STATUSES = ['all', 'booked', 'confirmed', 'installed', 'completed', 'cancelled']

function fmt(cents) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}

function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export default function ChristmasJobsClient({ jobs, overview, statusColors }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = jobs.filter((j) => {
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      j.full_name?.toLowerCase().includes(q) ||
      j.email?.toLowerCase().includes(q) ||
      j.address?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="border-border border-b px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-xl font-semibold">Christmas Lights — Jobs</h1>
            <p className="text-muted-foreground text-sm mt-0.5">2025 season bookings</p>
          </div>
          <a
            href="/christmas/slots"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Manage slots
          </a>
        </div>
      </div>

      {/* Overview stats */}
      <dl className="border-border grid grid-cols-2 gap-px border-b bg-border md:grid-cols-4 shrink-0">
        {[
          { label: 'Total bookings', value: overview.total },
          { label: 'Deposits collected', value: fmt(overview.deposits_collected_cents) },
          { label: 'Balances outstanding', value: overview.balances_outstanding },
          { label: 'Confirmed', value: overview.confirmed + overview.installed },
        ].map(({ label, value }) => (
          <div key={label} className="bg-background px-6 py-4">
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">{label}</dt>
            <dd className="text-foreground mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Filters */}
      <div className="border-border flex items-center gap-3 border-b px-6 py-3 shrink-0">
        <label htmlFor="job-search" className="sr-only">Search jobs</label>
        <input
          id="job-search"
          name="job-search"
          type="text"
          placeholder="Search name, email, address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground h-8 w-64 rounded-md border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex items-center gap-1" role="group" aria-label="Filter by status">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground ml-auto text-xs" aria-live="polite" aria-atomic="true">
          {filtered.length} job{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground flex h-48 items-center justify-center text-sm">
            {jobs.length === 0 ? "No bookings yet. They'll appear here when someone completes checkout." : 'No results match your filters.'}
          </p>
        ) : (
          <table className="w-full text-sm" aria-label="Christmas lights job bookings">
            <thead>
              <tr className="border-border border-b">
                {['Customer', 'Address', 'Install date', 'Package', 'Deposit', 'Balance', 'Status'].map((h) => (
                  <th key={h} scope="col" className="text-muted-foreground px-4 py-2 text-left text-xs font-medium uppercase tracking-wide first:pl-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filtered.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="pl-6 pr-4 py-3">
                    <p className="text-foreground font-medium">{job.full_name}</p>
                    <p className="text-muted-foreground text-xs">{job.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate" title={job.address}>
                    {job.address}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(job.install_date)}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {job.package_slug?.replace(/-/g, ' ') ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      job.deposit_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.deposit_status === 'paid' ? fmt(job.deposit_amount_cents) : 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      job.balance_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {job.balance_status === 'paid'
                        ? fmt(job.balance_amount_cents ?? 0)
                        : job.balance_amount_cents
                          ? `${fmt(job.balance_amount_cents)} due`
                          : 'TBD'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      (statusColors ?? {})[job.status] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
