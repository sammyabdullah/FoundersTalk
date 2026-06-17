'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import { ARR_BUCKET_LABELS, BUSINESS_MODEL_LABELS, CUSTOMER_TYPE_LABELS } from '@/lib/types'

interface TopicChoice {
  id: string
  name: string
  direction: 'been_through_this' | 'figuring_this_out' | null
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export default function JoinForm({ topics: initialTopics }: { topics: Array<{ id: string; name: string }> }) {
  const [topics, setTopics] = useState<TopicChoice[]>(initialTopics.map(t => ({ ...t, direction: null })))
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
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

    const data = await res.json()
    if (res.ok) {
      if (data.emailError) console.error('Email send failed:', data.emailError)
      setSubmitState('success')
    } else {
      setErrorMsg(data.error || 'Something went wrong. Please try again.')
      setSubmitState('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-semibold text-[#0f1f3d] mb-4">You're on the list.</h1>
            <p className="text-[#6b7280] leading-relaxed">
              Thank you. We'll match you with other founders and ask for your opt-in before any intros are made.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      <Nav />

      <main className="flex-1 px-8 py-12 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-semibold text-[#0f1f3d] mb-2">Create Profile</h1>
        <p className="text-[#6b7280] mb-10">Tell us about yourself and what you're working through. We'll match you with founders who've been there. Your company remains anonymous.</p>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-6">Section 1 — Your Company</h2>
            <div className="space-y-5">
              <Field label="Email" required>
                <input type="email" required value={form.email} onChange={e => setField('email', e.target.value)} className="input" placeholder="you@company.com" />
              </Field>

              <Field label="Password" required hint="You'll use this to log in and manage your profile">
                <input type="password" required minLength={6} value={form.password} onChange={e => setField('password', e.target.value)} className="input" placeholder="At least 6 characters" />
              </Field>

              <Field label="ARR" required>
                <select required value={form.arr_bucket} onChange={e => setField('arr_bucket', e.target.value)} className="input">
                  <option value="">Select ARR bucket</option>
                  {Object.entries(ARR_BUCKET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>

              <Field label="Business model" required>
                <select required value={form.business_model} onChange={e => setField('business_model', e.target.value)} className="input">
                  <option value="">Select business model</option>
                  {Object.entries(BUSINESS_MODEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>

              <Field label="Customer type" required>
                <select required value={form.customer_type} onChange={e => setField('customer_type', e.target.value)} className="input">
                  <option value="">Select customer type</option>
                  {Object.entries(CUSTOMER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>

              <Field label="Product category" hint="Optional">
                <div className="flex flex-wrap gap-2">
                  {['iPaaS','Vertical SaaS','DevTools','Security','Data & Analytics','HR Tech','FinTech','MarTech','RevOps','Ed Tech','Healthcare','Other'].map(v => (
                    <button key={v} type="button" onClick={() => setField('vertical', form.vertical === v ? '' : v)}
                      className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${form.vertical === v ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]' : 'bg-white text-[#1a1a2e] border-black/20 hover:border-[#0f1f3d]'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Geography" required>
                <input type="text" required value={form.geography} onChange={e => setField('geography', e.target.value)} className="input" placeholder="e.g. US, Europe, Global" />
              </Field>

              <Field label="What does your company do?" required>
                <textarea required value={form.company_description} onChange={e => setField('company_description', e.target.value)} className="input min-h-[100px] resize-y" placeholder="2–3 sentences on what you build and who you sell to." />
              </Field>

              <Field label="Anything else you'd like a potential match to know before deciding to connect?" hint="Optional">
                <textarea value={form.open_to_share} onChange={e => setField('open_to_share', e.target.value)} className="input min-h-[80px] resize-y" placeholder="Context that doesn't fit above — deal dynamics, stage of journey, etc." />
              </Field>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-2">Section 2 — Your Experience</h2>
            <p className="text-sm text-[#6b7280] mb-6">Select any topics relevant to you and whether you've been through it, are figuring it out, or not a relevant topic for you. For topics you've been through, you'll be matched with those still figuring it out, and vice versa.</p>
            <div className="space-y-3">
              {topics.map(topic => (
                <TopicRow key={topic.id} topic={topic} onChange={direction => setTopicDirection(topic.id, direction)} />
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-6">Section 3 — About You</h2>
            <div className="space-y-5">
              <Field label="First name" hint="Optional — used in emails">
                <input type="text" value={form.first_name} onChange={e => setField('first_name', e.target.value)} className="input" placeholder="Your first name" />
              </Field>
            </div>
          </section>

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

          <button type="submit" disabled={submitState === 'loading'} className="w-full bg-[#0f1f3d] text-white font-medium py-4 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60">
            {submitState === 'loading' ? 'Submitting…' : 'Submit Profile'}
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

function TopicRow({ topic, onChange }: { topic: TopicChoice; onChange: (d: 'been_through_this' | 'figuring_this_out' | null) => void }) {
  return (
    <div className="border border-black/10 bg-white rounded-lg p-4">
      <p className="text-sm font-medium text-[#1a1a2e] mb-3">{topic.name}</p>
      <div className="flex flex-wrap gap-2">
        {([
          { value: 'been_through_this', label: "I can help with this" },
          { value: 'figuring_this_out', label: "I could use help here" },
          { value: null, label: "Not a topic for me" },
        ] as const).map(opt => (
          <button key={opt.label} type="button" onClick={() => onChange(opt.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${topic.direction === opt.value ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]' : 'text-[#6b7280] border-black/20 hover:border-[#0f1f3d]'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
