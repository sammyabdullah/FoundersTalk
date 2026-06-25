import { supabaseAdmin } from './supabase'

export async function cancelPendingMatches(founderId: string) {
  await supabaseAdmin
    .from('matches')
    .update({ status: 'declined' })
    .or(`founder_a_id.eq.${founderId},founder_b_id.eq.${founderId}`)
    .in('status', ['pending', 'founder_a_accepted', 'founder_b_accepted'])
}
