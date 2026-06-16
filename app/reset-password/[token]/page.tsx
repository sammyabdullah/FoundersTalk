'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.')
      setState('error')
      return
    }
    setState('loading')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, password }),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/login?reset=1')
    } else {
      setErrorMsg(data.error || 'Something went wrong.')
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-[#0f1f3d] mb-2">Set a new password</h1>
          <p className="text-[#6b7280] mb-8 text-sm">Choose a new password for your account.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className="input"
              />
            </div>
            {state === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full bg-[#0f1f3d] text-white font-medium py-3 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60"
            >
              {state === 'loading' ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
