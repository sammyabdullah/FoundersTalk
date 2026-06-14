'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ARR_BUCKET_LABELS, BUSINESS_MODEL_LABELS, CUSTOMER_TYPE_LABELS } from '@/lib/types'

interface TopicChoice {
  id: string
  name: string
  direction: 'been_through_this' | 'figuring_this_out' | null
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export default function ApplyPage() {
  const [topics, setTopics] = useState<TopicChoice[]>([])
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    email: '',
    arr_bucket: '',
    business_model: '',
    customer_type: '',
    vertical: '',
    geography: '',
    company_description: '',
    open_to_share: '',
    first_name: '',
    additional_notes: '',
  })

  useEffect(() => {
    fetch('/api/topics')
      .then(r => r.json())
      .then(data => setTopics(data.map((t: { id: string; name: string }) => ({ ...t, direction: null }))))
  }, [])

  function setField(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function setTopicDirection(id: string, direction: 'been_through_this' | 'figuring_this_out' | null) {
    setTopics(ts => ts.map(t => t.id === id ? { ...t, direction } : t))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitState('loading')
    setErrorMsg('')

    const selectedTopics = topics.filter(t => t.direction !== null)
    if (selectedTopics.length === 0) {
      setErrorMsg('Please select at least one topic.')
      setSubmitState('idle')
      return
    }

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, topics: selectedTopics.map(t => ({ id: t.id, direction: t.direction })) }),
    })

    if (res.ok) {
      setSubmitState('success')
    } else {
      const data = await res.json()
      setErrorMsg(data.error || 'Something went wrong. Please try again.')
      setSubmitState('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
        <nav className="px-8 py-6 border-b border-black/5">
          <Link href="/" className="text-xl font-semibold tracking-tight text-[#0f1f3d]">FoundersTalk</Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-semibold text-[#0f1f3d] mb-4">You're on the list.</h1>
            <p className="text-[#6b7280] leading-relaxed">
              Thanks for applying. We review every application personally and will be in touch shortly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      <nav className="px-8 py-6 border-b border-black/5">
        <Link href="/" className="text-xl font-semibold tracking-tight text-[#0f1f3d]">FoundersTalk</Link>
      </nav>

      <main className="flex-1 px-8 py-12 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-semibold text-[#0f1f3d] mb-2">Apply to Join</h1>
        <p className="text-[#6b7280] mb-10">Tell us about yourself and what you're working through. We'll match you with founders who've been there.</p>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-6">Section 1 — Your Company</h2>
            <div className="space-y-5">
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  className="input"
                  placeholder="you@company.com"
                />
              </Field>

              <Field label="ARR" required>
                <select required value={form.arr_bucket} onChange={e => setField('arr_bucket', e.target.value)} className="input">
                  <option value="">Select ARR bucket</option>
                  {Object.entries(ARR_BUCKET_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>

              <Field label="Business model" required>
                <select required value={form.business_model} onChange={e => setField('business_model', e.target.value)} className="input">
                  <option value="">Select business model</option>
                  {Object.entries(BUSINESS_MODEL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>

              <Field label="Customer type" required>
                <select required value={form.customer_type} onChange={e => setField('customer_type', e.target.value)} className="input">
                  <option value="">Select customer type</option>
                  {Object.entries(CUSTOMER_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>

              <Field label="Vertical focus" hint="Optional">
                <input
                  type="text"
                  value={form.vertical}
                  onChange={e => setField('vertical', e.target.value)}
                  className="input"
                  placeholder="e.g. fintech, HR tech, dev tools — leave blank if horizontal"
                />
              </Field>

              <Field label="Geography" required>
                <input
                  type="text"
                  required
                  value={form.geography}
                  onChange={e => setField('geography', e.target.value)}
                  className="input"
                  placeholder="e.g. US, Europe, Global"
                />
              </Field>

              <Field label="What does your company do?" required>
                <textarea
                  required
                  value={form.company_description}
                  onChange={e => setField('company_description', e.target.value)}
                  className="input min-h-[100px] resize-y"
                  placeholder="2–3 sentences on what you build and who you sell to."
                />
              </Field>

              <Field label="Anything else you'd like a potential match to know before deciding to connect?" hint="Optional">
                <textarea
                  value={form.open_to_share}
                  onChange={e => setField('open_to_share', e.target.value)}
                  className="input min-h-[80px] resize-y"
                  placeholder="Context that doesn't fit above — deal dynamics, stage of journey, etc."
                />
              </Field>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-2">Section 2 — Your Experience</h2>
            <p className="text-sm text-[#6b7280] mb-6">Select any topics relevant to you and whether you've been through it or are figuring it out now. Select at least one.</p>
            <div className="space-y-3">
              {topics.map(topic => (
                <TopicRow
                  key={topic.id}
                  topic={topic}
                  onChange={direction => setTopicDirection(topic.id, direction)}
                />
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-6">Section 3 — About You</h2>
            <div className="space-y-5">
              <Field label="First name" hint="Optional — used in emails">
                <input
                  type="text"
                  value={form.first_name}
                  onChange={e => setField('first_name', e.target.value)}
                  className="input"
                  placeholder="Your first name"
                />
              </Field>

              <Field label="Anything else you want a potential match to know?" hint="Optional">
                <textarea
                  value={form.additional_notes}
                  onChange={e => setField('additional_notes', e.target.value)}
                  className="input min-h-[80px] resize-y"
                  placeholder="Free text"
                />
              </Field>
            </div>
          </section>

          {errorMsg && (
            <p className="text-red-600 text-sm">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitState === 'loading'}
            className="w-full bg-[#0f1f3d] text-white font-medium py-4 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60"
          >
            {submitState === 'loading' ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </main>
    </div>
  )
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
        {hint && <span className="text-[#6b7280] font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

function TopicRow({
  topic,
  onChange,
}: {
  topic: TopicChoice
  onChange: (d: 'been_through_this' | 'figuring_this_out' | null) => void
}) {
  const isSelected = topic.direction !== null

  return (
    <div className={`border rounded-lg p-4 transition-colors ${isSelected ? 'border-[#0f1f3d] bg-white' : 'border-black/10 bg-white/60'}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={e => onChange(e.target.checked ? 'figuring_this_out' : null)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0f1f3d] cursor-pointer"
          id={`topic-${topic.id}`}
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={`topic-${topic.id}`} className="text-sm font-medium text-[#1a1a2e] cursor-pointer">
            {topic.name}
          </label>
          {isSelected && (
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => onChange('been_through_this')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  topic.direction === 'been_through_this'
                    ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]'
                    : 'text-[#6b7280] border-black/20 hover:border-[#0f1f3d]'
                }`}
              >
                I've been through this
              </button>
              <button
                type="button"
                onClick={() => onChange('figuring_this_out')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  topic.direction === 'figuring_this_out'
                    ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]'
                    : 'text-[#6b7280] border-black/20 hover:border-[#0f1f3d]'
                }`}
              >
                I'm figuring this out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
