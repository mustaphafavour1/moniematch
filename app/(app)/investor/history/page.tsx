'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyPortfolio } from '@/lib/db'
import { fmtNaira } from '@/lib/utils'
import type { Deal } from '@/lib/types'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { Progress } from '@/components/app/Progress'
import { Avatar } from '@/components/app/Avatar'

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',     color: 'var(--forest)', bg: 'var(--forest-tint)' },
  signed:    { label: 'Signed',     color: 'var(--forest)', bg: 'var(--forest-tint)' },
  proposed:  { label: 'Proposed',   color: '#8B5E1A',       bg: 'var(--sun-tint)'    },
  completed: { label: 'Completed',  color: 'var(--ink-3)',  bg: 'rgba(31,26,20,0.06)' },
  defaulted: { label: 'Defaulted',  color: 'var(--clay)',   bg: 'var(--clay-tint)'   },
}

export default function InvHistoryPage() {
  const router = useRouter()
  const [deals,   setDeals]   = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getMyPortfolio().then(d => { setDeals(d); setLoading(false) }) }, [])

  const total         = deals.reduce((s, d) => s + (d.invested || d.amount || 0), 0)
  const activeCount   = deals.filter(d => d.status === 'active' || d.status === 'signed').length
  const completedCount = deals.filter(d => d.status === 'completed').length

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Deal history"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>} sticky />
      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8, paddingBottom: 32 }}>

          {loading ? (
            <div className="col gap-12" style={{ marginTop: 12 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ height: 100, borderRadius: 18, background: 'var(--linen)' }} />)}
            </div>
          ) : deals.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 72 }}>
              <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--linen)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Icon name="calendar" size={32} color="var(--ink-3)" />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>
                No deals yet
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
                When you've backed a business, your deal history will appear here.
              </div>
              <button onClick={() => router.push('/investor/matches')}
                className="btn btn-primary" style={{ marginTop: 24 }}>
                Browse businesses
              </button>
            </div>
          ) : (
            <>
              {/* Summary banner */}
              <div style={{ background: 'linear-gradient(135deg, var(--clay) 0%, #A04527 100%)',
                borderRadius: 18, padding: '18px 18px', marginBottom: 20, color: '#fff' }}>
                <p style={{ fontSize: 11.5, opacity: 0.75, margin: '0 0 4px', letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>
                  Total invested
                </p>
                <p style={{ fontSize: 28, fontFamily: 'var(--font-display)', margin: '0 0 14px' }}>
                  {fmtNaira(total)}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Deals',     val: deals.length },
                    { label: 'Active',    val: activeCount  },
                    { label: 'Completed', val: completedCount },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 10, padding: '9px 10px', textAlign: 'center' }}>
                      <p style={{ fontSize: 18, fontFamily: 'var(--font-display)', margin: '0 0 2px' }}>{val}</p>
                      <p style={{ fontSize: 10.5, opacity: 0.75, margin: 0, fontWeight: 500 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="eyebrow">All deals</div>
              <div className="col gap-10" style={{ marginTop: 12 }}>
                {deals.map(d => {
                  const sc = STATUS_CFG[d.status] || STATUS_CFG.active
                  const pct = d.monthsTotal ? Math.round(((d.monthsIn || 0) / d.monthsTotal) * 100) : 0
                  const bizName = d.biz?.business || 'Business'
                  const color   = d.biz?.color || 'var(--clay)'
                  const initials = d.biz?.initials || bizName.slice(0, 2).toUpperCase()
                  return (
                    <div key={d.dealId} className="card" style={{ padding: '14px 16px' }}>
                      <div className="row gap-12" style={{ marginBottom: 12 }}>
                        <Avatar name={bizName} initials={initials} color={color} size={44} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 0 2px' }}>{bizName}</p>
                          <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>
                            {d.biz?.category || ''}{d.biz?.category ? ' · ' : ''}{d.structure || 'Revenue share'}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--ink)', margin: '0 0 4px' }}>
                            {fmtNaira(d.invested || d.amount || 0, { compact: true })}
                          </p>
                          <div style={{ background: sc.bg, color: sc.color, fontSize: 10.5, fontWeight: 600,
                            padding: '3px 8px', borderRadius: 999, display: 'inline-block' }}>
                            {sc.label}
                          </div>
                        </div>
                      </div>
                      <div className="row between" style={{ marginBottom: 5 }}>
                        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{d.returnType || 'Revenue share'}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                          {d.monthsIn || 0} / {d.monthsTotal || 12} months
                        </span>
                      </div>
                      <Progress value={pct} color={d.status === 'completed' ? 'var(--forest)' : 'var(--clay)'} height={5} />
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
