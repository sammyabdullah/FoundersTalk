import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 })

  const { data: founder } = await supabaseAdmin
    .from('founders')
    .select('id, email, first_name')
    .eq('email', email.toLowerCase().trim())
    .single()

  // Always return ok to avoid email enumeration
  if (!founder) return NextResponse.json({ ok: true })

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1 hour

  await supabaseAdmin
    .from('founders')
    .update({ reset_token: token, reset_token_expires: expires })
    .eq('id', founder.id)

  try {
    await sendPasswordResetEmail(founder, token)
  } catch (e) {
    console.error('Reset email error:', e)
  }

  return NextResponse.json({ ok: true })
}
