import { Suspense } from 'react'
import Link from 'next/link'
import { TrendingUp, Video, DollarSign, Eye, Megaphone } from 'lucide-react'
import { MetricCard } from '@/components/ui/MetricCard/MetricCard'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { formatEarnings } from '@/lib/utils/earnings'
import { formatViews } from '@/lib/utils/numbers'
import { createClient } from '@/lib/clients/supabase-server'

async function getDashboardData() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  // Get available campaigns count
  const { count: availableCount } = await supabase
    .from('creator_campaign_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  return {
    availableCampaigns: availableCount ?? 0,
    totalEarned: 0,
    pendingPayout: 0,
    totalViews: 0,
    activeVideos: 0,
  }
}

export default async function CreatorDashboardPage() {
  // In production, fetch real data. For MVP, show empty state with prompts.
  const stats = [
    { label: 'Videos Active', value: '0', icon: Video },
    { label: 'Total Earned', value: '$0', icon: DollarSign, highlight: true },
    { label: 'Pending Payout', value: '$0', icon: TrendingUp },
    { label: 'Total Views', value: '0', icon: Eye },
  ]

  return (
    <div>
      {/* Campaign alert banner */}
      <div className="card-highlight mb-8 flex items-center justify-between animate-pulse-lime">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center">
            <Megaphone size={16} className="text-lime" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Brand campaigns are waiting for you</p>
            <p className="text-sm text-text-secondary">Accept a campaign and start earning today</p>
          </div>
        </div>
        <Link href="/campaigns/available" className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap">
          View Campaigns →
        </Link>
      </div>

      <h1 className="text-h2 font-syne text-text-primary mb-6">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <MetricCard key={s.label} label={s.label} value={s.value} icon={s.icon} highlight={s.highlight} />
        ))}
      </div>

      {/* Earnings chart placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-h3 font-syne text-text-primary mb-4">Earnings (30 days)</h3>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl mb-2">📈</p>
              <p className="text-text-muted text-sm">Upload your first video to see earnings</p>
              <Link href="/campaigns/available" className="text-lime text-sm hover:underline mt-2 inline-block">
                Browse campaigns →
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-h3 font-syne text-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/campaigns/available" className="btn-secondary w-full flex items-center gap-3 justify-start">
              <Megaphone size={16} className="text-lime" />
              Browse available campaigns
            </Link>
            <Link href="/videos" className="btn-secondary w-full flex items-center gap-3 justify-start">
              <Video size={16} />
              My video library
            </Link>
            <Link href="/earnings" className="btn-secondary w-full flex items-center gap-3 justify-start">
              <DollarSign size={16} />
              Set up payout details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
