import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { data: founder } = await supabaseAdmin
    .from('founders')
    .select('id, reset_token_expires')
    .eq('reset_token', token)
    .single()

  if (!founder) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 })
  }

  if (!founder.reset_token_expires || new Date(founder.reset_token_expires) < new Date()) {
    return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })
  }

  const password_hash = await hashPassword(password)

  await supabaseAdmin
    .from('founders')
    .update({ password_hash, reset_token: null, reset_token_expires: null })
    .eq('id', founder.id)

  return NextResponse.json({ ok: true })
}
