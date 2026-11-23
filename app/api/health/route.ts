import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Runs one cheap query against Supabase. Called daily by the Vercel cron in
// vercel.json so the free-tier project never looks inactive, and it returns a
// 503 when the database is unreachable so failures show up in Vercel's cron logs.
export async function GET() {
  try {
    const { error } = await supabaseAdmin.from('topics').select('id').limit(1)
    if (error) {
      console.error('[health] Supabase query failed:', error.message)
      return NextResponse.json({ ok: false }, { status: 503 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[health] Supabase unreachable:', err)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
