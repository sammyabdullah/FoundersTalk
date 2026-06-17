import { supabaseAdmin } from './supabase'
import { Founder, Match } from './types'

interface FounderWithTopics extends Founder {
  founder_topics: Array<{ topic_id: string; direction: string }>
}

export interface ProposedMatch {
  founderA: Founder
  founderB: Founder
  topicIds: string[]
  topicNames: string[]
}

export async function runMatching(): Promise<ProposedMatch[]> {
  const { data: founders, error: fErr } = await supabaseAdmin
    .from('founders')
    .select('*, founder_topics(topic_id, direction)')
    .eq('status', 'active')

  if (fErr) throw fErr

  const { data: existingMatches, error: mErr } = await supabaseAdmin
    .from('matches')
    .select('founder_a_id, founder_b_id')

  if (mErr) throw mErr

  const alreadyMatched = new Set(
    existingMatches?.flatMap(m => [`${m.founder_a_id}:${m.founder_b_id}`, `${m.founder_b_id}:${m.founder_a_id}`]) ?? []
  )

  const { data: topics } = await supabaseAdmin.from('topics').select('id, name')
  const topicMap = new Map(topics?.map(t => [t.id, t.name]) ?? [])

  const pairMap = new Map<string, ProposedMatch>()
  const founderList = (founders ?? []) as FounderWithTopics[]

  for (let i = 0; i < founderList.length; i++) {
    for (let j = i + 1; j < founderList.length; j++) {
      const a = founderList[i]
      const b = founderList[j]

      if (alreadyMatched.has(`${a.id}:${b.id}`)) continue

      const aTopics = new Map(a.founder_topics.map(t => [t.topic_id, t.direction]))
      const bTopics = new Map(b.founder_topics.map(t => [t.topic_id, t.direction]))

      const pairKey = [a.id, b.id].sort().join(':')

      for (const [topicId, aDir] of Array.from(aTopics)) {
        const bDir = bTopics.get(topicId)
        if (!bDir) continue

        const validPair =
          (aDir === 'been_through_this' && bDir === 'figuring_this_out') ||
          (aDir === 'figuring_this_out' && bDir === 'been_through_this')

        if (!validPair) continue

        if (!pairMap.has(pairKey)) {
          pairMap.set(pairKey, { founderA: a, founderB: b, topicIds: [], topicNames: [] })
        }
        const match = pairMap.get(pairKey)!
        match.topicIds.push(topicId)
        match.topicNames.push(topicMap.get(topicId) ?? topicId)
      }
    }
  }

  return Array.from(pairMap.values())
}

export async function createMatch(founderAId: string, founderBId: string, topicId: string) {
  const { data, error } = await supabaseAdmin
    .from('matches')
    .insert({ founder_a_id: founderAId, founder_b_id: founderBId, topic_id: topicId })
    .select()
    .single()

  if (error) throw error
  return data as Match
}
