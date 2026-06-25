'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ARR_BUCKET_LABELS, BUSINESS_MODEL_LABELS, CUSTOMER_TYPE_LABELS, Founder } from '@/lib/types'

type Tab = 'overview' | 'profile' | 'topics'

interface DashboardData {
  founder: Founder
  topics: Array<{ topic_id: string; direction: string; topics: { id: string; name: string } }>
  matches: Array<{
    id: string
    status: string
    matched_at: string
    founder_a_id: string
    founder_a_response: boolean | null
    founder_b_response: boolean | null
    topics: { name: string }
    sharedTopicNames: string[]
    founders_a: { id: string; first_name: string | null; email: string; company_description: string; arr_bucket: string }
    founders_b: { id: string; first_name: string | null; email: string; company_description: string; arr_bucket: string }
  }>
}

interface AllTopics { id: string; name: string }

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [allTopics, setAllTopics] = useState<AllTopics[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [profileForm, setProfileForm] = useState<Partial<Founder>>({})
  const [topicSelections, setTopicSelections] = useState<Record<string, 'been_through_this' | 'figuring_this_out' | null>>({})

  const [responding, setResponding] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/founder/me')
    if (res.status === 401 || res.status === 403) { router.push('/login'); return }
    const d = await res.json()
    setData(d)
    setProfileForm(d.founder)
    const sel: Record<string, 'been_through_this' | 'figuring_this_out' | null> = {}
    d.topics.forEach((t: any) => { sel[t.topic_id] = t.direction })
    setTopicSelections(sel)
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch('/api/topics').then(r => r.json()).then(setAllTopics)
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  async function saveProfile() {
    setSaving(true)
    setSaveMsg('')
    await fetch('/api/founder/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    })
    setSaving(false)
    setSaveMsg('Saved.')
    setTimeout(() => setSaveMsg(''), 2000)
  }

  async function saveTopics() {
    setSaving(true)
    setSaveMsg('')
    const topics = Object.entries(topicSelections)
      .filter(([, d]) => d !== null)
      .map(([id, direction]) => ({ id, direction }))
    await fetch('/api/founder/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics }),
    })
    setSaving(false)
    setSaveMsg('Saved.')
    setTimeout(() => setSaveMsg(''), 2000)
  }

  if (loading) {
    return (
      <Shell onLogout={logout}>
        <p className="text-[#6b7280]">Loading…</p>
      </Shell>
    )
  }

  if (!data) return null

  const { founder, matches } = data
  const totalMatches = matches.length
  const accepted = matches.filter(m => m.status === 'both_accepted').length
  const pending = matches.filter(m => ['pending', 'founder_a_accepted', 'founder_b_accepted'].includes(m.status)).length

  return (
    <Shell onLogout={logout}>
      <div className="max-w-3xl w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#0f1f3d]">
            {founder.first_name ? `Hi, ${founder.first_name}` : 'Your Dashboard'}
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">{founder.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total matches" value={totalMatches} />
          <StatCard label="Both accepted" value={accepted} />
          <StatCard label="Awaiting response" value={pending} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-black/10 mb-6">
          {(['overview', 'profile', 'topics'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-[#0f1f3d] text-[#0f1f3d]' : 'border-transparent text-[#6b7280] hover:text-[#1a1a2e]'}`}
            >
              {t === 'overview' ? 'Match History' : t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <p className="text-[#6b7280] text-sm">No matches yet. We'll reach out when we find a good fit.</p>
            ) : matches.map(m => {
              const isA = m.founder_a_id === founder.id
              const other = isA ? m.founders_b : m.founders_a
              const myResponse = isA ? m.founder_a_response : m.founder_b_response
              const canRespond = myResponse === null && m.status !== 'declined' && m.status !== 'expired'

              async function respondToMatch(accept: boolean) {
                setResponding(m.id)
                await fetch('/api/founder/match-respond', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ matchId: m.id, accept }),
                })
                setResponding(null)
                await load()
              }

              return (
                <div key={m.id} className="bg-white border border-black/10 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-[#0f1f3d] text-sm">{other.first_name || other.email}</p>
                      <p className="text-xs text-[#6b7280] mt-0.5">{ARR_BUCKET_LABELS[other.arr_bucket as keyof typeof ARR_BUCKET_LABELS]} · {(m.sharedTopicNames?.length > 0 ? m.sharedTopicNames : [m.topics?.name]).join(', ')}</p>
                      <p className="text-xs text-[#1a1a2e] mt-1 line-clamp-2">{other.company_description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={m.status} />
                      {m.status === 'both_accepted' && <span className="text-xs text-[#0f1f3d] font-medium">{other.email}</span>}
                    </div>
                  </div>
                  {canRespond && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => respondToMatch(true)}
                        disabled={responding === m.id}
                        className="px-4 py-2 bg-[#0f1f3d] text-white text-xs font-medium rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60"
                      >
                        {responding === m.id ? 'Responding…' : "Yes, I'd like to connect"}
                      </button>
                      <button
                        onClick={() => respondToMatch(false)}
                        disabled={responding === m.id}
                        className="px-4 py-2 bg-white border border-black/15 text-xs font-medium rounded-lg hover:bg-black/5 transition-colors disabled:opacity-60"
                      >
                        No thanks
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-[#6b7280] mt-3">Matched {new Date(m.matched_at).toLocaleDateString()}</p>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'profile' && (
          <div className="space-y-5">
            <Field label="First name">
              <input type="text" value={profileForm.first_name || ''} onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))} className="input" />
            </Field>
            <Field label="ARR" required>
              <select value={profileForm.arr_bucket || ''} onChange={e => setProfileForm(f => ({ ...f, arr_bucket: e.target.value as any }))} className="input">
                {Object.entries(ARR_BUCKET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Business model" required>
              <select value={profileForm.business_model || ''} onChange={e => setProfileForm(f => ({ ...f, business_model: e.target.value as any }))} className="input">
                {Object.entries(BUSINESS_MODEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Customer type" required>
              <select value={profileForm.customer_type || ''} onChange={e => setProfileForm(f => ({ ...f, customer_type: e.target.value as any }))} className="input">
                {Object.entries(CUSTOMER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Product category">
              <div className="flex flex-wrap gap-2">
                {['iPaaS','Vertical SaaS','DevTools','Security','Data & Analytics','HR Tech','FinTech','MarTech','RevOps','Ed Tech','Healthcare','Other'].map(v => (
                  <button key={v} type="button"
                    onClick={() => setProfileForm(f => ({ ...f, vertical: f.vertical === v ? '' : v }))}
                    className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${profileForm.vertical === v ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]' : 'bg-white text-[#1a1a2e] border-black/20 hover:border-[#0f1f3d]'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Geography" required>
              <input type="text" value={profileForm.geography || ''} onChange={e => setProfileForm(f => ({ ...f, geography: e.target.value }))} className="input" />
            </Field>
            <Field label="What does your company do?" required>
              <textarea value={profileForm.company_description || ''} onChange={e => setProfileForm(f => ({ ...f, company_description: e.target.value }))} className="input min-h-[100px] resize-y" />
            </Field>
            <Field label="Anything else you'd like a potential match to know?">
              <textarea value={profileForm.open_to_share || ''} onChange={e => setProfileForm(f => ({ ...f, open_to_share: e.target.value }))} className="input min-h-[80px] resize-y" />
            </Field>
            <div className="flex items-center gap-4">
              <button onClick={saveProfile} disabled={saving} className="bg-[#0f1f3d] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {saveMsg && <p className="text-sm text-green-600">{saveMsg}</p>}
            </div>

            <div className="border-t border-black/10 pt-6 mt-6">
              <p className="text-sm font-medium text-[#1a1a2e] mb-1">Pause matching</p>
              <p className="text-sm text-[#6b7280] mb-4">While paused, you won't be considered for new matches, pending matches will be cancelled, and you will be signed out. Contact us to reactivate.</p>
              <button
                onClick={async () => {
                  const currentStatus = data?.founder.status
                  const newStatus = currentStatus === 'paused' ? 'active' : 'paused'
                  const res = await fetch('/api/founder/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
                  if (res.ok) {
                    if (newStatus === 'paused') {
                      await fetch('/api/auth/logout', { method: 'POST' })
                      router.push('/login')
                      return
                    }
                    await load()
                  }
                }}
                className={`text-sm px-4 py-2 rounded-lg border transition-colors ${data?.founder.status === 'paused' ? 'bg-[#0f1f3d] text-white border-[#0f1f3d] hover:bg-[#1e3a5f]' : 'text-[#6b7280] border-black/20 hover:border-[#0f1f3d]'}`}
              >
                {data?.founder.status === 'paused' ? 'Resume matching' : 'Pause matching'}
              </button>
              {data?.founder.status === 'paused' && (
                <p className="text-xs text-amber-600 mt-2">Your profile is currently paused.</p>
              )}
            </div>

            <div className="border-t border-black/10 pt-6 mt-6">
              <p className="text-sm font-medium text-red-600 mb-1">Delete account</p>
              <p className="text-sm text-[#6b7280] mb-4">This permanently deletes your profile and all match history. This cannot be undone.</p>
              {!deleteConfirm ? (
                <button onClick={() => setDeleteConfirm(true)} className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                  Delete my account
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      setDeleting(true)
                      const res = await fetch('/api/founder/delete', { method: 'DELETE' })
                      if (res.ok) { window.location.href = '/' }
                      else { setDeleting(false); setDeleteConfirm(false) }
                    }}
                    disabled={deleting}
                    className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete my account'}
                  </button>
                  <button onClick={() => setDeleteConfirm(false)} className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'topics' && (
          <div className="space-y-3">
            <p className="text-sm text-[#6b7280] mb-4">Update your topics at any time. Changes take effect for future matches.</p>
            {allTopics.map(topic => (
              <div key={topic.id} className="bg-white border border-black/10 rounded-lg p-4">
                <p className="text-sm font-medium text-[#1a1a2e] mb-3">{topic.name}</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'been_through_this', label: 'I can help with this' },
                    { value: 'figuring_this_out', label: 'I could use help here' },
                    { value: null, label: 'Not a topic for me' },
                  ] as const).map(opt => (
                    <button key={opt.label} type="button"
                      onClick={() => setTopicSelections(s => ({ ...s, [topic.id]: opt.value }))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${topicSelections[topic.id] === opt.value ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]' : 'text-[#6b7280] border-black/20 hover:border-[#0f1f3d]'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <button onClick={saveTopics} disabled={saving} className="bg-[#0f1f3d] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save topics'}
              </button>
              {saveMsg && <p className="text-sm text-green-600">{saveMsg}</p>}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}

function Shell({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      <nav className="px-8 py-5 border-b border-black/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#0f1f3d]">
          <Image src="/logo.jpg" alt="" width={32} height={32} className="rounded-sm" />
          TwoFoundersTalk
        </Link>
        <button onClick={onLogout} className="text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
          Sign out
        </button>
      </nav>
      <main className="flex-1 px-8 py-10 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-black/10 rounded-xl p-5">
      <p className="text-3xl font-semibold text-[#0f1f3d]">{value}</p>
      <p className="text-sm text-[#6b7280] mt-1">{label}</p>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pending: ['Awaiting responses', 'text-[#6b7280] bg-black/5'],
    founder_a_accepted: ['One accepted', 'text-amber-700 bg-amber-50'],
    founder_b_accepted: ['One accepted', 'text-amber-700 bg-amber-50'],
    both_accepted: ['Connected', 'text-green-700 bg-green-50'],
    declined: ['Declined', 'text-red-600 bg-red-50'],
    expired: ['Expired', 'text-[#6b7280] bg-black/5'],
  }
  const [label, cls] = map[status] ?? [status, '']
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cls}`}>{label}</span>
}
