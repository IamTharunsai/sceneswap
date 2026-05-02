'use client'

import { useEffect, useState } from 'react'
import { BarChart2, Eye, MousePointer, TrendingUp } from 'lucide-react'
import { MetricCard } from '@/components/ui/MetricCard/MetricCard'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { getIdToken } from '@/lib/clients/firebase'
import { formatViews } from '@/lib/utils/numbers'
import { formatEarnings } from '@/lib/utils/earnings'

interface AnalyticsSummary {
  totalViews: number
  totalClicks: number
  totalEarnings: number
  activeVideos: number
  topVideo: {
    campaignTitle: string
    views: number
    earnings: number
  } | null
}

export default function CreatorAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getIdToken()
        const res = await fetch('/api/creator/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const json = await res.json()
          setData(json.summary)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const summary = data ?? {
    totalViews: 0,
    totalClicks: 0,
    totalEarnings: 0,
    activeVideos: 0,
    topVideo: null,
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BarChart2 size={24} className="text-lime" />
        <h1 className="text-h2 font-syne text-text-primary">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Views"
          value={formatViews(summary.totalViews)}
          icon={Eye}
        />
        <MetricCard
          label="Total Clicks"
          value={formatViews(summary.totalClicks)}
          icon={MousePointer}
        />
        <MetricCard
          label="Total Earned"
          value={formatEarnings(summary.totalEarnings)}
          icon={TrendingUp}
          highlight
        />
        <MetricCard
          label="Active Videos"
          value={summary.activeVideos.toString()}
          icon={BarChart2}
        />
      </div>

      {summary.topVideo ? (
        <div className="card mb-6">
          <h3 className="text-h3 font-syne text-text-primary mb-4">Top Performing Video</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">{summary.topVideo.campaignTitle}</p>
              <p className="text-sm text-text-muted">{formatViews(summary.topVideo.views)} views</p>
            </div>
            <p className="font-mono text-lime font-semibold">{formatEarnings(summary.topVideo.earnings)}</p>
          </div>
        </div>
      ) : null}

      <div className="card">
        <h3 className="text-h3 font-syne text-text-primary mb-4">Views Over Time</h3>
        <div className="h-48 flex items-center justify-center">
          <p className="text-text-muted text-sm">
            Chart will appear once your videos start getting views.
          </p>
        </div>
      </div>
    </div>
  )
}
