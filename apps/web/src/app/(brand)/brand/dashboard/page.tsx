import Link from 'next/link'
import { Eye, DollarSign, Megaphone, TrendingUp, Plus } from 'lucide-react'
import { MetricCard } from '@/components/ui/MetricCard/MetricCard'
import { Button } from '@/components/ui/Button/Button'
import { Badge } from '@/components/ui/Badge/Badge'

export default function BrandDashboardPage() {
  const metrics = [
    { label: 'Total Views', value: '0', icon: Eye },
    { label: 'Active Campaigns', value: '0', icon: Megaphone },
    { label: 'Wallet Balance', value: '$0', icon: DollarSign, highlight: true },
    { label: 'Total Spent', value: '$0', icon: TrendingUp },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h2 font-syne text-text-primary mb-1">Brand Dashboard</h1>
          <p className="text-text-secondary">Track your campaigns and reach</p>
        </div>
        <Link href="/brand/campaigns/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Campaign
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(m => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Empty states */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-h3 font-syne text-text-primary mb-4">Active Campaigns</h3>
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🚀</p>
            <p className="text-text-secondary text-sm mb-4">No campaigns yet</p>
            <Link href="/brand/campaigns/new">
              <Button size="sm">Create First Campaign</Button>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-h3 font-syne text-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/brand/campaigns/new" className="btn-secondary w-full flex items-center gap-3 justify-start">
              <Plus size={16} className="text-lime" />
              Create new campaign
            </Link>
            <Link href="/brand/wallet" className="btn-secondary w-full flex items-center gap-3 justify-start">
              <DollarSign size={16} />
              Add funds to wallet
            </Link>
            <Link href="/brand/creators" className="btn-secondary w-full flex items-center gap-3 justify-start">
              <Eye size={16} />
              Browse creator marketplace
            </Link>
            <Link href="/brand/brand-kit" className="btn-secondary w-full flex items-center gap-3 justify-start">
              <Megaphone size={16} />
              Upload brand assets
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
