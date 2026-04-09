import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AuthUser } from './useAuth'

export function useUsers(search?: string, role?: string) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (role)   params.set('role', role)
  return useQuery<AuthUser[]>({
    queryKey: ['users', search, role],
    queryFn:  async () => {
      const res = await fetch(`/api/admin/users?${params}`)
      const d   = await res.json()
      return d.users ?? []
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, string>) =>
      fetch('/api/admin/users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then(async (r) => {
        const json = await r.json()
        if (!r.ok) throw json
        return json
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User created') },
    onError:   () => toast.error('Failed to create user'),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, string>) =>
      fetch(`/api/admin/users/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then(async (r) => {
        const json = await r.json()
        if (!r.ok) throw json
        return json
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated') },
    onError:   () => toast.error('Failed to update user'),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/users/${id}`, { method: 'DELETE' }).then(async (r) => {
        const json = await r.json()
        if (!r.ok) throw json
        return json
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted') },
    onError:   (e: unknown) => toast.error((e as { error?: string })?.error ?? 'Failed to delete user'),
  })
}
