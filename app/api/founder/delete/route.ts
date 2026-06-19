import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession, clearSessionCookie } from '@/lib/auth'

export async function DELETE() {
  const founderId = await getSession()
  if (!founderId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabaseAdmin.from('founder_topics').delete().eq('founder_id', founderId)

  const { error } = await supabaseAdmin
    .from('founders')
    .delete()
    .eq('id', founderId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  clearSessionCookie()
  return NextResponse.json({ ok: true })
}
