'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, Users, DollarSign, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/Badge/Badge'
import { MetricCard } from '@/components/ui/MetricCard/MetricCard'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { getIdToken } from '@/lib/clients/firebase'
import { formatViews } from '@/lib/utils/numbers'
import { formatEarnings } from '@/lib/utils/earnings'

interface CampaignDetail {
  id: string
  title: string
  status: string
  cpmRate: number
  totalBudget: number
  spentAmount: number
  surfacePreference: string
  createdAt: string
  assignments: {
    id: string
    creatorName: string
    status: string
    viewsVerified: number
    earningsAmount: number
    trackingCode: string | null
  }[]
}

const statusVariant = (s: string) => {
  if (s === 'active') return 'active' as const
  if (s === 'pending_approval') return 'pending' as const
  if (s === 'rejected') return 'error' as const
  return 'info' as const
}

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getIdToken()
        const res = await fetch(`/api/brand/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setCampaign(data.campaign)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [campaignId])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  if (!campaign) return <div className="text-text-muted text-center py-16">Campaign not found.</div>

  const totalViews = campaign.assignments.reduce((sum, a) => sum + a.viewsVerified, 0)
  const budgetUsedPct = campaign.totalBudget > 0 ? Math.min(100, (campaign.spentAmount / campaign.totalBudget) * 100) : 0

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/brand/campaigns" className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-h2 font-syne text-text-primary">{campaign.title}</h1>
            <Badge variant={statusVariant(campaign.status)}>
              {campaign.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-text-muted mt-1">
            {campaign.surfacePreference} · ${campaign.cpmRate}/1K views · Created {new Date(campaign.createdAt).toLocaleDateString('en-US')}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Views" value={formatViews(totalViews)} icon={Eye} />
        <MetricCard label="Active Creators" value={campaign.assignments.filter(a => ['ready', 'posted'].includes(a.status)).length.toString()} icon={Users} />
        <MetricCard label="Amount Spent" value={formatEarnings(campaign.spentAmount)} icon={DollarSign} highlight />
        <MetricCard label="Total Budget" value={formatEarnings(campaign.totalBudget)} icon={Calendar} />
      </div>

      {/* Budget progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-text-secondary">Budget utilisation</p>
          <p className="text-sm font-mono text-text-primary">{budgetUsedPct.toFixed(1)}%</p>
        </div>
        <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-lime rounded-full transition-all"
            style={{ width: `${budgetUsedPct}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">
          ${campaign.spentAmount.toLocaleString('en-US')} spent of ${campaign.totalBudget.toLocaleString('en-US')} total
        </p>
      </div>

      {/* Creator assignments */}
      <div className="card">
        <h3 className="text-h3 font-syne text-text-primary mb-4">
          Creator Videos ({campaign.assignments.length})
        </h3>

        {campaign.assignments.length === 0 ? (
          <p className="text-text-muted text-center py-8 text-sm">
            No creators matched yet. Check back once your campaign is active.
          </p>
        ) : (
          <div className="space-y-3">
            {campaign.assignments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center font-bold text-xs text-text-primary">
                    {a.creatorName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{a.creatorName}</p>
                    {a.trackingCode && (
                      <p className="text-xs text-text-muted font-mono">{a.trackingCode}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-mono text-text-primary">{formatViews(a.viewsVerified)} views</p>
                    <p className="text-xs text-lime font-mono">{formatEarnings(a.earningsAmount)}</p>
                  </div>
                  <Badge variant={statusVariant(a.status)}>{a.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
