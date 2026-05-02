'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Megaphone, Users, Briefcase, Wallet, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { signOutUser } from '@/lib/clients/firebase'
import { useAuthInit } from '@/lib/hooks/useAuth'
import { NotificationBell } from '@/components/ui/NotificationBell/NotificationBell'

const navItems = [
  { href: '/brand/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/brand/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/brand/creators', label: 'Creators', icon: Users },
  { href: '/brand/brand-kit', label: 'Brand Kit', icon: Briefcase },
  { href: '/brand/wallet', label: 'Wallet', icon: Wallet },
]

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  useAuthInit()
  const pathname = usePathname()
  const router = useRouter()
  const { brandProfile, clearAll } = useAuthStore()

  async function handleSignOut() {
    await signOutUser()
    clearAll()
    router.push('/')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sidebar">
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-syne font-bold text-lime">⬡</span>
            <span className="text-xl font-syne font-bold text-text-primary">SceneSwap</span>
          </Link>
          <NotificationBell />
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item ${pathname.startsWith(href) ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {brandProfile && (
          <div className="card mb-4">
            <p className="text-xs text-text-muted mb-1">Wallet</p>
            <p className="text-metric-sm font-mono text-lime">
              ${brandProfile.wallet_balance?.toLocaleString('en-US') ?? '0'}
            </p>
            <Link href="/brand/wallet" className="text-xs text-lime hover:underline mt-1 inline-block">
              Add funds →
            </Link>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-sm font-bold">
              {brandProfile?.brand_name?.[0] ?? 'B'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {brandProfile?.brand_name ?? 'Brand'}
              </p>
            </div>
          </div>
          <button onClick={handleSignOut} className="sidebar-nav-item w-full text-text-muted hover:text-error">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="page-with-sidebar flex-1">{children}</div>
    </div>
  )
}
