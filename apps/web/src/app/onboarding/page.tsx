'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { getIdToken } from '@/lib/clients/firebase'
import { Button } from '@/components/ui/Button/Button'
import { AlertCircle, CheckCircle } from 'lucide-react'

const NICHES = ['Lifestyle', 'Tech', 'Food', 'Travel', 'Fashion', 'Gaming', 'Fitness', 'Finance', 'Beauty', 'Education']
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter']

export default function CreatorOnboardingPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Identity
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])

  // Step 2: Audience
  const [platform, setPlatform] = useState('Instagram')
  const [handle, setHandle] = useState('')
  const [followerCount, setFollowerCount] = useState('')
  const [location, setLocation] = useState('')

  // Step 3: Payout
  const [upiId, setUpiId] = useState('')

  function toggleNiche(n: string) {
    setSelectedNiches(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : prev.length < 3 ? [...prev, n] : prev
    )
  }

  async function handleSubmit() {
    setSaving(true)
    setError('')
    try {
      const token = await getIdToken()
      const handleField: Record<string, string> = {}
      if (platform === 'Instagram') handleField.instagram_handle = handle
      else if (platform === 'YouTube') handleField.youtube_handle = handle
      else if (platform === 'TikTok') handleField.tiktok_handle = handle

      const res = await fetch('/api/creator/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          niche: selectedNiches.map(n => n.toLowerCase()),
          follower_count: parseInt(followerCount) || 0,
          country: location,
          upi_id: upiId || null,
          ...handleField,
        }),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      router.push('/dashboard')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-syne font-bold text-lime mb-1">⬡ SceneSwap</div>
          <h1 className="text-h2 font-syne text-text-primary mb-2">Set up your creator profile</h1>
          <p className="text-text-secondary text-sm">
            Takes 2 minutes · Helps brands match you with the right campaigns
          </p>
        </div>

        {/* Step pills */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                s < step ? 'bg-lime text-black' : s === step ? 'border-2 border-lime text-lime' : 'bg-surface-3 text-text-muted'
              }`}>
                {s < step ? <CheckCircle size={14} /> : s}
              </div>
              {s < 3 && <div className="w-8 h-px bg-surface-3" />}
            </div>
          ))}
        </div>

        <div className="card">
          {/* Step 1: Who are you */}
          {step === 1 && (
            <div>
              <h2 className="text-h3 font-syne text-text-primary mb-5">About you</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Display Name *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="How you appear to brands"
                  />
                </div>

                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">
                    Your niches <span className="text-text-muted">(pick up to 3)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NICHES.map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => toggleNiche(n)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          selectedNiches.includes(n)
                            ? 'border-lime bg-lime/10 text-lime'
                            : 'border-border text-text-secondary hover:border-surface-3'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-6"
                onClick={() => setStep(2)}
                disabled={!displayName.trim() || selectedNiches.length === 0}
              >
                Next →
              </Button>
            </div>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <div>
              <h2 className="text-h3 font-syne text-text-primary mb-5">Your audience</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Primary platform</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlatform(p)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          platform === p
                            ? 'border-lime bg-lime/10 text-lime'
                            : 'border-border text-text-secondary hover:border-surface-3'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">
                    {platform} handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">@</span>
                    <input
                      type="text"
                      className="input w-full pl-7"
                      value={handle}
                      onChange={e => setHandle(e.target.value.replace('@', ''))}
                      placeholder="yourhandle"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Follower count (approx.)</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={followerCount}
                    onChange={e => setFollowerCount(e.target.value)}
                    placeholder="e.g. 15000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">Location (city/state)</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>Next →</Button>
              </div>
            </div>
          )}

          {/* Step 3: Payout */}
          {step === 3 && (
            <div>
              <h2 className="text-h3 font-syne text-text-primary mb-2">Payout setup</h2>
              <p className="text-text-secondary text-sm mb-5">
                Earnings are transferred every Monday via UPI. You can add this later from Settings.
              </p>

              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">
                  UPI ID <span className="text-text-muted">(optional, add later)</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
                <p className="text-xs text-text-muted mt-1.5">
                  We support all major UPI apps — GPay, PhonePe, Paytm, BHIM
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                  <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                <Button className="flex-1" onClick={handleSubmit} loading={saving}>
                  {saving ? 'Setting up…' : 'Go to Dashboard →'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          You can update all of this anytime from Settings
        </p>
      </div>
    </div>
  )
}
