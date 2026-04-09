'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'

type Errors = Record<string, string>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter',  pass: /[A-Z]/.test(password) },
    { label: 'One number',            pass: /[0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.pass).length
  const color = score === 3 ? '#10b981' : score === 2 ? '#f59e0b' : '#f43f5e'

  if (!password) return null
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? color : '#1c1c30' }} />
        ))}
      </div>
      <div className="flex flex-col gap-0.5">
        {checks.map((c) => (
          <p key={c.label} className={`text-[10px] font-sans flex items-center gap-1 ${c.pass ? 'text-emerald' : 'text-ink-4'}`}>
            <Check size={9} className={c.pass ? 'opacity-100' : 'opacity-0'} />{c.label}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '',
    phone: '', password: '', confirmPassword: '',
  })
  const [showPw,   setShowPw]   = useState(false)
  const [errors,   setErrors]   = useState<Errors>({})
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => { const n = { ...e }; delete n[k]; return n })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Client-side validation
    const errs: Errors = {}
    if (!form.firstName.trim())                       errs.firstName       = 'Required'
    if (!form.lastName.trim())                        errs.lastName        = 'Required'
    if (form.username.length < 3)                     errs.username        = 'Min 3 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username))      errs.username        = 'Letters, numbers, underscores only'
    if (!form.email.includes('@'))                    errs.email           = 'Invalid email'
    if (form.password.length < 8)                     errs.password        = 'Min 8 characters'
    if (!/[A-Z]/.test(form.password))                 errs.password        = 'Must contain uppercase letter'
    if (!/[0-9]/.test(form.password))                 errs.password        = 'Must contain a number'
    if (form.password !== form.confirmPassword)       errs.confirmPassword = 'Passwords do not match'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) setErrors(Object.fromEntries(Object.entries(data.errors).map(([k, v]) => [k, (v as string[])[0]])))
        else setError(data.error ?? 'Registration failed')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="card-border p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #8b5cf680, #8b5cf220, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet to-violet-dim flex items-center justify-center violet-glow">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-sm font-bold font-display text-ink tracking-tight">Spendly</p>
            <p className="text-[10px] text-ink-4 font-sans">Expense Tracker</p>
          </div>
        </div>

        <h1 className="text-xl font-bold font-display text-ink tracking-tight mb-1">Create an account</h1>
        <p className="text-xs text-ink-3 font-sans mb-6">Fill in your details to get started</p>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-rose/10 border border-rose/20 text-xs text-rose font-sans">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="Hemanth" value={form.firstName}
              onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} />
            <Input label="Last Name" placeholder="Yaka" value={form.lastName}
              onChange={(e) => set('lastName', e.target.value)} error={errors.lastName} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Username" placeholder="hemanth_k" value={form.username}
              onChange={(e) => set('username', e.target.value)} error={errors.username} />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => set('email', e.target.value)} error={errors.email} />
          </div>

          <Input label="Phone (optional)" type="tel" placeholder="+91 98765 43210" value={form.phone}
            onChange={(e) => set('phone', e.target.value)} error={errors.phone} />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest font-display">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={(e) => set('password', e.target.value)}
                  className={`w-full bg-canvas border rounded-xl px-3 py-2.5 pr-10 text-sm text-ink font-sans focus:outline-none focus:border-violet transition-colors ${errors.password ? 'border-rose' : 'border-rim'}`}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest font-display">Confirm Password</label>
              <input type="password" placeholder="••••••••"
                value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)}
                className={`w-full bg-canvas border rounded-xl px-3 py-2.5 text-sm text-ink font-sans focus:outline-none focus:border-violet transition-colors ${errors.confirmPassword ? 'border-rose' : 'border-rim'}`}
              />
              {errors.confirmPassword && <p className="text-xs text-rose">{errors.confirmPassword}</p>}
            </div>
          </div>

          <Button type="submit" className="w-fit mt-1" disabled={loading}>
            {loading ? <><Loader2 size={13} className="animate-spin" /> Creating account…</> : 'Create account'}
          </Button>
        </form>

        <p className="text-left text-xs text-ink-3 font-sans mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-light hover:text-violet transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
