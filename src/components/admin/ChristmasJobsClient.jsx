'use client'

import { useState, useTransition, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES = ['booked', 'confirmed', 'installed', 'completed', 'cancelled']

const STATUS_STYLES = {
  booked: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  installed: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

const PACKAGES = [
  { id: 'xmas-roofline', label: 'Roofline' },
  { id: 'xmas-full-front', label: 'Full Front' },
  { id: 'xmas-full-property', label: 'Full Property' },
  { id: 'unknown', label: 'Unknown' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(cents) {
  if (!cents && cents !== 0) return '—'
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}

function fmtDate(str) {
  if (!str) return '—'
  const d = str instanceof Date ? str : new Date(str)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function toDateKey(str) {
  if (!str) return ''
  const d = str instanceof Date ? str : new Date(str)
  return d.toISOString().split('T')[0]
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiUpdate(id, updates) {
  const res = await fetch(`/api/christmas/jobs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error('Update failed')
  const data = await res.json()
  return data.job
}

async function apiDelete(id) {
  const res = await fetch(`/api/christmas/jobs/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
}

// ── StatusPipeline ────────────────────────────────────────────────────────────

function StatusPipeline({ current, onChange, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {STATUSES.map((s, i) => {
        const isActive = current === s
        const isPast = STATUSES.indexOf(current) > i && s !== 'cancelled'
        return (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s)}
            className={`relative rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${isActive ? STATUS_STYLES[s] + ' ring-2 ring-current ring-offset-1' : ''} ${!isActive && isPast ? 'bg-gray-100 text-gray-400' : ''} ${!isActive && !isPast ? 'bg-muted text-muted-foreground hover:bg-muted/80' : ''} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}

// ── JobDetailPanel ────────────────────────────────────────────────────────────

function JobDetailPanel({ job, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    full_name: job.full_name ?? '',
    email: job.email ?? '',
    phone: job.phone ?? '',
    address: job.address ?? '',
    install_date: toDateKey(job.install_date),
    package_slug: job.package_slug ?? 'unknown',
    status: job.status ?? 'booked',
    crew: job.crew ?? '',
    notes: job.notes ?? '',
    deposit_status: job.deposit_status ?? 'pending',
    balance_amount_cents: job.balance_amount_cents ?? '',
    balance_status: job.balance_status ?? 'unpaid',
  })
  const [dirty, setDirty] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }))
    setDirty(true)
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        const saved = await apiUpdate(job.id, {
          fullName: form.full_name,
          email: form.email,
          phone: form.phone || null,
          address: form.address,
          installDate: form.install_date || null,
          packageSlug: form.package_slug,
          status: form.status,
          crew: form.crew || null,
          notes: form.notes || null,
          depositStatus: form.deposit_status,
          balanceAmountCents: form.balance_amount_cents ? Number(form.balance_amount_cents) : null,
          balanceStatus: form.balance_status,
        })
        setDirty(false)
        onSave(saved)
      } catch {
        setError('Save failed. Try again.')
      }
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete job for ${job.full_name}? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await apiDelete(job.id)
        onDelete(job.id)
      } catch {
        setError('Delete failed. Try again.')
      }
    })
  }

  const inputCls =
    'border-border bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
  const labelCls = 'text-muted-foreground text-xs uppercase tracking-wide block mb-1'

  return (
    <aside
      className="border-border bg-background flex h-full w-full flex-col border-l"
      aria-label="Job detail"
    >
      {/* Panel header */}
      <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-4">
        <div>
          <p className="text-foreground font-semibold">{job.full_name}</p>
          <p className="text-muted-foreground text-xs">{fmtDate(job.install_date)}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
        {/* Status pipeline */}
        <div>
          <p className={labelCls}>Status</p>
          <StatusPipeline current={form.status} onChange={(s) => set('status', s)} disabled={isPending} />
        </div>

        {/* Client info */}
        <fieldset className="space-y-3">
          <legend className={labelCls}>Client</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Name</label>
              <input
                className={inputCls}
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="(512) 555-0100"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              className={inputCls}
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>
        </fieldset>

        {/* Job info */}
        <fieldset className="space-y-3">
          <legend className={labelCls}>Job</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Install date</label>
              <input
                className={inputCls}
                type="date"
                value={form.install_date}
                onChange={(e) => set('install_date', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Package</label>
              <select
                className={inputCls}
                value={form.package_slug}
                onChange={(e) => set('package_slug', e.target.value)}
              >
                {PACKAGES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Crew assignment</label>
            <input
              className={inputCls}
              value={form.crew}
              onChange={(e) => set('crew', e.target.value)}
              placeholder="e.g. Team A — Mike, Jake, Sara"
            />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              className={inputCls + ' min-h-[80px] resize-y'}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Gate code, access notes, special requests…"
            />
          </div>
        </fieldset>

        {/* Payment */}
        <fieldset className="space-y-3">
          <legend className={labelCls}>Payment</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Deposit</label>
              <select
                className={inputCls}
                value={form.deposit_status}
                onChange={(e) => set('deposit_status', e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid — {fmt(job.deposit_amount_cents)}</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Balance status</label>
              <select
                className={inputCls}
                value={form.balance_status}
                onChange={(e) => set('balance_status', e.target.value)}
              >
                <option value="unpaid">Unpaid</option>
                <option value="invoiced">Invoiced</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Balance amount</label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                $
              </span>
              <input
                className={inputCls + ' pl-6'}
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.balance_amount_cents ? form.balance_amount_cents / 100 : ''}
                onChange={(e) =>
                  set('balance_amount_cents', e.target.value ? Math.round(Number(e.target.value) * 100) : '')
                }
              />
            </div>
          </div>
        </fieldset>

        {/* Stripe info (read-only) */}
        {job.stripe_session_id && (
          <div className="border-border space-y-1 rounded-lg border p-3">
            <p className={labelCls}>Stripe</p>
            <p className="text-muted-foreground truncate font-mono text-xs">{job.stripe_session_id}</p>
            <a
              href={`https://dashboard.stripe.com/test/payments/${job.stripe_payment_intent_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs hover:underline"
            >
              View in Stripe ↗
            </a>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Panel footer */}
      <div className="border-border flex shrink-0 items-center justify-between border-t px-5 py-3">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-muted-foreground text-xs transition-colors hover:text-red-600 disabled:opacity-40"
        >
          Delete job
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-1.5 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !dirty}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </aside>
  )
}

// ── CalendarView ──────────────────────────────────────────────────────────────

function CalendarView({ jobs, onSelectJob }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const jobsByDate = useMemo(() => {
    const map = {}
    for (const job of jobs) {
      const key = toDateKey(job.install_date)
      if (!map[key]) map[key] = []
      map[key].push(job)
    }
    return map
  }, [jobs])

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const todayKey = toDateKey(today.toISOString())

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Calendar nav */}
      <div className="flex shrink-0 items-center justify-between px-6 py-3">
        <button
          onClick={prevMonth}
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-foreground text-sm font-semibold">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="border-border grid shrink-0 grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-muted-foreground py-2 text-center text-xs font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid auto-rows-[minmax(80px,1fr)] grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="border-border bg-muted/20 border-r border-b" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayJobs = jobsByDate[dateKey] ?? []
            const isToday = dateKey === todayKey
            return (
              <div
                key={day}
                className={`border-border border-r border-b p-1.5 ${isToday ? 'bg-primary/5' : ''}`}
              >
                <p
                  className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  {day}
                </p>
                <div className="space-y-0.5">
                  {dayJobs.slice(0, 3).map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className={`w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] leading-tight font-medium transition-opacity hover:opacity-80 ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {job.full_name}
                    </button>
                  ))}
                  {dayJobs.length > 3 && (
                    <p className="text-muted-foreground px-1 text-[10px]">+{dayJobs.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChristmasJobsClient({ jobs: initialJobs, overview: initialOverview }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [view, setView] = useState('table') // 'table' | 'calendar'
  const [selectedJob, setSelectedJob] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('install_date')
  const [sortDir, setSortDir] = useState('asc')

  const overview = useMemo(
    () => ({
      total: jobs.filter((j) => j.status !== 'cancelled').length,
      depositsCollected: jobs.reduce(
        (sum, j) => (j.deposit_status === 'paid' ? sum + (j.deposit_amount_cents ?? 0) : sum),
        0,
      ),
      balanceOutstanding: jobs.filter(
        (j) => j.balance_status !== 'paid' && j.status !== 'cancelled' && j.balance_amount_cents,
      ).length,
      confirmed: jobs.filter((j) => j.status === 'confirmed' || j.status === 'installed').length,
    }),
    [jobs],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return jobs
      .filter((j) => statusFilter === 'all' || j.status === statusFilter)
      .filter(
        (j) =>
          !q ||
          j.full_name?.toLowerCase().includes(q) ||
          j.email?.toLowerCase().includes(q) ||
          j.address?.toLowerCase().includes(q) ||
          j.crew?.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        let av = a[sortKey] ?? '',
          bv = b[sortKey] ?? ''
        if (sortKey === 'install_date') {
          av = toDateKey(av)
          bv = toDateKey(bv)
        }
        return sortDir === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
      })
  }, [jobs, statusFilter, search, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleSave = (saved) => {
    setJobs((prev) => prev.map((j) => (j.id === saved.id ? { ...j, ...saved } : j)))
    setSelectedJob((s) => (s?.id === saved.id ? { ...s, ...saved } : s))
  }

  const handleDelete = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
    setSelectedJob(null)
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="text-muted-foreground/30 ml-1">↕</span>
    return <span className="text-primary ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const thCls =
    'text-muted-foreground px-4 py-2.5 text-left text-xs font-medium tracking-wide uppercase first:pl-6 select-none'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-border shrink-0 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-xl font-semibold">Christmas Lights — Jobs</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">2026 season · {jobs.length} total bookings</p>
          </div>
          <a
            href="/christmas/slots"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Manage slots
          </a>
        </div>
      </div>

      {/* Stats */}
      <dl className="border-border bg-border grid shrink-0 grid-cols-2 gap-px border-b md:grid-cols-4">
        {[
          { label: 'Active jobs', value: overview.total },
          { label: 'Deposits collected', value: fmt(overview.depositsCollected) },
          { label: 'Balances outstanding', value: overview.balanceOutstanding },
          { label: 'Confirmed / installed', value: overview.confirmed },
        ].map(({ label, value }) => (
          <div key={label} className="bg-background px-6 py-4">
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">{label}</dt>
            <dd className="text-foreground mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Toolbar */}
      <div className="border-border flex shrink-0 flex-wrap items-center gap-3 border-b px-6 py-3">
        {/* View toggle */}
        <div className="border-border flex shrink-0 overflow-hidden rounded-lg border">
          {['table', 'calendar'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              {v}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search name, email, address, crew…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary h-8 w-64 rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
        />

        <div className="flex items-center gap-1" role="group" aria-label="Filter by status">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <p className="text-muted-foreground ml-auto text-xs" aria-live="polite">
          {filtered.length} job{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content area — table/calendar + optional detail panel */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Main view */}
        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-all ${selectedJob ? 'hidden lg:flex' : 'flex'}`}
        >
          {view === 'table' ? (
            <div className="flex-1 overflow-auto">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground flex h-48 items-center justify-center text-sm">
                  {jobs.length === 0
                    ? "No bookings yet — they'll appear when someone completes checkout."
                    : 'No results match your filters.'}
                </p>
              ) : (
                <table className="w-full text-sm" aria-label="Job bookings">
                  <thead className="bg-background sticky top-0 z-10">
                    <tr className="border-border border-b">
                      <th className={thCls + ' cursor-pointer'} onClick={() => toggleSort('full_name')}>
                        Customer <SortIcon col="full_name" />
                      </th>
                      <th className={thCls}>Address</th>
                      <th className={thCls + ' cursor-pointer'} onClick={() => toggleSort('install_date')}>
                        Install date <SortIcon col="install_date" />
                      </th>
                      <th className={thCls}>Package</th>
                      <th className={thCls}>Crew</th>
                      <th className={thCls}>Deposit</th>
                      <th className={thCls}>Balance</th>
                      <th className={thCls + ' cursor-pointer'} onClick={() => toggleSort('status')}>
                        Status <SortIcon col="status" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {filtered.map((job) => (
                      <tr
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`hover:bg-muted/30 cursor-pointer transition-colors ${selectedJob?.id === job.id ? 'bg-muted/40' : ''}`}
                      >
                        <td className="py-3 pr-4 pl-6">
                          <p className="text-foreground font-medium">{job.full_name}</p>
                          <p className="text-muted-foreground text-xs">{job.email}</p>
                          {job.phone && <p className="text-muted-foreground text-xs">{job.phone}</p>}
                        </td>
                        <td
                          className="text-muted-foreground max-w-[160px] truncate px-4 py-3 text-xs"
                          title={job.address}
                        >
                          {job.address || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">{fmtDate(job.install_date)}</td>
                        <td className="text-muted-foreground px-4 py-3 text-xs capitalize">
                          {job.package_slug?.replace(/^xmas-/, '').replace(/-/g, ' ') ?? '—'}
                        </td>
                        <td
                          className="text-muted-foreground max-w-[120px] truncate px-4 py-3 text-xs"
                          title={job.crew}
                        >
                          {job.crew || <span className="italic opacity-50">unassigned</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${job.deposit_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {job.deposit_status === 'paid' ? fmt(job.deposit_amount_cents) : 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${job.balance_status === 'paid' ? 'bg-green-100 text-green-800' : job.balance_status === 'invoiced' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}
                          >
                            {job.balance_status === 'paid'
                              ? fmt(job.balance_amount_cents)
                              : job.balance_amount_cents
                                ? `${fmt(job.balance_amount_cents)} due`
                                : 'TBD'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <CalendarView jobs={filtered} onSelectJob={setSelectedJob} />
          )}
        </div>

        {/* Detail panel */}
        {selectedJob && (
          <div className="flex min-h-0 w-full flex-col overflow-hidden lg:w-[400px] lg:flex-none">
            <JobDetailPanel
              key={selectedJob.id}
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  )
}
