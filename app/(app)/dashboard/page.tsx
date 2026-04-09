'use client'

import { useCurrentUser } from '@/lib/hooks/useAuth'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { UserDashboard }  from '@/components/dashboard/UserDashboard'

export default function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading || user === undefined) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 rounded-full border-2 border-violet border-t-transparent animate-spin" />
    </div>
  )

  if (!user) return null

  return user.role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />
}
