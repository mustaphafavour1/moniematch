'use client'
import { useEffect, useRef } from 'react'

export function Progress({ value, color='var(--clay)', height=6 }: {
  value:number; color?:string; height?:number
}) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div style={{width:'100%', height, borderRadius:999, background:'var(--line-strong)', overflow:'hidden'}}>
      <div style={{width:`${pct}%`, height:'100%', background:color, borderRadius:999, transition:'width 600ms ease'}} />
    </div>
  )
}

export function ProgressRing({ value, size=42, stroke=4, color='var(--clay)', trackColor, children }: {
  value:number; size?:number; stroke?:number; color?:string; trackColor?:string; children?:React.ReactNode
}) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(100, value) / 100)
  return (
    <div style={{position:'relative', width:size, height:size, flexShrink:0}}>
      <svg width={size} height={size} style={{position:'absolute', inset:0, transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={trackColor || 'var(--line-strong)'} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{transition:'stroke-dashoffset 600ms ease'}} />
      </svg>
      <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
        {children}
      </div>
    </div>
  )
}

// Animated number that counts up on mount
export function AnimatedNaira({ value, compact=false }: { value:number; compact?:boolean }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const duration = 800
    const start    = Date.now()
    const from     = 0

    const fmt = (n: number) => {
      if (compact) {
        if (n >= 1_000_000) return `₦${(n/1_000_000).toFixed(1)}M`
        if (n >= 1_000)     return `₦${(n/1_000).toFixed(0)}k`
      }
      return `₦${n.toLocaleString('en-NG')}`
    }

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const current = Math.round(from + (value - from) * eased)
      el.textContent = fmt(current)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, compact])

  return <span ref={ref}>{`₦${value.toLocaleString('en-NG')}`}</span>
}
