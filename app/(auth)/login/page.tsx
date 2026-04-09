'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button }   from '@/components/ui/Button'
import { Input }    from '@/components/ui/Input'
import { useLogin } from '@/lib/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const login  = useLogin()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    login.mutate(form, {
      onSuccess: () => router.push('/dashboard'),
      onError:   (err: unknown) => {
        const e = err as { error?: string }
        setError(e?.error ?? 'Login failed')
      },
    })
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card-border p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #8b5cf680, #8b5cf220, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet to-violet-dim flex items-center justify-center violet-glow">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-sm font-bold font-display text-ink tracking-tight">Spendly</p>
            <p className="text-[10px] text-ink-4 font-sans">Expense Tracker</p>
          </div>
        </div>

        <h1 className="text-xl font-bold font-display text-ink tracking-tight mb-1">Welcome back</h1>
        <p className="text-xs text-ink-3 font-sans mb-6">Sign in to your account</p>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose/10 border border-rose/20 text-xs text-rose font-sans">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest font-display">Password</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-canvas border border-rim rounded-xl px-3 py-2.5 pr-10 text-sm text-ink font-sans focus:outline-none focus:border-violet transition-colors"
              />
              <button type="button" onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink transition-colors">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-fit mt-1" disabled={login.isPending}>
            {login.isPending ? <><Loader2 size={13} className="animate-spin" /> Signing in…</> : 'Sign in'}
          </Button>
        </form>

        <p className="text-left text-xs text-ink-3 font-sans mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-violet-light hover:text-violet transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
