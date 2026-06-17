import { supabaseAdmin } from '@/lib/supabase'
import JoinForm from './JoinForm'

export const dynamic = 'force-dynamic'

export default async function JoinPage() {
  const { data: topics } = await supabaseAdmin
    .from('topics')
    .select('id, name')
    .order('display_order')

  return <JoinForm topics={topics ?? []} />
}
