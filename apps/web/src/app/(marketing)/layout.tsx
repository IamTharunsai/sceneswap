import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'SceneSwap — AI Product Placement for Creators & Brands',
    template: '%s | SceneSwap',
  },
  description:
    'SceneSwap uses AI to place brand products naturally inside creator videos — not beside them. Creators earn 70% of ad revenue. Brands pay only for real views.',
  keywords: ['creator monetization', 'AI product placement', 'video advertising', 'CPM marketing', 'influencer marketing'],
  authors: [{ name: 'SceneSwap' }],
  creator: 'SceneSwap',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sceneswap.app'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'SceneSwap',
    title: 'SceneSwap — AI Product Placement for Creators & Brands',
    description:
      'AI places your brand product naturally into creator videos. Creators earn 70%. Brands pay per real view.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SceneSwap — AI Product Placement',
    description: 'AI places your brand product naturally into creator videos.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(5,2,26,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-syne font-bold text-lime group-hover:drop-shadow-[0_0_8px_rgba(200,255,0,0.6)] transition-all">⬡</span>
            <span className="text-xl font-syne font-bold text-text-primary">SceneSwap</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/for-brands" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-dm">
              For Brands
            </Link>
            <Link href="/creator/signup" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-dm">
              For Creators
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors font-dm hidden sm:block">
              Log In
            </Link>
            <Link href="/creator/signup" className="btn-primary text-sm py-2 px-5">
              Join Free →
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-16">{children}</main>

      <footer className="border-t border-white/5 mt-10" style={{ background: 'rgba(5,2,26,0.95)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-syne font-bold text-lime">⬡</span>
              <span className="text-lg font-syne font-bold text-text-primary">SceneSwap</span>
              <span className="text-xs text-text-muted font-dm ml-2">AI Product Placement</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-text-muted font-dm">
              <Link href="/for-brands" className="hover:text-text-secondary transition-colors">For Brands</Link>
              <Link href="/creator/signup" className="hover:text-text-secondary transition-colors">For Creators</Link>
              <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
            </div>

            <p className="text-sm text-text-muted font-dm">© 2026 SceneSwap</p>
          </div>
        </div>
      </footer>
    </>
  )
}
