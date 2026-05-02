'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Video } from 'lucide-react'
import { Badge } from '@/components/ui/Badge/Badge'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { getIdToken } from '@/lib/clients/firebase'
import { formatEarnings } from '@/lib/utils/earnings'
import { formatViews } from '@/lib/utils/numbers'

export default function VideosPage() {
  const [videos, setVideos] = useState<{
    id: string
    campaignTitle: string
    brandName: string
    views: number
    rate: number
    earned: number
    status: string
    trackingCode: string | null
    renderedUrl: string | null
  }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getIdToken()
        const res = await fetch('/api/creator/videos', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setVideos(data.videos ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <div>
      <h1 className="text-h2 font-syne text-text-primary mb-8">My Videos</h1>

      {videos.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No videos yet"
          description="Accept a campaign to upload your first video and start earning."
          action={{ label: 'Browse Campaigns', onClick: () => window.location.href = '/campaigns/available' }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {videos.map(v => (
            <div key={v.id} className="card hover:border-lime/20 transition-all">
              {/* Thumbnail placeholder */}
              <div className="h-36 bg-surface-2 rounded-lg mb-4 flex items-center justify-center">
                <Video size={32} className="text-text-muted" />
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-text-primary">{v.campaignTitle}</p>
                  <p className="text-sm text-text-muted">{v.brandName}</p>
                </div>
                <Badge variant={
                  v.status === 'ready' || v.status === 'posted' ? 'active' :
                  v.status === 'rendering' ? 'pending' : 'info'
                }>
                  {v.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                <span className="text-text-muted">{formatViews(v.views)} views</span>
                <span className="font-mono text-lime font-semibold">{formatEarnings(v.earned)}</span>
              </div>

              {(v.status === 'ready' || v.status === 'posted') && (
                <Link href={`/videos/${v.id}`} className="btn-secondary w-full text-center mt-3 text-sm py-2">
                  View & Share →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
