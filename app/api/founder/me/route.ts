import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { cancelPendingMatches } from '@/lib/pause'

export async function GET() {
  const founderId = await getSession()
  if (!founderId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: founder } = await supabaseAdmin
    .from('founders')
    .select('id, email, first_name, company_description, arr_bucket, business_model, customer_type, vertical, geography, open_to_share, additional_notes, status, created_at')
    .eq('id', founderId)
    .single()

  if (!founder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (founder.status === 'paused') return NextResponse.json({ error: 'Account paused' }, { status: 403 })

  const { data: topics } = await supabaseAdmin
    .from('founder_topics')
    .select('*, topics(id, name)')
    .eq('founder_id', founderId)

  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select('*, founders_a:founder_a_id(id, first_name, email, company_description, arr_bucket), founders_b:founder_b_id(id, first_name, email, company_description, arr_bucket), topics(name)')
    .or(`founder_a_id.eq.${founderId},founder_b_id.eq.${founderId}`)
    .order('matched_at', { ascending: false })

  // Compute all shared complementary topics for each match
  const enrichedMatches = await Promise.all((matches ?? []).map(async (m: any) => {
    const otherId = m.founder_a_id === founderId ? m.founder_b_id : m.founder_a_id
    const [{ data: myTopics }, { data: theirTopics }] = await Promise.all([
      supabaseAdmin.from('founder_topics').select('topic_id, direction').eq('founder_id', founderId),
      supabaseAdmin.from('founder_topics').select('topic_id, direction').eq('founder_id', otherId),
    ])
    const theirMap = new Map((theirTopics ?? []).map((t: any) => [t.topic_id, t.direction]))
    const sharedTopicIds = (myTopics ?? [])
      .filter((t: any) => {
        const td = theirMap.get(t.topic_id)
        return td && td !== t.direction
      })
      .map((t: any) => t.topic_id)

    let sharedTopicNames: string[] = []
    if (sharedTopicIds.length > 0) {
      const { data: topicRows } = await supabaseAdmin.from('topics').select('name').in('id', sharedTopicIds)
      sharedTopicNames = (topicRows ?? []).map((t: any) => t.name)
    }
    return { ...m, sharedTopicNames }
  }))

  return NextResponse.json({ founder, topics, matches: enrichedMatches })
}

export async function PATCH(req: NextRequest) {
  const founderId = await getSession()
  if (!founderId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = ['first_name', 'company_description', 'arr_bucket', 'business_model', 'customer_type', 'vertical', 'geography', 'open_to_share', 'additional_notes', 'status']
  const updates: Record<string, string> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const { data, error } = await supabaseAdmin
    .from('founders')
    .update(updates)
    .eq('id', founderId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (updates.status === 'paused') {
    await cancelPendingMatches(founderId)
  }

  // Update topics if provided
  if (body.topics) {
    await supabaseAdmin.from('founder_topics').delete().eq('founder_id', founderId)
    if (body.topics.length > 0) {
      await supabaseAdmin.from('founder_topics').insert(
        body.topics.map((t: { id: string; direction: string }) => ({
          founder_id: founderId,
          topic_id: t.id,
          direction: t.direction,
        }))
      )
    }
  }

  return NextResponse.json(data)
}
