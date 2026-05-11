'use client'

import { useState, useTransition } from 'react'
import { KeyRound, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const inputCls =
  'border-border bg-background text-foreground w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary'

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return '—'
  }
}

async function apiCreateUser(body) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Failed to create user.')
  return data
}

async function apiPatchUser(id, body) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Failed to update user.')
  return data
}

async function apiDeleteUser(id) {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || 'Failed to delete user.')
  return data
}

export default function UsersClient({ initialUsers = [], currentUser = {}, loadError = null }) {
  const [users, setUsers] = useState(initialUsers)
  const [editing, setEditing] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [resettingPassword, setResettingPassword] = useState(null)
  const [passwordValues, setPasswordValues] = useState({ password: '', confirm: '' })
  const [addOpen, setAddOpen] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', isActive: true })
  const [error, setError] = useState(loadError)
  const [isPending, startTransition] = useTransition()

  const handleStartEdit = (user) => {
    setEditing(user.id)
    setEditValues({ email: user.email, name: user.name || '', isActive: user.isActive })
    setResettingPassword(null)
  }

  const handleCancelEdit = () => {
    setEditing(null)
    setEditValues({})
  }

  const handleSaveEdit = (user) => {
    setError(null)
    startTransition(async () => {
      try {
        const { user: saved } = await apiPatchUser(user.id, {
          email: editValues.email,
          name: editValues.name,
          isActive: editValues.isActive,
        })
        setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)))
        setEditing(null)
      } catch (err) {
        setError(err.message)
      }
    })
  }

  const handleOpenPasswordReset = (user) => {
    setResettingPassword(user.id)
    setPasswordValues({ password: '', confirm: '' })
    setEditing(null)
  }

  const handleSavePassword = (user) => {
    setError(null)
    if (passwordValues.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (passwordValues.password !== passwordValues.confirm) {
      setError('Passwords do not match.')
      return
    }
    startTransition(async () => {
      try {
        await apiPatchUser(user.id, { password: passwordValues.password })
        setResettingPassword(null)
        setPasswordValues({ password: '', confirm: '' })
      } catch (err) {
        setError(err.message)
      }
    })
  }

  const handleDelete = (user) => {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return
    setError(null)
    startTransition(async () => {
      try {
        await apiDeleteUser(user.id)
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
      } catch (err) {
        setError(err.message)
      }
    })
  }

  const handleToggleActive = (user, nextActive) => {
    setError(null)
    startTransition(async () => {
      try {
        const { user: saved } = await apiPatchUser(user.id, { isActive: nextActive })
        setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)))
      } catch (err) {
        setError(err.message)
      }
    })
  }

  const handleAdd = () => {
    setError(null)
    if (!newUser.email || !newUser.password) {
      setError('Email and password are required.')
      return
    }
    if (newUser.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    startTransition(async () => {
      try {
        const { user: created } = await apiCreateUser({
          email: newUser.email,
          name: newUser.name || null,
          password: newUser.password,
          isActive: newUser.isActive,
        })
        setUsers((prev) => [...prev, created])
        setNewUser({ email: '', name: '', password: '', isActive: true })
        setAddOpen(false)
      } catch (err) {
        setError(err.message)
      }
    })
  }

  const isCurrentUser = (user) => user.id === currentUser?.id

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-border shrink-0 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-xl font-semibold">Users</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Manage admin accounts, email addresses, and passwords
            </p>
          </div>
          <Popover open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setNewUser({ email: '', name: '', password: '', isActive: true }) }}>
            <PopoverTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium">
                + Add user
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[360px] space-y-4 p-4">
              <p className="text-foreground text-sm font-semibold">Add a new admin user</p>

              <div className="space-y-3">
                <div>
                  <label htmlFor="new-email" className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">Email</label>
                  <input
                    id="new-email"
                    type="email"
                    autoComplete="off"
                    value={newUser.email}
                    onChange={(e) => setNewUser((v) => ({ ...v, email: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="new-name" className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">Name</label>
                  <input
                    id="new-name"
                    type="text"
                    placeholder="Optional"
                    value={newUser.name}
                    onChange={(e) => setNewUser((v) => ({ ...v, name: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">Password</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((v) => ({ ...v, password: e.target.value }))}
                    className={inputCls}
                  />
                  <p className="text-muted-foreground mt-1 text-xs">At least 8 characters.</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newUser.isActive}
                    onChange={(e) => setNewUser((v) => ({ ...v, isActive: e.target.checked }))}
                    className="accent-primary"
                  />
                  Active (can sign in)
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Saving…' : 'Create user'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-1.5 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="border-border overflow-hidden rounded-xl border">
          <div className="bg-muted text-muted-foreground hidden grid-cols-[1.5fr_1fr_120px_120px_140px] gap-4 px-4 py-2 text-xs font-medium tracking-wide uppercase md:grid">
            <div>Email</div>
            <div>Name</div>
            <div>Status</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>

          {users.length === 0 ? (
            <p className="text-muted-foreground bg-background px-4 py-12 text-center text-sm">
              No users yet. Add one to get started.
            </p>
          ) : (
            <ul className="divide-border bg-background divide-y">
              {users.map((user) => {
                const isEditing = editing === user.id
                const isResetting = resettingPassword === user.id
                const isSelf = isCurrentUser(user)

                return (
                  <li key={user.id} className="px-4 py-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">Email</label>
                            <input
                              type="email"
                              value={editValues.email}
                              onChange={(e) => setEditValues((v) => ({ ...v, email: e.target.value }))}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">Name</label>
                            <input
                              type="text"
                              value={editValues.name}
                              onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editValues.isActive ?? true}
                            disabled={isSelf}
                            onChange={(e) => setEditValues((v) => ({ ...v, isActive: e.target.checked }))}
                            className="accent-primary"
                          />
                          Active (can sign in)
                          {isSelf && <span className="text-muted-foreground text-xs">(can't deactivate yourself)</span>}
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(user)}
                            disabled={isPending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isPending ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-1.5 text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : isResetting ? (
                      <div className="space-y-3">
                        <p className="text-foreground text-sm font-medium">Set new password for {user.email}</p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">New password</label>
                            <input
                              type="password"
                              autoComplete="new-password"
                              value={passwordValues.password}
                              onChange={(e) => setPasswordValues((v) => ({ ...v, password: e.target.value }))}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="text-muted-foreground mb-1 block text-xs tracking-wide uppercase">Confirm</label>
                            <input
                              type="password"
                              autoComplete="new-password"
                              value={passwordValues.confirm}
                              onChange={(e) => setPasswordValues((v) => ({ ...v, confirm: e.target.value }))}
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <p className="text-muted-foreground text-xs">At least 8 characters.</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSavePassword(user)}
                            disabled={isPending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isPending ? 'Saving…' : 'Save password'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setResettingPassword(null); setPasswordValues({ password: '', confirm: '' }) }}
                            className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-1.5 text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1.5fr_1fr_120px_120px_140px] md:gap-4">
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-sm font-medium">{user.email}</p>
                          {isSelf && <span className="text-muted-foreground text-xs">You</span>}
                        </div>
                        <div className="text-muted-foreground truncate text-sm">{user.name || '—'}</div>
                        <div>
                          <button
                            type="button"
                            onClick={() => !isSelf && handleToggleActive(user, !user.isActive)}
                            disabled={isSelf || isPending}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                              user.isActive
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                            aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                        <div className="text-muted-foreground text-xs">{fmtDate(user.createdAt)}</div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(user)}
                            className="text-muted-foreground hover:text-foreground border-border hover:bg-muted rounded-lg border px-3 py-1 text-xs font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordReset(user)}
                            className="text-muted-foreground hover:text-foreground border-border hover:bg-muted inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium transition-colors"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Password
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={isSelf || isPending}
                            className="border-border inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                            aria-label={`Delete ${user.email}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          Tip: the <code className="bg-muted rounded px-1">AUTH_ADMIN_EMAIL</code> / <code className="bg-muted rounded px-1">AUTH_ADMIN_PASSWORD</code> env vars
          still grant sign-in as a break-glass fallback if you ever lock yourself out of the DB users above.
        </p>
      </div>
    </div>
  )
}
