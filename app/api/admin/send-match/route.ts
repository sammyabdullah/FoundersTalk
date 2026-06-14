import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendMatchEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-token') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { founderAId, founderBId, topicId } = await req.json()

  // Create match record
  const { data: match, error: matchErr } = await supabaseAdmin
    .from('matches')
    .insert({ founder_a_id: founderAId, founder_b_id: founderBId, topic_id: topicId })
    .select()
    .single()

  if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 })

  // Fetch founders and topic
  const [{ data: founderA }, { data: founderB }, { data: topic }] = await Promise.all([
    supabaseAdmin.from('founders').select('*').eq('id', founderAId).single(),
    supabaseAdmin.from('founders').select('*').eq('id', founderBId).single(),
    supabaseAdmin.from('topics').select('*').eq('id', topicId).single(),
  ])

  if (!founderA || !founderB || !topic) {
    return NextResponse.json({ error: 'Could not load founder or topic data' }, { status: 500 })
  }

  // Get directions for context
  const [{ data: aTopicRow }, { data: bTopicRow }] = await Promise.all([
    supabaseAdmin.from('founder_topics').select('direction').eq('founder_id', founderAId).eq('topic_id', topicId).single(),
    supabaseAdmin.from('founder_topics').select('direction').eq('founder_id', founderBId).eq('topic_id', topicId).single(),
  ])

  try {
    await Promise.all([
      sendMatchEmail(founderA, founderB, topic, bTopicRow?.direction ?? 'figuring_this_out', match.founder_a_token),
      sendMatchEmail(founderB, founderA, topic, aTopicRow?.direction ?? 'figuring_this_out', match.founder_b_token),
    ])
  } catch (e) {
    console.error('Email error:', e)
    return NextResponse.json({ error: 'Match created but emails failed' }, { status: 500 })
  }

  return NextResponse.json(match)
}
