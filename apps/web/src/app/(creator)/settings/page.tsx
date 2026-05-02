'use client'

import { useState } from 'react'
import { Settings, User, Bell, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { getIdToken } from '@/lib/clients/firebase'

export default function CreatorSettingsPage() {
  const { user, creatorProfile } = useAuthStore()
  const [displayName, setDisplayName] = useState(creatorProfile?.display_name ?? '')
  const [upiId, setUpiId] = useState(creatorProfile?.upi_id ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [notifEarnings, setNotifEarnings] = useState(true)
  const [notifCampaigns, setNotifCampaigns] = useState(true)

  async function handleSaveProfile() {
    setSaving(true)
    setSaved(false)
    try {
      const token = await getIdToken()
      await fetch('/api/creator/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, upi_id: upiId }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings size={24} className="text-lime" />
        <h1 className="text-h2 font-syne text-text-primary">Settings</h1>
      </div>

      {/* Profile */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <User size={16} className="text-lime" />
          <h3 className="text-h3 font-syne text-text-primary">Profile</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Display Name</label>
            <input
              type="text"
              className="input w-full"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name on SceneSwap"
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Email</label>
            <input
              type="email"
              className="input w-full opacity-60 cursor-not-allowed"
              value={user?.email ?? ''}
              disabled
            />
            <p className="text-xs text-text-muted mt-1">Email cannot be changed here.</p>
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">PayPal or Bank Account</label>
            <input
              type="text"
              className="input w-full"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="PayPal email or account number"
            />
            <p className="text-xs text-text-muted mt-1">
              Earnings are transferred here every Monday for the previous week.
            </p>
          </div>
        </div>

        <Button onClick={handleSaveProfile} loading={saving} className="mt-4 w-full">
          {saved ? 'Saved!' : 'Save Profile'}
        </Button>
      </div>

      {/* Notifications */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={16} className="text-lime" />
          <h3 className="text-h3 font-syne text-text-primary">Notifications</h3>
        </div>

        <div className="space-y-3">
          {[
            { id: 'earnings', label: 'Earnings & payouts', sub: 'When views are verified and money is credited', checked: notifEarnings, set: setNotifEarnings },
            { id: 'campaigns', label: 'New campaigns', sub: 'When campaigns matching your profile are available', checked: notifCampaigns, set: setNotifCampaigns },
          ].map(item => (
            <label key={item.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={e => item.set(e.target.checked)}
                className="mt-1 w-4 h-4 accent-lime"
              />
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.sub}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card border-error/20">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={16} className="text-error" />
          <h3 className="text-h3 font-syne text-text-primary">Account</h3>
        </div>
        <p className="text-sm text-text-muted mb-4">
          Need to close your account? Email us at support@sceneswap.com
        </p>
        <button className="text-sm text-error hover:underline">
          Request account deletion →
        </button>
      </div>
    </div>
  )
}
