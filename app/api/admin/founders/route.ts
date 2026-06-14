import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/emails'

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

  if (status === 'active') {
    try { await sendWelcomeEmail(data) } catch (e) { console.error('Email error:', e) }
  }

  return NextResponse.json(data)
}
