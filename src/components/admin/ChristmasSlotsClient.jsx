'use client'

import { useState, useTransition } from 'react'
import { addDays } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// ── Date helpers ──────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return undefined
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateStr(date) {
  if (!date) return ''
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function fmtDisplay(str) {
  if (!str) return '—'
  const d = str.split('T')[0] ?? str
  return new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

// ── Calendar card with quick-select — used inside Popover ─────────────────────

function CalendarPicker({ selected, onSelect }) {
  const [month, setMonth] = useState(
    selected ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )

  const handleSelect = (date) => {
    if (date) setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    onSelect?.(date)
  }

  const handlePreset = (daysFromNow) => {
    const d = addDays(new Date(), daysFromNow)
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    onSelect?.(d)
  }

  return (
    <Card size="sm" className="w-fit max-w-[300px] shadow-none border-0">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          fixedWeeks
          className="p-3 [--cell-size:--spacing(9.5)]"
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 p-3">
        {[
          { label: 'Today',     value: 0 },
          { label: 'Tomorrow',  value: 1 },
          { label: 'In 3 days', value: 3 },
          { label: 'In a week', value: 7 },
          { label: 'In 2 weeks',value: 14 },
        ].map((preset) => (
          <Button
            key={preset.value}
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handlePreset(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  )
}

// ── Popover trigger button ────────────────────────────────────────────────────

function DatePickerButton({ value, placeholder = 'Select date' }) {
  return (
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-start gap-2 text-left font-normal">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value ? fmtDisplay(toDateStr(value)) : placeholder}
        </span>
      </Button>
    </PopoverTrigger>
  )
}

// ── API ───────────────────────────────────────────────────────────────────────

async function saveSlot(installDate, capacity, isActive, notes, originalDate = null) {
  const res = await fetch('/api/christmas/slots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ installDate, capacity, isActive, notes, originalDate }),
  })
  if (!res.ok) throw new Error('Failed to save')
  return res.json()
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChristmasSlotsClient({ slots: initialSlots, defaultDates }) {
  const [slots, setSlots] = useState(() => {
    const slotMap = Object.fromEntries(
      initialSlots.map((s) => [s.install_date?.split('T')[0] ?? s.install_date, s])
    )
    return defaultDates.map((date) => slotMap[date] ?? {
      install_date: date,
      capacity: 6,
      booked_count: 0,
      is_active: true,
      notes: null,
    })
  })

  const [editing, setEditing] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDate, setNewDate] = useState({ installDate: undefined, capacity: 6, isActive: true, notes: '' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)

  const startEdit = (slot) => {
    const dateKey = slot.install_date?.split('T')[0] ?? slot.install_date
    setEditing(slot.install_date)
    setEditValues({ installDate: parseDate(dateKey), capacity: slot.capacity, isActive: slot.is_active, notes: slot.notes ?? '' })
    setShowAddForm(false)
  }

  const cancelEdit = () => { setEditing(null); setEditValues({}) }

  const handleSave = (originalInstallDate) => {
    const originalKey = originalInstallDate?.split('T')[0] ?? originalInstallDate
    const newKey = toDateStr(editValues.installDate)
    if (!newKey) { setError('Please select a date.'); return }
    setError(null)
    startTransition(async () => {
      try {
        const result = await saveSlot(newKey, Number(editValues.capacity), editValues.isActive, editValues.notes || null, originalKey)
        const saved = result.slot ?? result
        setSlots((prev) => {
          if (originalKey !== newKey) {
            return prev
              .filter((s) => (s.install_date?.split('T')[0] ?? s.install_date) !== originalKey)
              .map((s) => (s.install_date?.split('T')[0] ?? s.install_date) === newKey ? { ...s, ...saved } : s)
              .concat(prev.some((s) => (s.install_date?.split('T')[0] ?? s.install_date) === newKey) ? [] : [{ ...saved, booked_count: 0 }])
              .sort((a, b) => a.install_date.localeCompare(b.install_date))
          }
          return prev.map((s) => (s.install_date?.split('T')[0] ?? s.install_date) === newKey ? { ...s, ...saved } : s)
        })
        setEditing(null)
      } catch {
        setError('Save failed. Try again.')
      }
    })
  }

  const handleAdd = () => {
    const dateStr = toDateStr(newDate.installDate)
    if (!dateStr) { setError('Please select a date.'); return }
    setError(null)
    startTransition(async () => {
      try {
        const result = await saveSlot(dateStr, Number(newDate.capacity), newDate.isActive, newDate.notes || null)
        const saved = result.slot ?? result
        const key = saved.install_date?.split('T')[0] ?? saved.install_date
        setSlots((prev) => {
          const exists = prev.some((s) => (s.install_date?.split('T')[0] ?? s.install_date) === key)
          if (exists) return prev.map((s) => ((s.install_date?.split('T')[0] ?? s.install_date) === key ? { ...s, ...saved } : s))
          return [...prev, { ...saved, booked_count: 0 }].sort((a, b) => a.install_date.localeCompare(b.install_date))
        })
        setNewDate({ installDate: undefined, capacity: 6, isActive: true, notes: '' })
        setShowAddForm(false)
      } catch {
        setError('Save failed. Try again.')
      }
    })
  }

  const inputCls = 'border-border bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary'

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="border-border border-b px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-xl font-semibold">Install slots — 2026 season</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage capacity and availability for each install window</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/christmas" className="text-muted-foreground hover:text-foreground text-sm transition-colors">← Jobs</a>
            <Button
              onClick={() => { setShowAddForm(true); setEditing(null) }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              aria-expanded={showAddForm}
            >
              + Add date
            </Button>
          </div>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-3 max-w-2xl">

          {/* Add new date form */}
          {showAddForm && (
            <section aria-label="Add new install date" className="border-primary border-2 rounded-xl bg-background p-5 space-y-4">
              <h2 className="text-foreground font-semibold text-sm">New install date</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Date</label>
                  <Popover>
                    <DatePickerButton value={newDate.installDate} placeholder="Pick a date" />
                    <PopoverContent align="start" className="w-auto p-0">
                      <CalendarPicker
                        selected={newDate.installDate}
                        onSelect={(date) => setNewDate((v) => ({ ...v, installDate: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label htmlFor="new-capacity" className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Capacity</label>
                  <input
                    id="new-capacity"
                    name="new-capacity"
                    type="number"
                    min="0"
                    max="50"
                    value={newDate.capacity}
                    onChange={(e) => setNewDate((v) => ({ ...v, capacity: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-notes" className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Notes (optional)</label>
                <input
                  id="new-notes"
                  name="new-notes"
                  type="text"
                  placeholder="e.g. Priority week, limited crew…"
                  value={newDate.notes}
                  onChange={(e) => setNewDate((v) => ({ ...v, notes: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="new-is-active"
                  checked={newDate.isActive}
                  onChange={(e) => setNewDate((v) => ({ ...v, isActive: e.target.checked }))}
                  className="accent-primary"
                />
                Active (visible to customers)
              </label>

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Saving…' : 'Add slot'}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setError(null) }}
                  className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-1.5 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </section>
          )}

          {/* Slot rows */}
          {slots.map((slot) => {
            const dateKey = slot.install_date?.split('T')[0] ?? slot.install_date
            const isEditing = editing === slot.install_date
            const booked = slot.booked_count ?? 0
            const capacity = slot.capacity ?? 6
            const pct = Math.min(100, capacity > 0 ? (booked / capacity) * 100 : 0)
            const isFull = booked >= capacity && capacity > 0
            const editId = `edit-${dateKey}`

            return (
              <div
                key={dateKey}
                className={`border-border rounded-xl border bg-background p-4 transition-shadow hover:shadow-sm ${!slot.is_active ? 'opacity-50' : ''}`}
                aria-label={`Install slot: ${fmtDisplay(dateKey)}`}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Date</label>
                        <Popover>
                          <DatePickerButton value={editValues.installDate} placeholder="Pick a date" />
                          <PopoverContent align="start" className="w-auto p-0">
                            <CalendarPicker
                              selected={editValues.installDate}
                              onSelect={(date) => setEditValues((v) => ({ ...v, installDate: date }))}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label htmlFor={`${editId}-capacity`} className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Capacity</label>
                        <input
                          id={`${editId}-capacity`}
                          name={`${editId}-capacity`}
                          type="number"
                          min="0"
                          max="50"
                          value={editValues.capacity ?? ''}
                          onChange={(e) => setEditValues((v) => ({ ...v, capacity: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        name={`${editId}-active`}
                        checked={editValues.isActive ?? true}
                        onChange={(e) => setEditValues((v) => ({ ...v, isActive: e.target.checked }))}
                        className="accent-primary"
                      />
                      Active
                    </label>

                    <div>
                      <label htmlFor={`${editId}-notes`} className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Notes</label>
                      <input
                        id={`${editId}-notes`}
                        name={`${editId}-notes`}
                        type="text"
                        placeholder="Optional note…"
                        value={editValues.notes ?? ''}
                        onChange={(e) => setEditValues((v) => ({ ...v, notes: e.target.value }))}
                        className={inputCls}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(slot.install_date)}
                        disabled={isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isPending ? 'Saving…' : 'Save'}
                      </button>
                      <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-1.5 text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0">
                        <p className="text-foreground font-medium">{fmtDisplay(dateKey)}</p>
                        {slot.notes && <p className="text-muted-foreground text-xs mt-0.5">{slot.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          role="progressbar"
                          aria-valuenow={booked}
                          aria-valuemin={0}
                          aria-valuemax={capacity}
                          aria-label={`${booked} of ${capacity} spots booked`}
                          className="h-1.5 w-24 rounded-full bg-border overflow-hidden"
                        >
                          <div
                            className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium tabular-nums ${isFull ? 'text-red-600' : 'text-muted-foreground'}`} aria-hidden="true">
                          {booked}/{capacity}
                        </span>
                        {isFull && <span className="bg-red-100 text-red-700 text-xs font-medium rounded-full px-2 py-0.5" aria-label="Fully booked">Full</span>}
                        {!slot.is_active && <span className="bg-gray-100 text-gray-600 text-xs font-medium rounded-full px-2 py-0.5" aria-label="Slot is inactive">Off</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(slot)}
                      aria-label={`Edit slot for ${fmtDisplay(dateKey)}`}
                      className="shrink-0 text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {slots.length === 0 && !showAddForm && (
            <p className="text-muted-foreground text-sm text-center py-12">
              No slots yet. Add a date to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
