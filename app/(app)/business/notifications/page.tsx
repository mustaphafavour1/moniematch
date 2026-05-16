'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { relTime } from '@/lib/utils'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

interface Notif {
  id: string
  type: 'message' | 'offer' | 'match' | 'report_due'
  title: string
  body: string
  href: string
  created_at: string
}

function typeIcon(type: Notif['type']) {
  if (type === 'message')   return 'chat'
  if (type === 'offer')     return 'money'
  if (type === 'match')     return 'star'
  return 'clipboard'
}

function typeColor(type: Notif['type']) {
  if (type === 'message')   return 'var(--ink)'
  if (type === 'offer')     return 'var(--forest)'
  if (type === 'match')     return '#C97B2E'
  return 'var(--clay)'
}

export default function BusinessNotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const { data: biz } = await supabase
        .from('businesses').select('id, name').eq('owner_id', user.id).single()
      if (!biz) { setLoading(false); return }

      const list: Notif[] = []

      // All matches for this business
      const { data: matches } = await supabase
        .from('matches')
        .select('id, created_at, investors(users(name))')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false })
        .limit(20)

      const matchIds = (matches || []).map(m => m.id)

      if (matches) {
        for (const m of matches) {
          const inv = m.investors as Record<string, unknown> | null
          const invName = (inv?.users as Record<string, unknown> | null)?.name as string | undefined
          list.push({
            id: `match-${m.id}`,
            type: 'match',
            title: 'New investor match',
            body: `${invName || 'An investor'} matched with you`,
            href: `/business/investors`,
            created_at: m.created_at,
          })
        }
      }

      if (matchIds.length > 0) {
        // New messages from investors
        const { data: msgs } = await supabase
          .from('messages')
          .select('id, match_id, content, sender_id, created_at')
          .in('match_id', matchIds)
          .neq('sender_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30)

        if (msgs) {
          const seen = new Set<string>()
          for (const msg of msgs) {
            if (seen.has(msg.match_id)) continue
            seen.add(msg.match_id)
            list.push({
              id: `msg-${msg.id}`,
              type: 'message',
              title: 'New message',
              body: msg.content?.slice(0, 80) || 'Sent you a message',
              href: `/business/chat/${msg.match_id}`,
              created_at: msg.created_at,
            })
          }
        }

        // New offers from investors
        const { data: offers } = await supabase
          .from('offers')
          .select('id, match_id, amount, created_at')
          .in('match_id', matchIds)
          .order('created_at', { ascending: false })
          .limit(20)

        if (offers) {
          for (const o of offers) {
            list.push({
              id: `offer-${o.id}`,
              type: 'offer',
              title: 'New offer',
              body: `An investor offered ₦${Number(o.amount).toLocaleString()}`,
              href: `/business/chat/${o.match_id}`,
              created_at: o.created_at,
            })
          }
        }

        // Report-due: matches without a report in the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const { data: recentReports } = await supabase
          .from('business_reports')
          .select('match_id')
          .eq('business_id', biz.id)
          .gte('created_at', thirtyDaysAgo)

        const reportedMatchIds = new Set((recentReports || []).map(r => r.match_id))

        for (const matchId of matchIds) {
          if (!reportedMatchIds.has(matchId)) {
            list.push({
              id: `due-${matchId}`,
              type: 'report_due',
              title: 'Report due',
              body: 'Your investor is waiting for your monthly update',
              href: `/business/records/new-report?matchId=${matchId}`,
              created_at: new Date(Date.now() - 1000).toISOString(),
            })
          }
        }
      }

      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setNotifs(list)
      setLoading(false)
    })
  }, [])

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Notifications"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)', fontSize: 13 }}>Loading…</div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginBottom: 6 }}>All quiet</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>New matches, messages, and offers will appear here.</div>
          </div>
        ) : (
          <div>
            {notifs.map((n, i) => (
              <div key={n.id} onClick={() => router.push(n.href)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 16px',
                  borderBottom: i < notifs.length - 1 ? '1px solid var(--line)' : 'none',
                  cursor: 'pointer', background: 'var(--cream)',
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: 'var(--linen)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={typeIcon(n.type)} size={18} color={typeColor(n.type)} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}>{relTime(n.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
