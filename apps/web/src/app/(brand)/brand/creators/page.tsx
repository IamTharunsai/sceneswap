'use client'

import { useEffect, useState } from 'react'
import { Users, Search, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/Badge/Badge'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { getIdToken } from '@/lib/clients/firebase'
import { formatViews } from '@/lib/utils/numbers'

interface Creator {
  id: string
  displayName: string
  niche: string
  followerCount: number
  avgViews: number
  totalVideos: number
  rating: number
  location: string
}

export default function BrandCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [nicheFilter, setNicheFilter] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = await getIdToken()
        const params = new URLSearchParams()
        if (search) params.set('q', search)
        if (nicheFilter) params.set('niche', nicheFilter)

        const res = await fetch(`/api/brand/creators?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setCreators(data.creators ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, nicheFilter])

  const niches = ['Lifestyle', 'Tech', 'Food', 'Travel', 'Fashion', 'Gaming', 'Fitness', 'Finance']

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-h2 font-syne text-text-primary">Creator Marketplace</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            className="input w-full pl-9"
            placeholder="Search creators…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <select
            className="input pl-9 pr-4 appearance-none"
            value={nicheFilter}
            onChange={e => setNicheFilter(e.target.value)}
          >
            <option value="">All niches</option>
            {niches.map(n => <option key={n} value={n.toLowerCase()}>{n}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      ) : creators.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No creators found"
          description="Try adjusting your filters, or creators will appear here once they join."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map(c => (
            <div key={c.id} className="card hover:border-lime/20 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center font-bold text-text-primary shrink-0">
                  {c.displayName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{c.displayName}</p>
                  <p className="text-xs text-text-muted truncate">{c.location}</p>
                </div>
                <Badge variant="info">{c.niche}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-3">
                <div>
                  <p className="font-mono text-sm text-lime font-semibold">{formatViews(c.followerCount)}</p>
                  <p className="text-xs text-text-muted">followers</p>
                </div>
                <div>
                  <p className="font-mono text-sm text-text-primary">{formatViews(c.avgViews)}</p>
                  <p className="text-xs text-text-muted">avg views</p>
                </div>
                <div>
                  <p className="font-mono text-sm text-text-primary">{c.totalVideos}</p>
                  <p className="text-xs text-text-muted">videos</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
