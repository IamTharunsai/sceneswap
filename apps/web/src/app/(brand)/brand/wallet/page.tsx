'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
import { DollarSign, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000]

export default function BrandWalletPage() {
  const { brandProfile } = useAuthStore()
  const [amount, setAmount] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAddFunds() {
    if (amount < 50) { setError('Minimum deposit is $50'); return }
    setLoading(true)
    setError('')
    try {
      // Create Razorpay order (when Razorpay is ready)
      const res = await fetch('/api/brand/wallet/add-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) throw new Error('Failed to initiate payment')
      const { orderId } = await res.json()

      // TODO: Open Stripe checkout when keys are available
      alert(`Payment flow coming soon! Order ID: ${orderId}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-h2 font-syne text-text-primary mb-8">Wallet</h1>

      {/* Balance card */}
      <div className="card-highlight mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-lime/20 flex items-center justify-center">
            <DollarSign size={20} className="text-lime" />
          </div>
          <p className="text-text-secondary">Available Balance</p>
        </div>
        <p className="text-metric font-mono text-lime mb-1">
          ${(brandProfile?.wallet_balance ?? 0).toLocaleString('en-US')}
        </p>
        <p className="text-sm text-text-muted">
          Total spent: ${(brandProfile?.total_spent ?? 0).toLocaleString('en-US')}
        </p>
      </div>

      {/* Add funds */}
      <div className="card mb-6">
        <h3 className="text-h3 font-syne text-text-primary mb-4">Add Funds</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_AMOUNTS.map(a => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                amount === a ? 'border-lime bg-lime/10 text-lime' : 'border-border text-text-secondary hover:border-surface-3'
              }`}
            >
              ${a.toLocaleString('en-US')}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="number"
            className="input flex-1"
            value={amount}
            onChange={e => setAmount(parseInt(e.target.value) || 0)}
            min="50"
            step="50"
            placeholder="Custom amount"
          />
        </div>

        {error && <p className="text-sm text-error mb-3">{error}</p>}

        <Button onClick={handleAddFunds} loading={loading} className="w-full">
          <Plus size={16} />
          Add ${amount.toLocaleString('en-US')} to Wallet
        </Button>

        <p className="text-xs text-text-muted mt-3 text-center">
          Payments via Cards, ACH, PayPal (Stripe) · Minimum $50
        </p>
      </div>

      {/* Transaction history placeholder */}
      <div className="card">
        <h3 className="text-h3 font-syne text-text-primary mb-4">Transaction History</h3>
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">No transactions yet</p>
        </div>
      </div>
    </div>
  )
}
