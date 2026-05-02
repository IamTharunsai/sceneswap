export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { MetricCard } from '@/components/ui/MetricCard/MetricCard'
import { Badge } from '@/components/ui/Badge/Badge'
import { Users, Megaphone, DollarSign, Video } from 'lucide-react'
import { formatEarnings } from '@/lib/utils/earnings'

async function getAdminStats() {
  const supabase = createAdminClient()

  const [
    { count: creatorCount },
    { count: brandCount },
    { count: campaignCount },
    { data: pendingCampaigns },
  ] = await Promise.all([
    supabase.from('creator_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('brand_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    supabase
      .from('campaigns')
      .select('*, brand:brand_profiles(brand_name)')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return {
    creatorCount: creatorCount ?? 0,
    brandCount: brandCount ?? 0,
    campaignCount: campaignCount ?? 0,
    pendingCampaigns: pendingCampaigns ?? [],
  }
}

export default async function AdminPage() {
  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-syne font-bold text-lime">⬡</span>
              <span className="text-xl font-syne font-bold text-text-primary">SceneSwap</span>
              <Badge variant="error">Admin</Badge>
            </div>
            <p className="text-text-secondary text-sm">Internal admin panel</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Creators" value={stats.creatorCount.toString()} icon={Users} />
          <MetricCard label="Total Brands" value={stats.brandCount.toString()} icon={Megaphone} />
          <MetricCard label="Total Campaigns" value={stats.campaignCount.toString()} icon={Video} />
          <MetricCard label="Platform Revenue" value="$0" icon={DollarSign} highlight />
        </div>

        {/* Pending approval queue */}
        <div className="card">
          <h3 className="text-h3 font-syne text-text-primary mb-4">
            Campaigns Pending Approval ({stats.pendingCampaigns.length})
          </h3>

          {stats.pendingCampaigns.length === 0 ? (
            <p className="text-text-muted text-center py-8">No campaigns waiting for approval</p>
          ) : (
            <div className="space-y-3">
              {stats.pendingCampaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">{c.title}</p>
                    <p className="text-sm text-text-muted">
                      {(c.brand as { brand_name: string })?.brand_name} · ${c.total_budget?.toLocaleString('en-US')} budget · ${c.cpm_rate} CPM
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AdminApproveButton campaignId={c.id} action="active" />
                    <AdminApproveButton campaignId={c.id} action="rejected" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin nav */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[
            { href: '/admin/creators', label: 'Manage Creators' },
            { href: '/admin/brands', label: 'Manage Brands' },
            { href: '/admin/campaigns', label: 'All Campaigns' },
            { href: '/admin/payouts', label: 'Process Payouts' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="btn-secondary text-center py-3">
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminApproveButton({ campaignId, action }: { campaignId: string; action: string }) {
  return (
    <form action={`/api/admin/campaigns/${campaignId}/${action}`} method="POST">
      <button
        type="submit"
        className={`text-sm px-3 py-1.5 rounded-lg ${action === 'active' ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-error/20 text-error hover:bg-error/30'}`}
      >
        {action === 'active' ? 'Approve' : 'Reject'}
      </button>
    </form>
  )
}
