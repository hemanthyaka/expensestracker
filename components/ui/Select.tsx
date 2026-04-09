'use client'

import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { clsx } from 'clsx'

interface SelectOption { value: string; label: string }
interface SelectProps {
  value: string; onValueChange: (v: string) => void
  options: SelectOption[]; placeholder?: string; label?: string
}

export function Select({ value, onValueChange, options, placeholder = 'Select…', label }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest font-display">{label}</label>}
      <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger className="flex items-center justify-between w-full rounded-xl bg-canvas border border-rim px-3 py-2.5 text-sm text-ink font-sans focus:outline-none focus:border-violet transition-colors">
          <RadixSelect.Value placeholder={placeholder} />
          <ChevronDown size={13} className="text-ink-3 flex-shrink-0" />
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content className="z-50 card-border shadow-2xl shadow-black/60 overflow-hidden min-w-[160px]">
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer outline-none',
                    'text-ink-2 data-[highlighted]:bg-[#14142a] data-[highlighted]:text-ink transition-colors'
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator><Check size={11} className="text-violet" /></RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  )
}
