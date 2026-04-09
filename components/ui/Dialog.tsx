'use client'

import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; children: React.ReactNode
}

export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <div className="fixed inset-y-0 right-0 left-[0px] z-50 flex items-center justify-center p-6">
        <RadixDialog.Content className="w-full max-w-md card-border p-6 shadow-2xl shadow-black/60 animate-fade-up">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, #8b5cf680, #8b5cf220, transparent)' }}
          />
          <div className="flex items-center justify-between mb-5">
            <RadixDialog.Title className="text-base font-semibold font-display text-ink tracking-tight">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-ink hover:border-groove transition-colors">
              <X size={13} />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
