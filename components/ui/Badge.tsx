interface BadgeProps { label: string; color: string }

export function Badge({ label, color }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium w-fit tracking-wide whitespace-nowrap"
      style={{ backgroundColor: `${color}1a`, color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  )
}
