import Link from 'next/link'
import Image from 'next/image'

const TOPICS = [
  'Fundraising (Seed)',
  'Fundraising (Series A)',
  'Fundraising (Series B+)',
  'Bridge Rounds and Inside Rounds',
  'Term Sheet Negotiation',
  'Picking the Right VC',
  'Down Rounds',
  'GTM and Sales Motion',
  'Hiring Your First Sales Rep',
  'Hiring a VP of Sales',
  'Pricing and Packaging',
  'Moving Upmarket (SMB to Enterprise)',
  'Customer Success and Churn Reduction',
  'Product-Led Growth',
  'Channel and Partnerships',
  'International Expansion',
  'Building and Managing a Board',
  'Co-Founder Conflict',
  'Founder-to-CEO Transition',
  'AI Integration into Product',
  'Managing Through a Down Market',
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f1f3d] text-white flex flex-col">
      <nav className="px-8 py-6 flex items-center gap-3">
        <Image
          src="/logo.jpg"
          alt="FounderTalk logo"
          width={36}
          height={36}
          className="rounded-sm"
          style={{ mixBlendMode: 'screen' }}
        />
        <span className="text-xl font-semibold tracking-tight">FounderTalk</span>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-16 px-8 py-16 max-w-6xl mx-auto w-full">

        {/* Left — topics */}
        <div className="w-full lg:w-72 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Topics covered</p>
          <ul className="space-y-2">
            {TOPICS.map(topic => (
              <li key={topic} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-white/30 shrink-0" />
                {topic}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — hero */}
        <div className="flex-1">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight mb-8">
            Founders talk<br />to founders.
          </h1>
          <p className="text-lg text-white/70 mb-12 leading-relaxed max-w-lg">
            Every founder has questions they can't ask their board, their team, or their investors. FounderTalk connects you with a founder who's already lived through it. Anonymous and free.
          </p>
          <Link
            href="/apply"
            className="inline-block bg-white text-[#0f1f3d] font-medium px-8 py-4 rounded-lg hover:bg-white/90 transition-colors"
          >
            Apply to Join
          </Link>
        </div>

      </main>

      <footer className="px-8 py-6 text-white/40 text-sm">
        © {new Date().getFullYear()} FounderTalk
      </footer>
    </div>
  )
}
