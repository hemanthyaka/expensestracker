import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export type AuthUser = {
  id: number; firstName: string; lastName: string
  username: string; email: string; phone: string | null
  role: 'ADMIN' | 'USER'; createdAt: string; updatedAt: string
}

export function useCurrentUser() {
  return useQuery<AuthUser | null>({
    queryKey: ['auth', 'me'],
    queryFn:  async () => {
      const res = await fetch('/api/auth/me')
      if (res.status === 401) return null
      const data = await res.json()
      return data.user ?? null
    },
    staleTime: 60_000,
    retry:     false,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then(async (r) => {
        const json = await r.json()
        if (!r.ok) throw json
        return json
      }),
    onSuccess: (json) => {
      qc.setQueryData(['auth', 'me'], json.user ?? null)
    },
  })
}

export function useLogout() {
  const qc     = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: () => fetch('/api/auth/logout', { method: 'POST' }).then((r) => r.json()),
    onSuccess:  () => {
      qc.clear()
      router.push('/login')
    },
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, string>) =>
      fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then(async (r) => {
        const json = await r.json()
        if (!r.ok) throw json
        return json
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'me'] }),
  })
}
