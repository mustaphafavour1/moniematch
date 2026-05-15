interface SectionLabelProps {
  children: React.ReactNode
  light?: boolean
  className?: string
}

export default function SectionLabel({ children, light, className = '' }: SectionLabelProps) {
  return (
    <span
      className={`slbl ${className}`}
      style={light ? { color: 'var(--gold-l)', borderColor: 'rgba(148,134,97,.2)' } : undefined}
    >
      {children}
    </span>
  )
}
