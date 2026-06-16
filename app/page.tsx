import Link from 'next/link'
import Nav from '@/components/Nav'

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

      {/* Nav — aligned to same container as content */}
      <div className="w-full max-w-6xl mx-auto px-8 pt-6 pb-0">
        <Nav dark />
      </div>

      <main className="flex-1 flex flex-col lg:flex-row items-start gap-16 px-8 py-16 max-w-6xl mx-auto w-full">

        {/* Left — hero */}
        <div className="flex-1">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-tight mb-8">
            Founders talk<br />to founders.
          </h1>
          <p className="text-lg text-white/70 mb-12 leading-relaxed max-w-lg">
            Every founder has questions they can't ask their board, their team, or their investors. FounderTalk connects you with a founder who's already lived through it.<br /><br />Anonymous and free.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/apply" className="inline-block bg-white text-[#0f1f3d] font-medium px-8 py-4 rounded-lg hover:bg-white/90 transition-colors">
              Join
            </Link>
            <Link href="/login" className="inline-block bg-white/15 text-white font-medium px-8 py-4 rounded-lg hover:bg-white/25 transition-colors border border-white/20">
              Sign in
            </Link>
          </div>
        </div>

        {/* Right — topics */}
        <div className="w-full lg:w-72 shrink-0 order-last lg:order-none">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Topics</p>
          <ul className="space-y-2">
            {TOPICS.map(topic => (
              <li key={topic} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-white/30 shrink-0" />
                {topic}
              </li>
            ))}
          </ul>
        </div>

      </main>

      {/* Footer — aligned to same container as content */}
      <div className="w-full max-w-6xl mx-auto px-8">
        <footer className="py-6 text-white/40 text-sm border-t border-white/10">
          <p>Built for founders by Blossom Street Ventures. Contact us at <a href="mailto:sammy@blossomstreetventures.com" className="underline hover:text-white/60 transition-colors">sammy@blossomstreetventures.com</a></p>
        </footer>
      </div>

    </div>
  )
}
