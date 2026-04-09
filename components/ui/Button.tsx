import { forwardRef } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-violet to-violet-dim text-white violet-glow hover:from-violet-light hover:to-violet',
  ghost:   'bg-card border border-rim text-ink-2 hover:text-ink hover:border-groove hover:bg-[#14142a]',
  danger:  'bg-rose/10 border border-rose/30 text-rose hover:bg-rose/20',
}
const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1',
  md: 'px-4 py-2 text-sm gap-1.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center rounded-[5px] font-medium font-sans transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'
