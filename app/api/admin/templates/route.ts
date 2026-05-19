import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_KEY = process.env.ADMIN_SECRET || 'MonieMatchAdmin/2001'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function auth(req: NextRequest) {
  return req.headers.get('x-admin-key') === ADMIN_KEY
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const db = getAdmin()
  if (body.id) {
    // Update
    const { error } = await db.from('contract_templates').update({
      name: body.name, category: body.category, body_html: body.body_html,
      placeholders: body.placeholders, is_active: body.is_active,
      updated_at: new Date().toISOString(),
    }).eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } else {
    // Insert
    const { error } = await db.from('contract_templates').insert({
      name: body.name, category: body.category, body_html: body.body_html,
      placeholders: body.placeholders, is_active: body.is_active ?? true,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const { error } = await getAdmin().from('contract_templates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, is_active } = await req.json()
  const { error } = await getAdmin().from('contract_templates')
    .update({ is_active, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
