'use client'

import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { Badge } from '@/components/ui/Badge/Badge'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { Megaphone, AlertCircle } from 'lucide-react'
import { getIdToken } from '@/lib/clients/firebase'
import { formatEarnings } from '@/lib/utils/earnings'
import { useRouter } from 'next/navigation'
import type { CreatorCampaignAssignment, Campaign, BrandProfile } from '@sceneswap/types'

type EnrichedAssignment = CreatorCampaignAssignment & {
  campaign: Campaign & { brand: BrandProfile }
}

const SURFACE_LABELS: Record<string, string> = {
  wall: '🟢 Wall/Background',
  object: '🟣 Object/Product',
  screen: '🔵 Screen/TV',
  apparel: '🟡 Clothing',
}

export default function AvailableCampaignsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<EnrichedAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<EnrichedAssignment | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = await getIdToken()
        const res = await fetch('/api/creator/campaigns', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setAssignments(data.assignments ?? [])
      } catch {
        // show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleAcceptAndUpload() {
    if (!selectedAssignment) return
    setAccepting(true)
    setAcceptError('')
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/creator/campaigns/${selectedAssignment.id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to accept campaign')
      }
      // Accepted — go to upload page
      router.push(`/campaigns/${selectedAssignment.id}/upload`)
    } catch (e) {
      setAcceptError((e as Error).message)
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h2 font-syne text-text-primary mb-2">Available Campaigns</h1>
        <p className="text-text-secondary">
          Brands matched to your profile. Accept a campaign, upload your video, and start earning.
        </p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="We match you with brands that fit your niche and audience. Check back soon — new campaigns are added daily."
          action={{ label: 'Refresh', onClick: () => window.location.reload() }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {assignments.map(a => (
            <CampaignCard key={a.id} assignment={a} onAccept={() => {
              setSelectedAssignment(a)
              setAcceptError('')
            }} />
          ))}
        </div>
      )}

      {/* Accept modal */}
      {selectedAssignment && (
        <Modal
          open
          onClose={() => { if (!accepting) setSelectedAssignment(null) }}
          title={`Accept: ${selectedAssignment.campaign.title}`}
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setSelectedAssignment(null)} disabled={accepting}>
                Cancel
              </Button>
              <Button onClick={handleAcceptAndUpload} loading={accepting}>
                {accepting ? 'Accepting…' : 'Accept & Upload Video →'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {acceptError && (
              <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
                <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
                <p className="text-sm text-error">{acceptError}</p>
              </div>
            )}

            <div className="card bg-lime/5 border-lime/20">
              <p className="text-sm font-semibold text-lime mb-2">How it works</p>
              <ol className="space-y-1.5 text-sm text-text-secondary">
                <li className="flex gap-2"><span className="text-lime font-bold shrink-0">1.</span>Upload any existing video (Instagram/TikTok/Reels)</li>
                <li className="flex gap-2"><span className="text-lime font-bold shrink-0">2.</span>AI detects the best surface for brand placement</li>
                <li className="flex gap-2"><span className="text-lime font-bold shrink-0">3.</span>Brand&apos;s logo is composited into your video automatically</li>
                <li className="flex gap-2"><span className="text-lime font-bold shrink-0">4.</span>Download the final video, post it, share your tracking link</li>
                <li className="flex gap-2"><span className="text-lime font-bold shrink-0">5.</span>Earn ${selectedAssignment.campaign.cpm_rate} per 1,000 verified views</li>
              </ol>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center card py-3">
                <p className="text-metric-sm font-mono text-lime">${selectedAssignment.campaign.cpm_rate}</p>
                <p className="text-xs text-text-muted mt-1">per 1K views</p>
              </div>
              <div className="text-center card py-3">
                <p className="text-metric-sm font-mono text-text-primary">70%</p>
                <p className="text-xs text-text-muted mt-1">you keep</p>
              </div>
              <div className="text-center card py-3">
                <p className="text-metric-sm font-mono text-text-primary capitalize">{selectedAssignment.campaign.surface_preference}</p>
                <p className="text-xs text-text-muted mt-1">surface type</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function CampaignCard({ assignment, onAccept }: { assignment: EnrichedAssignment; onAccept: () => void }) {
  const { campaign } = assignment
  const estimatedEarnings = (50000 / 1000) * campaign.cpm_rate * 0.7

  return (
    <div className="card hover:border-lime/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-lg font-bold text-text-primary">
            {campaign.brand?.brand_name?.[0] ?? 'B'}
          </div>
          <div>
            <p className="font-semibold text-text-primary">{campaign.brand?.brand_name ?? 'Brand'}</p>
            <p className="text-xs text-text-muted">{campaign.brand?.category}</p>
          </div>
        </div>
        <Badge variant="lime">
          ${campaign.cpm_rate}/1K
        </Badge>
      </div>

      <h3 className="text-text-primary font-medium mb-3">{campaign.title}</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-text-muted bg-surface-2 px-2.5 py-1 rounded-full">
          {SURFACE_LABELS[campaign.surface_preference]}
        </span>
        {campaign.target_regions?.slice(0, 2).map(r => (
          <span key={r} className="text-xs text-text-muted bg-surface-2 px-2.5 py-1 rounded-full">
            📍 {r}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-text-muted">Est. at 50K views</p>
          <p className="text-sm font-mono font-semibold text-lime">~{formatEarnings(estimatedEarnings)}</p>
        </div>
        <Button size="sm" onClick={onAccept}>
          Accept →
        </Button>
      </div>
    </div>
  )
}
