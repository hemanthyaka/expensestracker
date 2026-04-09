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

          <button
            type="submit"
            disabled={login.isPending}
            className="relative w-fit mt-1 px-5 py-2.5 rounded-[5px] text-sm font-semibold text-white overflow-hidden
              bg-gradient-to-r from-violet to-violet-dim
              disabled:cursor-not-allowed transition-all duration-300
              hover:shadow-[0_0_20px_#8b5cf640] hover:scale-[1.02] active:scale-[0.98]
              disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {/* shimmer sweep when loading */}
            {login.isPending && (
              <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_ease-in-out_infinite]
                bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            )}
            <span className={`flex items-center gap-2 transition-all duration-200 ${login.isPending ? 'opacity-80' : 'opacity-100'}`}>
              {login.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </span>
          </button>
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
