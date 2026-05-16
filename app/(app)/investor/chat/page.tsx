'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyChats } from '@/lib/db'
import { relTime } from '@/lib/utils'
import type { ChatThread } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon } from '@/components/app/Icon'

export default function InvChatPage() {
  const router = useRouter()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getMyChats().then(t => { setThreads(t); setLoading(false) }) }, [])

  return (
    <div className="app-screen scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="eyebrow">Conversations</div>
        <div className="h1" style={{ fontSize: 36, marginTop: 6 }}>Messages</div>
      </div>

      <div className="pad col gap-10" style={{ marginTop: 16 }}>
        {loading
          ? [0, 1, 2].map(i => (
              <div key={i} style={{ height: 72, borderRadius: 16, background: 'var(--linen)' }} />
            ))
          : threads.length > 0
            ? threads.map((t, i) => (
                <div key={t.matchId} className="fadein" style={{ animationDelay: `${i * 40}ms` }}>
                  <ThreadRow thread={t} onClick={() => router.push(`/investor/chat/${t.matchId}`)} />
                </div>
              ))
            : (
              <div style={{ paddingTop: 60, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--linen)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon name="chat" size={28} color="var(--ink-3)" />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>
                  No messages yet
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                  When you connect with a business,<br />your conversation will appear here.
                </div>
                <button onClick={() => router.push('/investor/matches')}
                  className="btn btn-primary" style={{ marginTop: 20 }}>
                  Browse businesses
                </button>
              </div>
            )
        }
      </div>
    </div>
  )
}

function ThreadRow({ thread, onClick }: { thread: ChatThread; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: 'var(--bone)', borderRadius: 16, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      border: '1px solid var(--line)', cursor: 'pointer' }}>
      <Avatar name={thread.counterparty} initials={thread.counterpartyInitials}
        color={thread.counterpartyColor} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row between" style={{ marginBottom: 3 }}>
          <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink)' }}>{thread.counterparty}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0, marginLeft: 8 }}>
            {thread.lastMessageTime ? relTime(thread.lastMessageTime) : ''}
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {thread.isMine && <span style={{ color: 'var(--ink-4)' }}>You: </span>}
          {thread.lastMessage}
        </div>
      </div>
    </div>
  )
}
