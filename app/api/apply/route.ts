import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendApplicationConfirmation, sendAdminNotification } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    email, arr_bucket, business_model, customer_type, vertical,
    geography, company_description, open_to_share, first_name,
    additional_notes, topics,
  } = body

  if (!email || !arr_bucket || !business_model || !customer_type || !geography || !company_description) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (!topics || topics.length === 0) {
    return NextResponse.json({ error: 'Select at least one topic.' }, { status: 400 })
  }

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
      first_name: first_name || null,
      additional_notes: additional_notes || null,
      status: 'pending',
    })
    .select()
    .single()

  if (founderErr) {
    if (founderErr.code === '23505') {
      return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: founderErr.message }, { status: 500 })
  }

  // Insert founder_topics
  await supabaseAdmin.from('founder_topics').insert(
    topics.map((t: { id: string; direction: string }) => ({
      founder_id: founder.id,
      topic_id: t.id,
      direction: t.direction,
    }))
  )

  // Fetch topic names for admin email
  const { data: topicData } = await supabaseAdmin
    .from('topics')
    .select('id, name')
    .in('id', topics.map((t: { id: string }) => t.id))

  const topicsWithDirection = topics.map((t: { id: string; direction: string }) => ({
    name: topicData?.find(td => td.id === t.id)?.name ?? t.id,
    direction: t.direction,
  }))

  // Fire emails (don't block on failure)
  try {
    await sendApplicationConfirmation(founder)
    await sendAdminNotification(founder, topicsWithDirection)
  } catch (e) {
    console.error('Email error:', e)
  }

  return NextResponse.json({ ok: true })
}
