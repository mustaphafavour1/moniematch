'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getChatMessages, sendMessage, getMatchCounterpartyName } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { relTime, colorFor, initialsFor } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function InvChatConvPage() {
  const router  = useRouter()
  const params  = useParams()
  const matchId = params.matchId as string

  const [msgs,       setMsgs]       = useState<ChatMessage[]>([])
  const [myId,       setMyId]       = useState('')
  const [name,       setName]       = useState('')
  const [draft,      setDraft]      = useState('')
  const [sending,    setSending]    = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchDraft, setSearchDraft] = useState('')
  const [searchQ,     setSearchQ]     = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const menuRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      getChatMessages(matchId),
      getMatchCounterpartyName(matchId, 'investor'),
      supabase.auth.getUser(),
    ]).then(([messages, cname, { data: { user } }]) => {
      setMsgs(messages)
      setName(cname)
      setMyId(user?.id || '')
      setLoading(false)
    })
  }, [matchId])

  useEffect(() => {
    const ch = supabase
      .channel(`chat-inv-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload: { new: Record<string, unknown> }) => {
        setMsgs(prev => [...prev, payload.new as unknown as ChatMessage])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [matchId])

  // Scroll to bottom of the container (not window) — fixes desktop cut-off
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [msgs])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  const handleSend = async () => {
    if (!draft.trim() || sending) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    try { await sendMessage(matchId, text) } finally { setSending(false) }
  }

  const color    = colorFor(name)
  const initials = initialsFor(name)

  const visibleMsgs = searchQ.trim()
    ? msgs.filter(m => m.content.toLowerCase().includes(searchQ.toLowerCase()))
    : msgs

  const menuItems = [
    { icon: 'search', label: 'Search conversation', action: () => { setMenuOpen(false); setSearchOpen(true) } },
    { icon: 'doc',    label: 'View uploaded media',  action: () => { setMenuOpen(false); router.push(`/investor/chat/${matchId}/media`) } },
    { icon: 'money',  label: 'Make offer',            action: () => { setMenuOpen(false); router.push(`/investor/chat/${matchId}/offer`) } },
    { icon: 'flag',   label: 'Report an issue',       action: () => { setMenuOpen(false); router.push(`/investor/chat/${matchId}/report`) } },
  ]

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title={name || '…'}
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        trailing={
          <div ref={menuRef} style={{ position: 'relative' }}>
            <RoundBtn onClick={() => setMenuOpen(v => !v)}>
              <Icon name="more" size={18} />
            </RoundBtn>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 200,
                background: 'var(--cream)', border: '1px solid var(--line)',
                borderRadius: 14, boxShadow: 'var(--shadow-md)',
                minWidth: 210, overflow: 'hidden',
              }}>
                {menuItems.map((item, i) => (
                  <div key={item.label} onClick={item.action}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
                      cursor: 'pointer', borderBottom: i < menuItems.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <Icon name={item.icon} size={16} color="var(--ink-2)" />
                    <span style={{ fontSize: 14, color: 'var(--ink)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
        sticky
      />

      {/* Search bar — X on left, search icon (brand colour) on right */}
      {searchOpen && (
        <div style={{ padding: '8px 12px', background: 'var(--bone)', borderBottom: '1px solid var(--line)',
          display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, background: 'var(--cream)', border: '1px solid var(--line-strong)',
            borderRadius: 20, padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {searchDraft && (
              <button onClick={() => { setSearchDraft(''); setSearchQ('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Icon name="close" size={14} color="var(--ink-3)" />
              </button>
            )}
            <input autoFocus value={searchDraft} onChange={e => setSearchDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearchQ(searchDraft) }}
              placeholder="Search messages…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }} />
            <button onClick={() => setSearchQ(searchDraft)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Icon name="search" size={14} color="var(--ink)" />
            </button>
          </div>
          <button onClick={() => { setSearchOpen(false); setSearchDraft(''); setSearchQ('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-body)' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Messages area — ref on this div so scrollTop works, not window.scroll */}
      <div ref={scrollRef} className="scroll" style={{ flex: 1, padding: '12px 16px 8px' }}>
        {loading
          ? <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--ink-3)', fontSize: 13 }}>Loading…</div>
          : visibleMsgs.length === 0
            ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginBottom: 6 }}>
                  {searchQ ? 'No matching messages' : 'Start the conversation'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                  {searchQ ? 'Try a different search term.' : `Send a message to ${name}.`}
                </div>
              </div>
            )
            : (
              <div className="col gap-6">
                {visibleMsgs.map(m => {
                  const isMine    = m.sender_id === myId
                  const highlight = searchQ && m.content.toLowerCase().includes(searchQ.toLowerCase())
                  const isSpecial = m.content_type === 'report' || m.content_type === 'offer'
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                      {!isMine && <Avatar name={name} initials={initials} color={color} size={28} />}
                      <div style={{ maxWidth: '72%' }}>
                        {isSpecial ? (
                          <SpecialBubble msg={m} isMine={isMine} matchId={matchId} role="investor" />
                        ) : (
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: highlight ? '#fff3cd' : isMine ? 'var(--ink)' : 'var(--bone)',
                            color: highlight ? 'var(--ink)' : isMine ? 'var(--cream)' : 'var(--ink)',
                            fontSize: 14, lineHeight: 1.45,
                            border: isMine && !highlight ? 'none' : '1px solid var(--line)',
                          }}>
                            {m.content}
                          </div>
                        )}
                        <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 3,
                          textAlign: isMine ? 'right' : 'left' }}>
                          {relTime(m.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
        }
      </div>

      {/* Input bar — font-size 16px prevents iOS auto-zoom */}
      <div style={{ padding: '10px 14px 16px', background: 'var(--cream)',
        borderTop: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, background: 'var(--bone)', border: '1px solid var(--line-strong)',
          borderRadius: 20, padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Message…"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--ink)' }}
          />
        </div>
        <button onClick={handleSend} disabled={!draft.trim() || sending}
          style={{ width: 42, height: 42, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: draft.trim() ? 'var(--ink)' : 'var(--linen)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 200ms', flexShrink: 0 }}>
          <Icon name="fwd" size={18} color={draft.trim() ? 'var(--cream)' : 'var(--ink-4)'} />
        </button>
      </div>
    </div>
  )
}

function SpecialBubble({ msg, isMine, matchId, role }: {
  msg: ChatMessage; isMine: boolean; matchId: string; role: 'investor' | 'business'
}) {
  const router   = useRouter()
  const [sheet, setSheet] = useState<Record<string, unknown> | null>(null)
  const isReport = msg.content_type === 'report'
  const icon     = isReport ? '📋' : '💰'
  const label    = isReport ? 'Report' : 'Offer'
  const accent   = role === 'investor' ? 'var(--ink)' : 'var(--forest)'

  async function open() {
    if (!msg.ref_id) return
    if (!isReport) {
      router.push(`/investor/chat/${matchId}/offer-view?offerId=${msg.ref_id}`)
      return
    }
    const { data } = await supabase.from('business_reports').select('*').eq('id', msg.ref_id).maybeSingle()
    if (data) setSheet(data as Record<string, unknown>)
  }

  return (
    <>
      <button onClick={open} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isMine ? accent : 'var(--bone)',
        border: `1px solid ${isMine ? 'transparent' : 'var(--line)'}`,
        cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: isMine ? '#fff' : 'var(--ink)' }}>{label}</div>
          <div style={{ fontSize: 11, color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--ink-3)' }}>Tap to view</div>
        </div>
        <Icon name="fwd" size={13} color={isMine ? 'rgba(255,255,255,0.6)' : 'var(--ink-4)'} style={{ marginLeft: 'auto' }} />
      </button>

      {sheet ? (
        <>
          <div onClick={() => setSheet(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(31,26,20,0.45)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, zIndex: 101,
            background: 'var(--cream)', borderRadius: '20px 20px 0 0',
            padding: '0 0 env(safe-area-inset-bottom,32px)',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 -4px 32px rgba(31,26,20,0.16)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--line-strong)' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 24px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', marginBottom: 4 }}>
                {(sheet.title as string) || 'Report'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 16 }}>
                {new Date(sheet.created_at as string).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <pre style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
                {(sheet.content as string) || 'No content'}
              </pre>
              <button onClick={() => window.print()} style={{ marginTop: 20, background: 'none', border: '1px solid var(--line-strong)', borderRadius: 8, padding: '8px 16px', fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Print / Save PDF
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
