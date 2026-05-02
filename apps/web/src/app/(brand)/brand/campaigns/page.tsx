'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Megaphone } from 'lucide-react'
import { Badge } from '@/components/ui/Badge/Badge'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { getIdToken } from '@/lib/clients/firebase'
import type { Campaign } from '@sceneswap/types'

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getIdToken()
        const res = await fetch('/api/brand/campaigns', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setCampaigns(data.campaigns ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const statusVariant = (s: string) => {
    if (s === 'active') return 'active'
    if (s === 'pending_approval') return 'pending'
    if (s === 'rejected') return 'error'
    return 'info'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-h2 font-syne text-text-primary">Campaigns</h1>
        <Link href="/brand/campaigns/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Create your first campaign and start placing your brand in creator content."
          action={{ label: 'Create Campaign', onClick: () => window.location.href = '/brand/campaigns/new' }}
        />
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => (
            <Link
              key={c.id}
              href={`/brand/campaigns/${c.id}`}
              className="card flex items-center justify-between hover:border-lime/20 transition-all block"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium text-text-primary">{c.title}</p>
                  <Badge variant={statusVariant(c.status)}>{c.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-text-muted">
                  ${c.cpm_rate}/1K views · ${c.total_budget?.toLocaleString('en-US')} budget · {c.surface_preference}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lime text-sm">${c.spent_amount?.toLocaleString('en-US')} spent</p>
                <p className="text-xs text-text-muted mt-0.5">→</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
