'use client'

import { useState, useEffect, useCallback } from 'react'
import { ARR_BUCKET_LABELS, BUSINESS_MODEL_LABELS, CUSTOMER_TYPE_LABELS, Founder, Match } from '@/lib/types'

type Tab = 'pending' | 'founders' | 'matches'

interface ProposedMatch {
  founderA: Founder
  founderB: Founder
  topicId: string
  topicName: string
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<Tab>('pending')

  function login(e: React.FormEvent) {
    e.preventDefault()
    setAuthed(true)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0f1f3d] flex items-center justify-center px-8">
        <form onSubmit={login} className="bg-white rounded-xl p-8 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold text-[#0f1f3d]">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="input"
            autoFocus
          />
          <button type="submit" className="w-full bg-[#0f1f3d] text-white py-3 rounded-lg font-medium hover:bg-[#1e3a5f] transition-colors">
            Sign in
          </button>
        </form>
      </div>
    )
  }

  const headers = { 'x-admin-token': password }

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <nav className="bg-[#0f1f3d] px-8 py-4 flex items-center gap-8">
        <span className="text-white font-semibold">FounderTalk Admin</span>
        {(['pending', 'founders', 'matches'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-medium transition-colors ${tab === t ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
          >
            {t === 'pending' ? 'Pending Approvals' : t === 'founders' ? 'Founder Database' : 'Matches'}
          </button>
        ))}
      </nav>

      <main className="px-8 py-8 max-w-6xl mx-auto">
        {tab === 'pending' && <PendingTab headers={headers} />}
        {tab === 'founders' && <FoundersTab headers={headers} />}
        {tab === 'matches' && <MatchesTab headers={headers} />}
      </main>
    </div>
  )
}

