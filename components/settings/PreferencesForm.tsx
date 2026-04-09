'use client'

import { useState, useEffect } from 'react'
import { toast }  from 'sonner'
import { Input }  from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card }   from '@/components/ui/Card'

const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)' },
]

export function PreferencesForm() {
  const [currency,   setCurrency]   = useState('₹')
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy')

  useEffect(() => {
    setCurrency(localStorage.getItem('pref_currency')    ?? '₹')
    setDateFormat(localStorage.getItem('pref_dateFormat') ?? 'MM/dd/yyyy')
  }, [])

  function save() {
    localStorage.setItem('pref_currency',   currency)
    localStorage.setItem('pref_dateFormat', dateFormat)
    toast.success('Preferences saved')
  }

  return (
    <Card>
      <div className="px-5 py-4 border-b border-rim">
        <p className="text-sm font-semibold font-display text-ink tracking-tight">Preferences</p>
        <p className="text-xs text-ink-3 font-sans mt-0.5">Display settings (saved locally)</p>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <Input label="Currency symbol" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="₹" />
        <Select label="Date format" value={dateFormat} onValueChange={setDateFormat} options={DATE_FORMATS} />
        <div className="flex justify-end">
          <Button onClick={save}>Save Preferences</Button>
        </div>
      </div>
    </Card>
  )
}
