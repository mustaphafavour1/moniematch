'use client'
import {
  ChevronLeft, ChevronRight, Bell, Search, Filter, Send,
  BarChart2, Zap, TrendingUp, AlertTriangle, CheckCircle2, Shield,
  Banknote, Settings, LogOut, Store, Calendar, User, Lock, X,
} from 'lucide-react'

const MAP: Record<string, React.FC<{size?:number;color?:string;strokeWidth?:number}>> = {
  back:       p => <ChevronLeft    {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  fwd:        p => <ChevronRight   {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  bell:       p => <Bell           {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  search:     p => <Search         {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  filter:     p => <Filter         {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  send:       p => <Send           {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  chart:      p => <BarChart2      {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  match:      p => <Zap            {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  'trend-up': p => <TrendingUp     {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  alert:      p => <AlertTriangle  {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  check:      p => <CheckCircle2   {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  shield:     p => <Shield         {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  money:      p => <Banknote       {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  settings:   p => <Settings       {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  logout:     p => <LogOut         {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  shop:       p => <Store          {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  calendar:   p => <Calendar       {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  user:       p => <User           {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  lock:       p => <Lock           {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
  close:      p => <X              {...p} size={p.size??20} color={p.color??'var(--ink)'} />,
}

export function Icon({ name, size=20, color, strokeWidth, style }: {
  name:string; size?:number; color?:string; strokeWidth?:number; style?:React.CSSProperties
}) {
  const Comp = MAP[name]
  if (!Comp) return <span style={{width:size,height:size,display:'inline-block',...style}} />
  return (
    <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,...style}}>
      <Comp size={size} color={color} strokeWidth={strokeWidth} />
    </span>
  )
}

export function RoundBtn({ onClick, children, bg='var(--linen)', size=38, style }: {
  onClick?:()=>void; children:React.ReactNode; bg?:string; size?:number; style?:React.CSSProperties
}) {
  return (
    <button onClick={onClick} style={{
      width:size, height:size, borderRadius:999,
      background:bg, border:'1px solid var(--line-strong)',
      display:'flex', alignItems:'center', justifyContent:'center',
      cursor:'pointer', flexShrink:0, ...style,
    }}>
      {children}
    </button>
  )
}
