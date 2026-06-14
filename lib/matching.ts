import { supabaseAdmin } from './supabase'
import { ArrBucket, Founder, Match } from './types'

const ARR_ORDER: ArrBucket[] = ['pre_revenue', 'under_1m', 'one_to_5m', 'five_to_20m', 'over_20m']

function arrDistance(a: ArrBucket, b: ArrBucket): number {
  return Math.abs(ARR_ORDER.indexOf(a) - ARR_ORDER.indexOf(b))
}

interface FounderWithTopics extends Founder {
  founder_topics: Array<{ topic_id: string; direction: string }>
}

interface ProposedMatch {
  founderA: Founder
  founderB: Founder
  topicId: string
  topicName: string
  arrOverlap: boolean
  customerTypeOverlap: boolean
  verticalOverlap: boolean
  score: number
}

export async function runMatching(): Promise<ProposedMatch[]> {
  // Fetch all active founders with their topics
  const { data: founders, error: fErr } = await supabaseAdmin
    .from('founders')
    .select('*, founder_topics(topic_id, direction)')
    .eq('status', 'active')

  if (fErr) throw fErr

  // Fetch existing matches to avoid duplicates
  const { data: existingMatches, error: mErr } = await supabaseAdmin
    .from('matches')
    .select('founder_a_id, founder_b_id')

  if (mErr) throw mErr

  const alreadyMatched = new Set(
    existingMatches?.flatMap(m => [`${m.founder_a_id}:${m.founder_b_id}`, `${m.founder_b_id}:${m.founder_a_id}`]) ?? []
  )

  // Fetch topics for name lookup
  const { data: topics } = await supabaseAdmin.from('topics').select('id, name')
  const topicMap = new Map(topics?.map(t => [t.id, t.name]) ?? [])

  const proposed: ProposedMatch[] = []

  const founderList = (founders ?? []) as FounderWithTopics[]

  for (let i = 0; i < founderList.length; i++) {
    for (let j = i + 1; j < founderList.length; j++) {
      const a = founderList[i]
      const b = founderList[j]

      if (alreadyMatched.has(`${a.id}:${b.id}`)) continue

      // Find topic pairs where one has been_through_this and other has figuring_this_out
      const aTopics = new Map(a.founder_topics.map(t => [t.topic_id, t.direction]))
      const bTopics = new Map(b.founder_topics.map(t => [t.topic_id, t.direction]))

      for (const [topicId, aDir] of Array.from(aTopics)) {
        const bDir = bTopics.get(topicId)
        if (!bDir) continue

        const validPair =
          (aDir === 'been_through_this' && bDir === 'figuring_this_out') ||
          (aDir === 'figuring_this_out' && bDir === 'been_through_this')

        if (!validPair) continue

        const dist = arrDistance(a.arr_bucket, b.arr_bucket)
        const arrOverlap = dist <= 1
        const customerTypeOverlap = a.customer_type === b.customer_type
        const verticalOverlap = !!(a.vertical && b.vertical && a.vertical.toLowerCase() === b.vertical.toLowerCase())

        let score = 0
        if (dist === 0) score += 3
        else if (dist === 1) score += 1
        if (customerTypeOverlap) score += 2
        if (verticalOverlap) score += 2

        proposed.push({
          founderA: a,
          founderB: b,
          topicId,
          topicName: topicMap.get(topicId) ?? topicId,
          arrOverlap,
          customerTypeOverlap,
          verticalOverlap,
          score,
        })
      }
    }
  }

  // Sort by score descending, deduplicate founder pairs (keep best match)
  proposed.sort((a, b) => b.score - a.score)
  const seen = new Set<string>()
  return proposed.filter(p => {
    const key = [p.founderA.id, p.founderB.id].sort().join(':')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
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
