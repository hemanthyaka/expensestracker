'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse, isValid, startOfMonth } from 'date-fns'
import { CalendarDays, ChevronRight } from 'lucide-react'
import 'react-day-picker/style.css'

interface DatePickerProps {
  value: string          // 'yyyy-MM-dd'
  onChange: (v: string) => void
  label?: string
  error?: string
}

export function DatePicker({ value, onChange, label, error }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const display  = selected && isValid(selected) ? format(selected, 'dd MMM yyyy') : 'Pick a date'

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest font-display">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between w-full rounded-xl bg-canvas border px-3 py-2.5 text-sm font-sans text-left transition-colors focus:outline-none ${
          error ? 'border-rose' : open ? 'border-violet' : 'border-rim hover:border-groove'
        }`}
      >
        <span className={selected && isValid(selected) ? 'text-ink' : 'text-ink-4'}>{display}</span>
        <CalendarDays size={14} className="text-ink-3 flex-shrink-0" />
      </button>
      {error && <p className="text-xs text-rose">{error}</p>}

      {open && (
        <div className="absolute z-[60] mt-1 card-border shadow-2xl shadow-black/60 p-3 animate-fade-up">
          <style>{`
            .rdp-root {
              --rdp-accent-color: #8b5cf6;
              --rdp-accent-background-color: rgba(139,92,246,0.15);
              --rdp-day-height: 32px;
              --rdp-day-width: 32px;
              font-family: 'Lexend', sans-serif;
              font-size: 13px;
            }
            .rdp-month_caption { color: #f1f5f9; font-weight: 600; font-size: 13px; margin-bottom: 8px; }
            .rdp-weekday { color: #3d4460; font-size: 11px; font-weight: 500; }
            .rdp-day { color: #94a3b8; border-radius: 8px; }
            .rdp-day:hover:not([disabled]) { background: rgba(139,92,246,0.1) !important; color: #f1f5f9; }
            .rdp-day_button { width: 32px; height: 32px; border-radius: 8px; }
            .rdp-selected .rdp-day_button { background: #8b5cf6 !important; color: #fff !important; }
            .rdp-today:not(.rdp-selected) .rdp-day_button { border: 1px solid #8b5cf640; color: #a78bfa; }
            .rdp-outside { opacity: 0.3; }
            .rdp-nav { gap: 4px; }
          `}</style>
          <DayPicker
            mode="single"
            defaultMonth={startOfMonth(new Date())}
            startMonth={startOfMonth(new Date())}
            disabled={{ before: startOfMonth(new Date()) }}
            selected={selected && isValid(selected) ? selected : undefined}
            onSelect={(day) => {
              if (day) { onChange(format(day, 'yyyy-MM-dd')); setOpen(false) }
            }}
            components={{
              PreviousMonthButton: () => <span />,
              NextMonthButton: (props) => (
                <button {...props} className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-ink hover:border-groove transition-colors">
                  <ChevronRight size={13} />
                </button>
              ),
            }}
          />
        </div>
      )}
    </div>
  )
}
