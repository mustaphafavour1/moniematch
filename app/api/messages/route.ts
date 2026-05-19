import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { match_id, sender_id, content, content_type, ref_id } = body
    if (!match_id || !sender_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const db = getAdmin()
    const row: Record<string, unknown> = {
      id: crypto.randomUUID(),
      match_id, sender_id, content,
    }
    if (content_type) row.content_type = content_type
    if (ref_id) row.ref_id = ref_id
    const { error } = await db.from('messages').insert(row)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
