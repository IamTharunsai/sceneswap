'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Megaphone,
  Video,
  TrendingUp,
  BarChart2,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { signOutUser } from '@/lib/clients/firebase'
import { useRouter } from 'next/navigation'
import { formatEarnings } from '@/lib/utils/earnings'
import { useAuthInit } from '@/lib/hooks/useAuth'
import { NotificationBell } from '@/components/ui/NotificationBell/NotificationBell'
import { useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns/available', label: 'Campaigns', icon: Megaphone },
  { href: '/videos', label: 'My Videos', icon: Video },
  { href: '/earnings', label: 'Earnings', icon: TrendingUp },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  useAuthInit()
  const pathname = usePathname()
  const router = useRouter()
  const { creatorProfile, loading, clearAll } = useAuthStore()

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (loading) return
    if (creatorProfile && !creatorProfile.display_name) {
      router.replace('/onboarding')
    }
  }, [creatorProfile, loading, router])

  async function handleSignOut() {
    await signOutUser()
    clearAll()
    router.push('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo + bell */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-syne font-bold text-lime">⬡</span>
            <span className="text-xl font-syne font-bold text-text-primary">SceneSwap</span>
          </Link>
          <NotificationBell />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Earnings summary */}
        {creatorProfile && (
          <div className="card mb-4">
            <p className="text-xs text-text-muted mb-1">This month</p>
            <p className="text-metric-sm font-mono text-lime">
              {formatEarnings(creatorProfile.pending_payout || 0)}
            </p>
            <p className="text-xs text-text-muted mt-1">pending payout</p>
          </div>
        )}

        {/* User */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-sm font-bold">
              {creatorProfile?.display_name?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {creatorProfile?.display_name ?? 'Creator'}
              </p>
            </div>
          </div>
          <button onClick={handleSignOut} className="sidebar-nav-item w-full text-text-muted hover:text-error">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="page-with-sidebar flex-1">{children}</div>
    </div>
  )
}
