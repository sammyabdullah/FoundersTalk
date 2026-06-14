import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get('x-admin-token')
  if (token !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('founder_topics')
    .select('*, topics(id, name)')
    .eq('founder_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
