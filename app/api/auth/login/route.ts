import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const { data: founder } = await supabaseAdmin
    .from('founders')
    .select('id, password_hash, status')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!founder || !founder.password_hash) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  const valid = await verifyPassword(password, founder.password_hash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  const token = await createSession(founder.id)
  setSessionCookie(token)

  return NextResponse.json({ ok: true })
}
