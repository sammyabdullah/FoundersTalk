import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendIntroEmail } from '@/lib/emails'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params

  const { data: match, error } = await supabaseAdmin
    .from('matches')
    .select('*, founders_a:founder_a_id(*), founders_b:founder_b_id(*), topics(*)')
    .or(`founder_a_token.eq.${token},founder_b_token.eq.${token}`)
    .single()

  if (error || !match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

  if (match.founders_a.status === 'paused' || match.founders_b.status === 'paused') {
    return NextResponse.json({ error: 'This match is no longer available.' }, { status: 403 })
  }

  const isA = match.founder_a_token === token
  const me = isA ? match.founders_a : match.founders_b
  const other = isA ? match.founders_b : match.founders_a

  // Get other founder's direction on the matched topic
  const { data: otherTopicRow } = await supabaseAdmin
    .from('founder_topics')
    .select('direction')
    .eq('founder_id', other.id)
    .eq('topic_id', match.topic_id)
    .single()

  return NextResponse.json({
    match: {
      id: match.id,
      status: match.status,
      expires_at: match.expires_at,
      topic: match.topics,
    },
    me: { email: me.email },
    other: {
      ...other,
      direction: otherTopicRow?.direction,
    },
    isA,
  })
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params
  const { accept } = await req.json()

  const { data: match, error } = await supabaseAdmin
    .from('matches')
    .select('*, founders_a:founder_a_id(*), founders_b:founder_b_id(*), topics(*)')
    .or(`founder_a_token.eq.${token},founder_b_token.eq.${token}`)
    .single()

  if (error || !match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

  if (new Date(match.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This match has expired.' }, { status: 410 })
  }

  if (match.founders_a.status === 'paused' || match.founders_b.status === 'paused') {
    return NextResponse.json({ error: 'This match is no longer available.' }, { status: 403 })
  }

  const isA = match.founder_a_token === token

  const updateField = isA ? 'founder_a_response' : 'founder_b_response'
  const otherResponse = isA ? match.founder_b_response : match.founder_a_response

  let newStatus = match.status
  if (!accept) {
    newStatus = 'declined'
  } else if (otherResponse === true) {
    newStatus = 'both_accepted'
  } else {
    newStatus = isA ? 'founder_a_accepted' : 'founder_b_accepted'
  }

  await supabaseAdmin
    .from('matches')
    .update({ [updateField]: accept, status: newStatus })
    .eq('id', match.id)

  if (newStatus === 'both_accepted') {
    try {
      await supabaseAdmin.from('matches').update({ intro_sent_at: new Date().toISOString() }).eq('id', match.id)
      await sendIntroEmail(match.founders_a, match.founders_b, match.topics)
    } catch (e) {
      console.error('Intro email error:', e)
    }
  }

  return NextResponse.json({ ok: true, status: newStatus })
}
