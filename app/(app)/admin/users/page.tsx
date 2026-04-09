'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, Shield, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/hooks/useUsers'
import { useCurrentUser, type AuthUser } from '@/lib/hooks/useAuth'
import { Button }  from '@/components/ui/Button'
import { Input }   from '@/components/ui/Input'
import { Dialog }  from '@/components/ui/Dialog'
import { Select }  from '@/components/ui/Select'
import { Card }    from '@/components/ui/Card'

const ROLE_OPTIONS = [
  { value: 'USER',  label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
]

function UserFormDialog({ open, onOpenChange, user }: {
  open: boolean; onOpenChange: (o: boolean) => void; user: AuthUser | null
}) {
  const isEdit = !!user
  const create = useCreateUser()
  const update = useUpdateUser()

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '', lastName:  user?.lastName ?? '',
    username:  user?.username  ?? '', email:     user?.email    ?? '',
    phone:     user?.phone     ?? '', role:      user?.role     ?? 'USER',
    password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => { const n = { ...e }; delete n[k]; return n })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!isEdit && form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' }); return
    }
    try {
      if (isEdit) {
        const payload: Record<string, string> = { id: String(user!.id), firstName: form.firstName, lastName: form.lastName, username: form.username, email: form.email, phone: form.phone, role: form.role }
        if (form.password) payload.password = form.password
        await update.mutateAsync(payload)
      } else {
        await create.mutateAsync({ ...form })
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]> }
      if (e?.errors) setErrors(Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k, v[0]])))
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={isEdit ? `Edit — ${user?.username}` : 'Add User'}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} />
          <Input label="Last Name"  value={form.lastName}  onChange={(e) => set('lastName',  e.target.value)} error={errors.lastName} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Username" value={form.username} onChange={(e) => set('username', e.target.value)} error={errors.username} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone (optional)" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <Select label="Role" value={form.role} onValueChange={(v) => set('role', v)} options={ROLE_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label={isEdit ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
          <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} error={errors.confirmPassword} />
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}</Button>
        </div>
      </form>
    </Dialog>
  )
}

export default function AdminUsersPage() {
  const { data: me }                    = useCurrentUser()
  const [search,   setSearch]           = useState('')
  const [editUser, setEditUser]         = useState<AuthUser | null>(null)
  const [showForm, setShowForm]         = useState(false)
  const [delUser,  setDelUser]          = useState<AuthUser | null>(null)
  const { data: users = [], isLoading } = useUsers(search || undefined)
  const deleteUser                      = useDeleteUser()

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-rim px-7 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-display text-ink tracking-tight">Users</h1>
          <p className="text-xs text-ink-3 font-sans mt-0.5">{users.length} registered users</p>
        </div>
        <Button size="sm" onClick={() => { setEditUser(null); setShowForm(true) }}>
          <Plus size={13} /> Add User
        </Button>
      </div>

      <div className="flex-1 p-7 flex flex-col gap-5">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…"
            className="w-full bg-card border border-rim rounded-xl pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-4 font-sans focus:outline-none focus:border-violet transition-colors" />
        </div>

        {/* Table */}
        <Card>
          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_100px] px-5 py-3 border-b border-rim">
            {['User', 'Username', 'Email', 'Role', ''].map((h, i) => (
              <p key={i} className="text-[10px] font-bold text-ink-4 uppercase tracking-widest font-display last:text-right">{h}</p>
            ))}
          </div>

          {isLoading ? (
            <div className="divide-y divide-rim/30">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1.5fr_1fr_100px] px-5 py-4 animate-pulse gap-4">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-groove/50" /><div className="h-3 bg-groove/50 rounded w-28" /></div>
                  <div className="h-3 bg-groove/30 rounded w-20 self-center" />
                  <div className="h-3 bg-groove/30 rounded w-32 self-center" />
                  <div className="h-5 bg-groove/30 rounded-full w-16 self-center" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-ink-3 text-sm font-sans">No users found</div>
          ) : (
            <div className="divide-y divide-rim/30">
              {users.map((u) => (
                <div key={u.id} className="grid grid-cols-[2fr_1fr_1.5fr_1fr_100px] px-5 py-3.5 items-center hover:bg-[#0e0e1c] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet/15 border border-violet/20 flex items-center justify-center text-[11px] font-bold text-violet-light font-display flex-shrink-0">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink font-sans">{u.firstName} {u.lastName}</p>
                      <p className="text-[10px] text-ink-4 font-sans">{format(new Date(u.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <p className="text-xs text-ink-3 font-mono">@{u.username}</p>
                  <p className="text-xs text-ink-2 font-sans truncate">{u.email}</p>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans ${u.role === 'ADMIN' ? 'bg-violet/15 text-violet-light' : 'bg-groove/50 text-ink-3'}`}>
                      {u.role === 'ADMIN' ? <Shield size={9} /> : <UserIcon size={9} />}
                      {u.role}
                    </span>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => { setEditUser(u); setShowForm(true) }}
                      className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-ink hover:bg-canvas transition-colors">
                      <Pencil size={11} />
                    </button>
                    {u.id !== me?.id && (
                      <button onClick={() => setDelUser(u)}
                        className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-rose hover:border-rose/30 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <UserFormDialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditUser(null) } else setShowForm(true) }} user={editUser} />

      <Dialog open={!!delUser} onOpenChange={(o) => { if (!o) setDelUser(null) }} title="Delete User">
        <p className="text-sm text-ink-2 font-sans mb-5">
          Delete <span className="text-ink font-medium">{delUser?.firstName} {delUser?.lastName}</span>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDelUser(null)}>Cancel</Button>
          <Button variant="danger" disabled={deleteUser.isPending}
            onClick={async () => { if (delUser) { await deleteUser.mutateAsync(delUser.id); setDelUser(null) } }}>
            {deleteUser.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
