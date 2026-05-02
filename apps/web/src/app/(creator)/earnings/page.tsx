'use client'

import { useState, useEffect } from 'react'
import { getIdToken } from '@/lib/clients/firebase'
import { useAuthStore } from '@/store/useAuthStore'
import { Badge } from '@/components/ui/Badge/Badge'
import { Button } from '@/components/ui/Button/Button'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { formatEarnings } from '@/lib/utils/earnings'
import { formatViews } from '@/lib/utils/numbers'

export default function EarningsPage() {
  const { creatorProfile } = useAuthStore()
  const [videos, setVideos] = useState<{
    id: string
    campaignTitle: string
    brandName: string
    views: number
    rate: number
    earned: number
    status: string
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [bankForm, setBankForm] = useState({ upiId: '', bankAccount: '', ifsc: '' })
  const [saving, setSaving] = useState(false)

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

  async function saveBankDetails() {
    setSaving(true)
    try {
      const token = await getIdToken()
      await fetch('/api/creator/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bankForm),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-h2 font-syne text-text-primary mb-8">Earnings</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-xs text-text-muted mb-1">Total Earned</p>
          <p className="text-metric-sm font-mono text-lime">{formatEarnings(creatorProfile?.total_earned ?? 0)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-text-muted mb-1">Pending Payout</p>
          <p className="text-metric-sm font-mono text-warning">{formatEarnings(creatorProfile?.pending_payout ?? 0)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-text-muted mb-1">Payouts sent</p>
          <p className="text-metric-sm font-mono text-text-primary">$0</p>
        </div>
      </div>

      {/* Videos earnings table */}
      <div className="card mb-8">
        <h3 className="text-h3 font-syne text-text-primary mb-4">Earnings Breakdown</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : videos.length === 0 ? (
          <p className="text-center text-text-muted py-8">No earnings yet. Accept a campaign to start earning.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-border">
                  <th className="text-left pb-3 font-medium">Campaign</th>
                  <th className="text-right pb-3 font-medium">Views</th>
                  <th className="text-right pb-3 font-medium">Rate</th>
                  <th className="text-right pb-3 font-medium">Earned</th>
                  <th className="text-right pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {videos.map(v => (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="py-3">
                      <p className="text-text-primary">{v.campaignTitle}</p>
                      <p className="text-xs text-text-muted">{v.brandName}</p>
                    </td>
                    <td className="text-right font-mono text-text-primary py-3">{formatViews(v.views)}</td>
                    <td className="text-right text-text-secondary py-3">${v.rate}/1K</td>
                    <td className="text-right font-mono text-lime font-semibold py-3">{formatEarnings(v.earned)}</td>
                    <td className="text-right py-3">
                      <Badge variant={v.status === 'completed' ? 'active' : 'pending'}>{v.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout details */}
      <div className="card">
        <h3 className="text-h3 font-syne text-text-primary mb-4">Payout Details</h3>
        <p className="text-text-secondary text-sm mb-4">
          We send payouts weekly on Fridays. Add your PayPal or bank account to receive payments.
        </p>
        <div className="space-y-3">
          <input
            className="input"
            placeholder="PayPal email or account number"
            value={bankForm.upiId}
            onChange={e => setBankForm(f => ({ ...f, upiId: e.target.value }))}
          />
          <div className="divider" />
          <p className="text-sm text-text-muted">Or bank account:</p>
          <input
            className="input"
            placeholder="Bank account number"
            value={bankForm.bankAccount}
            onChange={e => setBankForm(f => ({ ...f, bankAccount: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Routing number (ABA)"
            value={bankForm.ifsc}
            onChange={e => setBankForm(f => ({ ...f, ifsc: e.target.value }))}
          />
          <Button onClick={saveBankDetails} loading={saving} variant="secondary" className="w-full">
            Save Payout Details
          </Button>
        </div>
      </div>
    </div>
  )
}
