import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cancelPendingMatches } from '@/lib/pause'

function checkAuth(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = req.nextUrl.searchParams.get('status')
  let query = supabaseAdmin.from('founders').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  const { data, error } = await supabaseAdmin
    .from('founders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'paused') {
    await cancelPendingMatches(id)
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  await supabaseAdmin.from('founder_topics').delete().eq('founder_id', id)
  const { error } = await supabaseAdmin.from('founders').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
