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

export default function BizChatConvPage() {
  const router  = useRouter()
  const params  = useParams()
  const matchId = params.matchId as string

  const [msgs,    setMsgs]    = useState<ChatMessage[]>([])
  const [myId,    setMyId]    = useState('')
  const [name,    setName]    = useState('')
  const [draft,   setDraft]   = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      getChatMessages(matchId),
      getMatchCounterpartyName(matchId, 'business_owner'),
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
      .channel(`chat-biz-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload: { new: Record<string, unknown> }) => {
        setMsgs((prev: ChatMessage[]) => [...prev, payload.new as ChatMessage])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const handleSend = async () => {
    if (!draft.trim() || sending) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    try { await sendMessage(matchId, text) } finally { setSending(false) }
  }

  const color    = colorFor(name)
  const initials = initialsFor(name)

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title={name || '…'}
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '12px 16px 8px' }}>
        {loading
          ? <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--ink-3)', fontSize: 13 }}>Loading…</div>
          : msgs.length === 0
            ? (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginBottom: 6 }}>
                  Start the conversation
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Send a message to {name}.</div>
              </div>
            )
            : (
              <div className="col gap-6">
                {msgs.map(m => {
                  const isMine = m.sender_id === myId
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                      {!isMine && (
                        <Avatar name={name} initials={initials} color={color} size={28} />
                      )}
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMine ? 'var(--forest)' : 'var(--bone)',
                          color: isMine ? '#fff' : 'var(--ink)',
                          fontSize: 14, lineHeight: 1.45,
                          border: isMine ? 'none' : '1px solid var(--line)',
                        }}>
                          {m.content}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 3,
                          textAlign: isMine ? 'right' : 'left' }}>
                          {relTime(m.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
            )
        }
      </div>

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
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          style={{ width: 42, height: 42, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: draft.trim() ? 'var(--forest)' : 'var(--linen)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 200ms', flexShrink: 0 }}>
          <Icon name="fwd" size={18} color={draft.trim() ? '#fff' : 'var(--ink-4)'} />
        </button>
      </div>
    </div>
  )
}
