'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, BarChart3, Target, Settings, Zap, LogOut, Users, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useCurrentUser, useLogout } from '@/lib/hooks/useAuth'

const USER_NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/expenses',  label: 'Expenses',   icon: CreditCard },
  { href: '/analytics', label: 'Analytics',  icon: BarChart3 },
  { href: '/budget',    label: 'Budget',     icon: Target },
]
const ADMIN_NAV = [
  { href: '/dashboard',   label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users',     icon: Users },
]
const SYSTEM = [{ href: '/settings', label: 'Settings', icon: Settings }]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname        = usePathname()
  const { data: user }  = useCurrentUser()
  const logout          = useLogout()

  function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    return (
      <Link
        href={href}
        onClick={onClose}
        className={clsx(
          'group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-sans transition-all duration-150',
          active
            ? 'bg-violet/10 text-violet-light border border-violet/20'
            : 'text-ink-3 hover:text-ink-2 hover:bg-[#14142a]'
        )}
      >
        <Icon size={15} className={clsx('transition-colors', active ? 'text-violet-light' : 'text-ink-4 group-hover:text-ink-3')} />
        <span className="font-medium">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-light" />}
      </Link>
    )
  }

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-canvas border-r border-rim flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-violet/5 to-transparent pointer-events-none" />

      {/* Logo + mobile close */}
      <div className="relative flex items-center gap-3 px-5 py-5 border-b border-rim">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet to-violet-dim flex items-center justify-center violet-glow flex-shrink-0">
          <Zap size={15} className="text-white" fill="white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold font-display text-ink leading-tight tracking-tight">Spendly</p>
          <p className="text-[10px] text-ink-4 font-sans">Expense Tracker</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold text-ink-4 uppercase tracking-[0.15em] px-2 mb-1.5 font-display">
          {user?.role === 'ADMIN' ? 'Admin' : 'Main'}
        </p>
        {(user?.role === 'ADMIN' ? ADMIN_NAV : USER_NAV).map((item) => <NavLink key={item.href} {...item} />)}

        <p className="text-[9px] font-bold text-ink-4 uppercase tracking-[0.15em] px-2 mt-4 mb-1.5 font-display">System</p>
        {SYSTEM.map((item) => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-rim">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet/15 border border-violet/25 flex items-center justify-center text-xs font-bold text-violet-light font-display flex-shrink-0">
            {user ? `${user.firstName[0]}${user.lastName[0]}` : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink font-sans truncate">
              {user ? `${user.firstName} ${user.lastName}` : '…'}
            </p>
            <p className="text-[10px] text-ink-4 font-sans">
              {user?.role === 'ADMIN' ? 'Admin account' : 'Personal account'}
            </p>
          </div>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            title="Sign out"
            className="text-ink-4 hover:text-rose transition-colors flex-shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
