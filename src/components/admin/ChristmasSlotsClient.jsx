'use client'

import { useState, useTransition } from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// `YYYY-MM-DD` sorts chronologically as a plain string — robust against
// Neon returning either Date objects or stringified timestamps.
const getDateKey = (slot) => String(slot?.install_date ?? '').split('T')[0]
const compareByDateAsc = (a, b) => getDateKey(a).localeCompare(getDateKey(b))
const sortSlotsAsc = (list) => [...list].sort(compareByDateAsc)

// ── Multi-select calendar — inline, used in the Add form ─────────────────────

function MultiCalendarPicker({ selected = [], onSelect }) {
  const [month, setMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  return (
    <Card className="border-border w-fit border shadow-none">
      <CardContent className="p-0">
        <Calendar
          mode="multiple"
          selected={selected}
          onSelect={(dates) => onSelect?.(dates ?? [])}
          month={month}
          onMonthChange={setMonth}
          fixedWeeks
          className="p-3 [--cell-size:--spacing(9.5)]"
        />
      </CardContent>
    </Card>
  )
}

// ── Single-date calendar picker — used in the Edit form ──────────────────────

function CalendarPicker({ selected, onSelect }) {
  const [month, setMonth] = useState(selected ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const handleSelect = (date) => {
    if (date) setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    onSelect?.(date)
  }

  return (
    <Card size="sm" className="w-fit max-w-[300px] border-0 shadow-none">
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
    </Card>
  )
}

// ── Popover trigger button — used in the Edit form ───────────────────────────

function DatePickerButton({ value, placeholder = 'Select date' }) {
  return (
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-start gap-2 text-left font-normal">
        <CalendarIcon className="text-muted-foreground h-4 w-4" />
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value ? fmtDisplay(toDateStr(value)) : placeholder}
        </span>
      </Button>
    </PopoverTrigger>
  )
}

// ── API ───────────────────────────────────────────────────────────────────────

async function deleteSlotApi(installDate) {
  const res = await fetch('/api/christmas/slots', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ installDate }),
  })
  if (!res.ok) throw new Error('Failed to delete')
  return res.json()
}

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

