import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendApplicationConfirmation, sendAdminNotification } from '@/lib/emails'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    email, arr_bucket, business_model, customer_type, vertical,
    geography, company_description, open_to_share, first_name,
    additional_notes, topics, password,
  } = body

  if (!email || !first_name || !arr_bucket || !business_model || !customer_type || !geography || !company_description) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  if (!topics || topics.length === 0) {
    return NextResponse.json({ error: 'Select at least one topic.' }, { status: 400 })
  }

  const password_hash = await hashPassword(password)

  const { data: founder, error: founderErr } = await supabaseAdmin
    .from('founders')
    .insert({
      email,
      arr_bucket,
      business_model,
      customer_type,
      vertical: vertical || null,
      geography,
      company_description,
      open_to_share: open_to_share || null,
      first_name,
      additional_notes: additional_notes || null,
      password_hash,
      status: 'pending',
    })
    .select()
    .single()

  if (founderErr) {
    if (founderErr.code === '23505') {
      return NextResponse.json({ error: 'A profile with this email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: founderErr.message }, { status: 500 })
  }

  await supabaseAdmin.from('founder_topics').insert(
    topics.map((t: { id: string; direction: string }) => ({
      founder_id: founder.id,
      topic_id: t.id,
      direction: t.direction,
    }))
  )

  const { data: topicData } = await supabaseAdmin
    .from('topics')
    .select('id, name')
    .in('id', topics.map((t: { id: string }) => t.id))

  const topicsWithDirection = topics.map((t: { id: string; direction: string }) => ({
    name: topicData?.find(td => td.id === t.id)?.name ?? t.id,
    direction: t.direction,
  }))

  const emailErrors: string[] = []
  try {
    await sendApplicationConfirmation(founder)
  } catch (e: any) {
    console.error('Welcome email error:', e)
    emailErrors.push(`welcome: ${e?.message ?? 'unknown'}`)
  }
  try {
    await sendAdminNotification(founder, topicsWithDirection)
  } catch (e: any) {
    console.error('Admin notification error:', e)
    emailErrors.push(`admin: ${e?.message ?? 'unknown'}`)
  }

  return NextResponse.json({ ok: true, emailError: emailErrors.length > 0 ? emailErrors.join('; ') : null })
}
