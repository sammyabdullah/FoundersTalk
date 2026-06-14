import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f1f3d] text-white flex flex-col">
      <nav className="px-8 py-6">
        <span className="text-xl font-semibold tracking-tight">FoundersTalk</span>
      </nav>

      <main className="flex-1 flex flex-col justify-center px-8 py-24 max-w-2xl mx-auto w-full">
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight mb-8">
          Founders talk<br />to founders.
        </h1>
        <p className="text-lg text-white/70 mb-12 leading-relaxed max-w-lg">
          FoundersTalk matches B2B SaaS founders for one-on-one conversations based on shared experience and where you're headed. No pitch decks. No panels. Just useful conversations with people who've been where you are.
        </p>
        <Link
          href="/apply"
          className="inline-block bg-white text-[#0f1f3d] font-medium px-8 py-4 rounded-lg hover:bg-white/90 transition-colors text-center w-fit"
        >
          Apply to Join
        </Link>
      </main>

      <footer className="px-8 py-6 text-white/40 text-sm">
        © {new Date().getFullYear()} FoundersTalk
      </footer>
    </div>
  )
}