export default function ChristmasSlotsClient({ slots: initialSlots }) {
  const [slots, setSlots] = useState(() => sortSlotsAsc(initialSlots))

  const [editing, setEditing] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [addOpen, setAddOpen] = useState(false)
  const [newDate, setNewDate] = useState({ installDates: [], capacity: 6, isActive: true, notes: '' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)

  const startEdit = (slot) => {
    const dateKey = slot.install_date?.split('T')[0] ?? slot.install_date
    setEditing(slot.install_date)
    setEditValues({
      installDate: parseDate(dateKey),
      capacity: slot.capacity,
      isActive: slot.is_active,
      notes: slot.notes ?? '',
    })
    setAddOpen(false)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditValues({})
  }

  const handleDelete = (installDate) => {
    if (!confirm(`Delete slot for ${fmtDisplay(installDate)}? This cannot be undone.`)) return
    startTransition(async () => {
      try {
        await deleteSlotApi(installDate)
        setSlots((prev) => prev.filter((s) => getDateKey(s) !== installDate))
      } catch {
        setError('Delete failed. Try again.')
      }
    })
  }

  const handleSave = (originalInstallDate) => {
    const originalKey = originalInstallDate?.split('T')[0] ?? originalInstallDate
    const newKey = toDateStr(editValues.installDate)
    if (!newKey) {
      setError('Please select a date.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const result = await saveSlot(
          newKey,
          Number(editValues.capacity),
          editValues.isActive,
          editValues.notes || null,
          originalKey,
        )
        const saved = result.slot ?? result
        setSlots((prev) => {
          if (originalKey !== newKey) {
            const filtered = prev.filter((s) => getDateKey(s) !== originalKey)
            const exists = filtered.some((s) => getDateKey(s) === newKey)
            const merged = exists
              ? filtered.map((s) => (getDateKey(s) === newKey ? { ...s, ...saved } : s))
              : [...filtered, { ...saved, booked_count: 0 }]
            return sortSlotsAsc(merged)
          }
          return prev.map((s) => (getDateKey(s) === newKey ? { ...s, ...saved } : s))
        })
        setEditing(null)
      } catch {
        setError('Save failed. Try again.')
      }
    })
  }

  const handleAdd = () => {
    if (!newDate.installDates.length) {
      setError('Please select at least one date.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const results = await Promise.all(
          newDate.installDates.map((d) =>
            saveSlot(toDateStr(d), Number(newDate.capacity), newDate.isActive, newDate.notes || null),
          ),
        )
        setSlots((prev) => {
          let next = [...prev]
          for (const result of results) {
            const saved = result.slot ?? result
            const key = getDateKey(saved)
            const exists = next.some((s) => getDateKey(s) === key)
            if (exists) {
              next = next.map((s) => (getDateKey(s) === key ? { ...s, ...saved } : s))
            } else {
              next.push({ ...saved, booked_count: 0 })
            }
          }
          return sortSlotsAsc(next)
        })
        setNewDate({ installDates: [], capacity: 6, isActive: true, notes: '' })
        setAddOpen(false)
      } catch {
        setError('Save failed. Try again.')
      }
    })
  }

  const inputCls =
    'border-border bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-border shrink-0 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-xl font-semibold">Install slots — 2026 season</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Manage capacity and availability for each install window
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/christmas"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Jobs
            </a>
            <Popover
              open={addOpen}
              onOpenChange={(o) => {
                setAddOpen(o)
                if (!o) setNewDate({ installDates: [], capacity: 6, isActive: true, notes: '' })
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  onClick={() => setEditing(null)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  + Add date
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[340px] space-y-4 p-4">
                <p className="text-foreground text-sm font-semibold">Add install dates</p>
                <p className="text-muted-foreground -mt-2 text-xs">
                  Click dates to select, click again to deselect.
                </p>

                <MultiCalendarPicker
                  selected={newDate.installDates}
                  onSelect={(dates) => setNewDate((v) => ({ ...v, installDates: dates }))}
                />

                {newDate.installDates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {[...newDate.installDates]
                      .sort((a, b) => a - b)
                      .map((d) => {
                        const str = toDateStr(d)
                        return (
                          <span
                            key={str}
                            className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                          >
                            {fmtDisplay(str)}
                            <button
                              type="button"
                              aria-label={`Remove ${fmtDisplay(str)}`}
                              onClick={() =>
                                setNewDate((v) => ({
                                  ...v,
                                  installDates: v.installDates.filter((x) => toDateStr(x) !== str),
                                }))
                              }
                              className="ml-0.5 transition-colors hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )
                      })}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="new-capacity"
                      className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase"
                    >
                      Capacity
                    </label>
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
                  <div>
                    <label
                      htmlFor="new-notes"
                      className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase"
                    >
                      Notes
                    </label>
                    <input
                      id="new-notes"
                      name="new-notes"
                      type="text"
                      placeholder="Optional…"
                      value={newDate.notes}
                      onChange={(e) => setNewDate((v) => ({ ...v, notes: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="new-is-active"
                    checked={newDate.isActive}
                    onChange={(e) => setNewDate((v) => ({ ...v, isActive: e.target.checked }))}
                    className="accent-primary"
                  />
                  Active (visible to customers)
                </label>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAdd}
                    disabled={isPending || newDate.installDates.length === 0}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isPending
                      ? 'Saving…'
                      : newDate.installDates.length > 0
                        ? `Add ${newDate.installDates.length} slot${newDate.installDates.length !== 1 ? 's' : ''}`
                        : 'Add slots'}
                  </button>
                  <button
                    onClick={() => setAddOpen(false)}
                    className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-1.5 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Slot rows */}
          {slots.map((slot) => {
            const dateKey = getDateKey(slot)
            const isEditing = editing === slot.install_date
            const booked = slot.booked_count ?? 0
            const capacity = slot.capacity ?? 6
            const pct = Math.min(100, capacity > 0 ? (booked / capacity) * 100 : 0)
            const isFull = booked >= capacity && capacity > 0
            const editId = `edit-${dateKey}`

            return (
              <div
                key={dateKey}
                className={`border-border bg-background rounded-xl border p-4 transition-shadow hover:shadow-sm ${!slot.is_active ? 'opacity-50' : ''} ${isEditing ? 'col-span-full' : ''}`}
                aria-label={`Install slot: ${fmtDisplay(dateKey)}`}
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">
                          Date
                        </label>
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
                        <label
                          htmlFor={`${editId}-capacity`}
                          className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase"
                        >
                          Capacity
                        </label>
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

                    <label className="flex cursor-pointer items-center gap-2 text-sm">
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
                      <label
                        htmlFor={`${editId}-notes`}
                        className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase"
                      >
                        Notes
                      </label>
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

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(slot.install_date)}
                          disabled={isPending}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isPending ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-1.5 text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(dateKey)}
                        disabled={isPending}
                        className="text-muted-foreground text-xs transition-colors hover:text-red-600 disabled:opacity-40"
                      >
                        Delete slot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="shrink-0">
                        <p className="text-foreground font-medium">{fmtDisplay(dateKey)}</p>
                        {slot.notes && <p className="text-muted-foreground mt-0.5 text-xs">{slot.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          role="progressbar"
                          aria-valuenow={booked}
                          aria-valuemin={0}
                          aria-valuemax={capacity}
                          aria-label={`${booked} of ${capacity} spots booked`}
                          className="bg-border h-1.5 w-24 overflow-hidden rounded-full"
                        >
                          <div
                            className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium tabular-nums ${isFull ? 'text-red-600' : 'text-muted-foreground'}`}
                          aria-hidden="true"
                        >
                          {booked}/{capacity}
                        </span>
                        {isFull && (
                          <span
                            className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                            aria-label="Fully booked"
                          >
                            Full
                          </span>
                        )}
                        {!slot.is_active && (
                          <span
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                            aria-label="Slot is inactive"
                          >
                            Off
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(slot)}
                      aria-label={`Edit slot for ${fmtDisplay(dateKey)}`}
                      className="text-muted-foreground hover:text-foreground border-border hover:bg-muted shrink-0 rounded-lg border px-3 py-1 text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {slots.length === 0 && !addOpen && (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No slots yet. Add a date to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
