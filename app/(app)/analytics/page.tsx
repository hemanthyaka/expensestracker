'use client'

import { useState } from 'react'
import { format, addMonths } from 'date-fns'
import { Select }              from '@/components/ui/Select'
import { MonthlyTrendChart }   from '@/components/analytics/MonthlyTrendChart'
import { CategoryPieChart }    from '@/components/analytics/CategoryPieChart'
import { TopSpendingTable }    from '@/components/analytics/TopSpendingTable'

function monthOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = addMonths(new Date(), i)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') }
  })
}

export default function AnalyticsPage() {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-rim px-4 sm:px-7 py-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold font-display text-ink tracking-tight">Analytics</h1>
          <p className="text-xs text-ink-3 font-sans mt-0.5">Detailed spending insights</p>
        </div>
        <div className="w-36 sm:w-44 flex-shrink-0"><Select value={month} onValueChange={setMonth} options={monthOptions()} /></div>
      </div>
      <div className="flex-1 p-4 sm:p-7 flex flex-col gap-5">
        <MonthlyTrendChart month={month} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <CategoryPieChart month={month} />
          <TopSpendingTable month={month} />
        </div>
      </div>
    </div>
  )
}
