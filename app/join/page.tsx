import { supabaseAdmin } from '@/lib/supabase'
import JoinForm from './JoinForm'

export const dynamic = 'force-dynamic'

export default async function JoinPage() {
  const { data: topics, error } = await supabaseAdmin
    .from('topics')
    .select('id, name')
    .order('display_order')

  if (error) {
    return <div style={{padding: 40, fontFamily: 'monospace'}}>
      <h1>Debug: Topics failed to load</h1>
      <pre>{JSON.stringify(error, null, 2)}</pre>
      <p>SUPABASE_URL set: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'yes' : 'NO'}</p>
      <p>SERVICE_KEY set: {process.env.SUPABASE_SERVICE_KEY ? 'yes (' + process.env.SUPABASE_SERVICE_KEY.slice(0,10) + '...)' : 'NO'}</p>
    </div>
  }

  return <JoinForm topics={topics ?? []} />
}
