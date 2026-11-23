import { supabaseAdmin } from '@/lib/supabase'
import JoinForm from './JoinForm'

export const dynamic = 'force-dynamic'

export default async function JoinPage() {
  let topics: Array<{ id: string; name: string }> = []
  let loadError = false

  try {
    const { data, error } = await supabaseAdmin
      .from('topics')
      .select('id, name')
      .order('display_order')

    if (error) {
      console.error('[join] Failed to load topics:', error.message)
      loadError = true
    } else if (!data || data.length === 0) {
      console.error('[join] Topics table returned no rows')
      loadError = true
    } else {
      topics = data
    }
  } catch (err) {
    console.error('[join] Failed to load topics:', err)
    loadError = true
  }

  return <JoinForm topics={topics} loadError={loadError} />
}
