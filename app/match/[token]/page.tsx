'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ARR_BUCKET_LABELS, BUSINESS_MODEL_LABELS, CUSTOMER_TYPE_LABELS } from '@/lib/types'

interface MatchData {
  match: { id: string; status: string; expires_at: string; topic: { name: string } }
  me: { email: string }
  other: {
    first_name: string | null
    company_description: string
    arr_bucket: string
    business_model: string
    customer_type: string
    vertical: string | null
    geography: string
    open_to_share: string | null
    additional_notes: string | null
    direction: string | null
  }
  isA: boolean
}

type PageState = 'loading' | 'ready' | 'responding' | 'done' | 'error'

export default function MatchPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<MatchData | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [response, setResponse] = useState<'yes' | 'no' | null>(null)

  useEffect(() => {
    fetch(`/api/match/${params.token}`)
      .then(r => r.json())
      .then(d => { setData(d); setPageState('ready') })
      .catch(() => setPageState('error'))
  }, [params.token])

  async function respond(accept: boolean) {
    setPageState('responding')
    setResponse(accept ? 'yes' : 'no')
    await fetch(`/api/match/${params.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept }),
    })
    setPageState('done')
  }

  if (pageState === 'loading') {
    return <Shell><p className="text-[#6b7280]">Loading…</p></Shell>
  }

  if (pageState === 'error' || !data) {
    return <Shell><p className="text-red-600">This link is invalid or has expired.</p></Shell>
  }

  if (pageState === 'done') {
    return (
      <Shell>
        <div className="text-center max-w-md">
          {response === 'yes' ? (
            <>
              <h2 className="text-2xl font-semibold text-[#0f1f3d] mb-3">You're in.</h2>
              <p className="text-[#6b7280]">
                If {data.other.first_name || 'the other founder'} also says yes, we'll send an intro email to both of you.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-[#0f1f3d] mb-3">No worries.</h2>
              <p className="text-[#6b7280]">We'll keep looking for the right match.</p>
            </>
          )}
        </div>
      </Shell>
    )
  }

  const { other, match } = data
  const directionLabel = other.direction === 'been_through_this' ? 'has been through this' : 'is figuring this out'

  return (
    <Shell>
      <div className="max-w-xl w-full">
        <p className="text-sm text-[#6b7280] mb-6">
          We think you two might have a useful conversation. Here's who we matched you with — let us know if you'd like an intro.
        </p>

        <div className="bg-white border border-black/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#0f1f3d] mb-4">
            {other.first_name || 'Your match'}
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Company" value={other.company_description} />
            <Row label="ARR" value={ARR_BUCKET_LABELS[other.arr_bucket as keyof typeof ARR_BUCKET_LABELS]} />
            <Row label="Business model" value={BUSINESS_MODEL_LABELS[other.business_model as keyof typeof BUSINESS_MODEL_LABELS]} />
            <Row label="Customer type" value={CUSTOMER_TYPE_LABELS[other.customer_type as keyof typeof CUSTOMER_TYPE_LABELS]} />
            {other.vertical && <Row label="Vertical" value={other.vertical} />}
            <Row label="Geography" value={other.geography} />
            <Row
              label="Matched topic"
              value={`${match.topic.name} — ${directionLabel}`}
            />
            {other.open_to_share && <Row label="From them" value={other.open_to_share} />}
            {other.additional_notes && <Row label="Notes" value={other.additional_notes} />}
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => respond(true)}
            disabled={pageState === 'responding'}
            className="flex-1 bg-[#0f1f3d] text-white font-medium py-4 rounded-lg hover:bg-[#1e3a5f] transition-colors text-center disabled:opacity-60"
          >
            Yes, I'd like to connect
          </button>
          <button
            onClick={() => respond(false)}
            disabled={pageState === 'responding'}
            className="flex-1 bg-white border border-black/15 text-[#1a1a2e] font-medium py-4 rounded-lg hover:bg-black/5 transition-colors text-center disabled:opacity-60"
          >
            No thanks
          </button>
        </div>

        <p className="text-xs text-[#6b7280] mt-4 text-center">
          This link is unique to you. Expires {new Date(match.expires_at).toLocaleDateString()}.
        </p>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      <nav className="px-8 py-6 border-b border-black/5">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#0f1f3d]">
          <img src="/logo.jpg" alt="" width={32} height={32} className="rounded-sm" />
          FoundersTalk
        </Link>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {children}
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[#6b7280] text-xs uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-[#1a1a2e] leading-relaxed">{value}</dd>
    </div>
  )
}
