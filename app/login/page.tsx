'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justReset = searchParams.get('reset') === '1'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-[#0f1f3d] mb-1">Sign in</h1>
      <p className="text-sm text-[#6b7280] mb-8">Access your founder profile and match history.</p>

      {justReset && (
        <p className="text-sm text-green-600 mb-4">Password updated. Sign in with your new password.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            placeholder="you@company.com"
            autoFocus
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-[#1a1a2e]">Password</label>
            <Link href="/forgot-password" className="text-xs text-[#6b7280] hover:text-[#0f1f3d] transition-colors">Forgot password?</Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0f1f3d] text-white font-medium py-3 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-[#6b7280] mt-6 text-center">
        Not a member yet?{' '}
        <Link href="/apply" className="text-[#0f1f3d] font-medium hover:underline">Join</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f1] flex flex-col">
      <nav className="px-8 py-6 border-b border-black/5">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[#0f1f3d]">
          <Image src="/logo.jpg" alt="" width={32} height={32} className="rounded-sm" />
          FounderTalk
        </Link>
      </nav>
      <main className="flex-1 flex items-center justify-center px-8">
        <Suspense><LoginForm /></Suspense>
      </main>
    </div>
  )
}
