import { clsx } from 'clsx'

export function Card({
  children, className, accentColor, style,
}: {
  children: React.ReactNode; className?: string; accentColor?: string; style?: React.CSSProperties
}) {
  return (
    <div className={clsx('card-border relative overflow-hidden', className)} style={style}>
      {accentColor && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}20, transparent)` }}
        />
      )}
      {children}
    </div>
  )
}
