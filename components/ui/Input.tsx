import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest font-display">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-[5px] bg-canvas border border-rim px-3 py-2.5 text-sm text-ink',
          'placeholder:text-ink-4 font-sans',
          'focus:outline-none focus:border-violet focus:ring-1 focus:ring-violet/20 transition-colors',
          error && 'border-rose/60',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
