'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Nav({ dark = false }: { dark?: boolean }) {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/founder/me').then(r => setLoggedIn(r.ok))
  }, [])

  const textCls = dark ? 'text-white' : 'text-[#0f1f3d]'
  const mutedCls = dark ? 'text-white/60 hover:text-white' : 'text-[#6b7280] hover:text-[#1a1a2e]'

  return (
    <nav className={`py-6 flex items-center justify-between ${dark ? '' : 'px-8 border-b border-black/5'}`}>
      <Link href="/" className={`flex items-center gap-2 text-xl font-semibold tracking-tight ${textCls}`}>
        <Image
          src="/logo.jpg"
          alt=""
          width={32}
          height={32}
          className="rounded-sm"
          style={dark ? { mixBlendMode: 'screen' } : {}}
        />
        FounderTalk
      </Link>
      <div className="flex items-center gap-3">
        {loggedIn ? (
          <Link href="/dashboard" className={`text-sm font-medium transition-colors ${mutedCls}`}>
            Dashboard
          </Link>
        ) : !dark ? (
          <Link href="/login" className={`text-sm font-medium transition-colors ${mutedCls}`}>
            Sign in
          </Link>
        ) : null}
      </div>
    </nav>
  )
}
