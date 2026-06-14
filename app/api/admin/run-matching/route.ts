import { NextRequest, NextResponse } from 'next/server'
import { runMatching } from '@/lib/matching'

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-token') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const proposed = await runMatching()
  return NextResponse.json(proposed)
}
