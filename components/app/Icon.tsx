'use client'
import {
  ChevronLeft, ChevronRight, Bell, Search, Filter, Send,
  BarChart2, Zap, TrendingUp, AlertTriangle, CheckCircle2, Shield,
  Banknote, Settings, LogOut, Store, Calendar, User, Lock, X,
  Mic, Sparkles, FileText, Wallet, Check, MessageCircle, MoreVertical,
  Image, Flag, Link, Upload, PlusCircle, BookOpen, ClipboardList, Star,
} from 'lucide-react'

type IconProps = { size?: number; color?: string; strokeWidth?: number }
const MAP: Record<string, React.FC<IconProps>> = {
  back:       p => <ChevronLeft   size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  fwd:        p => <ChevronRight  size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  bell:       p => <Bell          size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  search:     p => <Search        size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  filter:     p => <Filter        size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  send:       p => <Send          size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  chart:      p => <BarChart2     size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  match:      p => <Zap           size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  'trend-up': p => <TrendingUp    size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  alert:      p => <AlertTriangle size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  check:      p => <Check         size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  shield:     p => <Shield        size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  money:      p => <Banknote      size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  settings:   p => <Settings      size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  logout:     p => <LogOut        size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  shop:       p => <Store         size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  calendar:   p => <Calendar      size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  user:       p => <User          size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  lock:       p => <Lock          size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  close:      p => <X             size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  mic:        p => <Mic           size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  sparkle:    p => <Sparkles      size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  doc:        p => <FileText      size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  wallet:     p => <Wallet         size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  chat:       p => <MessageCircle  size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  more:       p => <MoreVertical    size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  photo:      p => <Image           size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  flag:       p => <Flag            size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  link:       p => <Link            size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  upload:     p => <Upload          size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  plus:       p => <PlusCircle      size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  book:       p => <BookOpen        size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  clipboard:  p => <ClipboardList   size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
  star:       p => <Star             size={p.size??20} color={p.color??'var(--ink)'} strokeWidth={p.strokeWidth??2} />,
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
