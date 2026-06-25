import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendMatchEmail } from '@/lib/emails'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-token') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { founderAId, founderBId, topicIds } = await req.json()
  const primaryTopicId = Array.isArray(topicIds) ? topicIds[0] : topicIds

  const { data: participants } = await supabaseAdmin
    .from('founders')
    .select('id, status')
    .in('id', [founderAId, founderBId])

  const paused = participants?.filter(p => p.status === 'paused')
  if (paused && paused.length > 0) {
    return NextResponse.json({ error: 'Cannot create match: one or more participants are paused.' }, { status: 400 })
  }

  // Create match record (uses primary topic)
  const { data: match, error: matchErr } = await supabaseAdmin
    .from('matches')
    .insert({ founder_a_id: founderAId, founder_b_id: founderBId, topic_id: primaryTopicId })
    .select()
    .single()

  if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 })

  // Fetch founders and all matching topics
  const allTopicIds = Array.isArray(topicIds) ? topicIds : [topicIds]
  const [{ data: founderA }, { data: founderB }, { data: topics }] = await Promise.all([
    supabaseAdmin.from('founders').select('*').eq('id', founderAId).single(),
    supabaseAdmin.from('founders').select('*').eq('id', founderBId).single(),
    supabaseAdmin.from('topics').select('*').in('id', allTopicIds),
  ])

  if (!founderA || !founderB || !topics?.length) {
    return NextResponse.json({ error: 'Could not load founder or topic data' }, { status: 500 })
  }

  try {
    await Promise.all([
      sendMatchEmail(founderA, founderB, topics, match.founder_a_token),
      sendMatchEmail(founderB, founderA, topics, match.founder_b_token),
    ])
  } catch (e) {
    console.error('Email error:', e)
    return NextResponse.json({ error: 'Match created but emails failed' }, { status: 500 })
  }

  return NextResponse.json(match)
}
