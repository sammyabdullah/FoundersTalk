'use client'

import { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'sent'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setState('sent')
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {state === 'sent' ? (
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-[#0f1f3d] mb-3">Check your email</h1>
              <p className="text-[#6b7280] mb-6">If an account exists for {email}, we've sent a password reset link. It expires in 1 hour.</p>
              <Link href="/login" className="text-sm text-[#0f1f3d] font-medium hover:underline">Back to sign in</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-[#0f1f3d] mb-2">Reset your password</h1>
              <p className="text-[#6b7280] mb-8 text-sm">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="w-full bg-[#0f1f3d] text-white font-medium py-3 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60"
                >
                  {state === 'loading' ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
              <p className="text-sm text-[#6b7280] mt-6 text-center">
                <Link href="/login" className="text-[#0f1f3d] font-medium hover:underline">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