function PendingTab({ headers }: { headers: Record<string, string> }) {
  const [founders, setFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/founders?status=pending', { headers })
      .then(r => r.json())
      .then(d => { setFounders(d); setLoading(false) })
  }, [headers])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/founders', {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  if (loading) return <p className="text-[#6b7280]">Loading…</p>
  if (founders.length === 0) return <p className="text-[#6b7280]">No pending applications.</p>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#0f1f3d]">Pending Approvals ({founders.length})</h2>
      {founders.map(f => (
        <div key={f.id} className="bg-white border border-black/10 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <p className="font-medium text-[#0f1f3d]">{f.email}</p>
              <p className="text-sm text-[#6b7280]">{ARR_BUCKET_LABELS[f.arr_bucket]} · Applied {new Date(f.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-[#1a1a2e] mt-2 max-w-lg">{f.company_description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => updateStatus(f.id, 'active')}
                className="px-4 py-2 bg-[#0f1f3d] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a5f] transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(f.id, 'paused')}
                className="px-4 py-2 bg-white border border-black/15 text-sm font-medium rounded-lg hover:bg-black/5 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FoundersTab({ headers }: { headers: Record<string, string> }) {
  const [founders, setFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [topics, setTopics] = useState<Record<string, Array<{ direction: string; topics: { name: string } }>>>({})

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/founders?status=active', { headers })
      .then(r => r.json())
      .then(d => { setFounders(d); setLoading(false) })
  }, [headers])

  useEffect(() => { load() }, [load])

  async function loadTopics(id: string) {
    if (topics[id]) return
    const data = await fetch(`/api/admin/founders/${id}/topics`, { headers }).then(r => r.json())
    setTopics(t => ({ ...t, [id]: data }))
  }

  async function pause(id: string) {
    await fetch('/api/admin/founders', {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'paused' }),
    })
    load()
  }

  if (loading) return <p className="text-[#6b7280]">Loading…</p>
  if (founders.length === 0) return <p className="text-[#6b7280]">No active founders.</p>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#0f1f3d]">Active Founders ({founders.length})</h2>
      {founders.map(f => (
        <div key={f.id} className="bg-white border border-black/10 rounded-xl overflow-hidden">
          <button
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-black/2 transition-colors"
            onClick={() => {
              setExpanded(expanded === f.id ? null : f.id)
              loadTopics(f.id)
            }}
          >
            <div>
              <p className="font-medium text-[#0f1f3d]">{f.email}</p>
              <p className="text-sm text-[#6b7280]">{ARR_BUCKET_LABELS[f.arr_bucket]} · {CUSTOMER_TYPE_LABELS[f.customer_type]}{f.vertical ? ` · ${f.vertical}` : ''}</p>
            </div>
            <span className="text-[#6b7280] text-sm">{expanded === f.id ? '▲' : '▼'}</span>
          </button>

          {expanded === f.id && (
            <div className="px-6 pb-6 border-t border-black/5 pt-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                <ProfileRow label="Business model" value={BUSINESS_MODEL_LABELS[f.business_model]} />
                <ProfileRow label="Geography" value={f.geography} />
                {f.first_name && <ProfileRow label="First name" value={f.first_name} />}
                <ProfileRow label="Company" value={f.company_description} />
                {f.open_to_share && <ProfileRow label="Open to share" value={f.open_to_share} />}
                {f.additional_notes && <ProfileRow label="Notes" value={f.additional_notes} />}
              </dl>

              {topics[f.id] && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280] mb-2">Topics</p>
                  <ul className="space-y-1">
                    {topics[f.id].map((t, i) => (
                      <li key={i} className="text-sm">
                        <span className="text-[#1a1a2e]">{t.topics?.name}</span>
                        <span className="text-[#6b7280] ml-2">— {t.direction === 'been_through_this' ? "I've been through this" : "I'm figuring this out"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => pause(f.id)}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Pause this founder
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function MatchesTab({ headers }: { headers: Record<string, string> }) {
  const [proposed, setProposed] = useState<ProposedMatch[]>([])
  const [sentMatches, setSentMatches] = useState<Match[]>([])
  const [running, setRunning] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [skipped, setSkipped] = useState<Set<string>>(new Set())

  const loadSent = useCallback(() => {
    fetch('/api/admin/matches', { headers })
      .then(r => r.json())
      .then(setSentMatches)
  }, [headers])

  useEffect(() => { loadSent() }, [loadSent])

  async function runMatching() {
    setRunning(true)
    const data = await fetch('/api/admin/run-matching', { method: 'POST', headers }).then(r => r.json())
    setProposed(data)
    setSkipped(new Set())
    setRunning(false)
  }

  async function sendMatch(p: ProposedMatch) {
    const key = `${p.founderA.id}:${p.founderB.id}`
    setSending(key)
    await fetch('/api/admin/send-match', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ founderAId: p.founderA.id, founderBId: p.founderB.id, topicId: p.topicId }),
    })
    setSending(null)
    setSkipped(s => new Set(Array.from(s).concat(key)))
    loadSent()
  }

  function skip(p: ProposedMatch) {
    setSkipped(s => new Set(Array.from(s).concat(`${p.founderA.id}:${p.founderB.id}`)))
  }

  const visibleProposed = proposed.filter(p => !skipped.has(`${p.founderA.id}:${p.founderB.id}`))

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-[#0f1f3d]">Matches</h2>
        <button
          onClick={runMatching}
          disabled={running}
          className="px-5 py-2 bg-[#0f1f3d] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60"
        >
          {running ? 'Running…' : 'Run Matching'}
        </button>
      </div>

      {visibleProposed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b7280] mb-4">Proposed Matches ({visibleProposed.length})</h3>
          <div className="space-y-4">
            {visibleProposed.map(p => {
              const key = `${p.founderA.id}:${p.founderB.id}`
              return (
                <div key={key} className="bg-white border border-black/10 rounded-xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                    <FounderCard founder={p.founderA} label="Founder A" />
                    <FounderCard founder={p.founderB} label="Founder B" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge label={`Topic: ${p.topicName}`} active />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => sendMatch(p)}
                      disabled={sending === key}
                      className="px-4 py-2 bg-[#0f1f3d] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60"
                    >
                      {sending === key ? 'Sending…' : 'Send Match Emails'}
                    </button>
                    <button
                      onClick={() => skip(p)}
                      className="px-4 py-2 bg-white border border-black/15 text-sm font-medium rounded-lg hover:bg-black/5 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#6b7280] mb-4">Sent Matches ({sentMatches.length})</h3>
        {sentMatches.length === 0 ? (
          <p className="text-sm text-[#6b7280]">No matches sent yet.</p>
        ) : (
          <div className="space-y-3">
            {sentMatches.map((m: any) => (
              <div key={m.id} className="bg-white border border-black/10 rounded-xl px-5 py-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-sm">
                    <span className="font-medium text-[#0f1f3d]">{m.founders_a?.email}</span>
                    <span className="text-[#6b7280] mx-2">↔</span>
                    <span className="font-medium text-[#0f1f3d]">{m.founders_b?.email}</span>
                    <span className="text-[#6b7280] ml-2">· {m.topics?.name}</span>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-xs text-[#6b7280] mt-1">Sent {new Date(m.matched_at).toLocaleDateString()} · Expires {new Date(m.expires_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FounderCard({ founder, label }: { founder: Founder; label: string }) {
  return (
    <div className="text-sm">
      <p className="text-xs uppercase tracking-wide text-[#6b7280] mb-1">{label}</p>
      <p className="font-medium text-[#0f1f3d]">{founder.email}</p>
      <p className="text-[#6b7280]">{ARR_BUCKET_LABELS[founder.arr_bucket]}</p>
      <p className="text-[#1a1a2e] mt-1 leading-snug line-clamp-3">{founder.company_description}</p>
    </div>
  )
}

function Badge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border ${active ? 'bg-[#0f1f3d]/5 border-[#0f1f3d]/20 text-[#0f1f3d]' : 'border-black/10 text-[#6b7280]'}`}>
      {label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'Pending',
    founder_a_accepted: 'One accepted',
    founder_b_accepted: 'One accepted',
    both_accepted: 'Both accepted',
    declined: 'Declined',
    expired: 'Expired',
  }
  const colors: Record<string, string> = {
    pending: 'text-[#6b7280] bg-black/5',
    founder_a_accepted: 'text-amber-700 bg-amber-50',
    founder_b_accepted: 'text-amber-700 bg-amber-50',
    both_accepted: 'text-green-700 bg-green-50',
    declined: 'text-red-600 bg-red-50',
    expired: 'text-[#6b7280] bg-black/5',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status] ?? ''}`}>
      {map[status] ?? status}
    </span>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#6b7280] mb-0.5">{label}</dt>
      <dd className="text-[#1a1a2e] leading-relaxed">{value}</dd>
    </div>
  )
}
