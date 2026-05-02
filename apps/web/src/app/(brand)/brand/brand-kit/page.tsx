'use client'

import { useState } from 'react'
import { Upload, Palette, Image, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { getIdToken } from '@/lib/clients/firebase'

export default function BrandKitPage() {
  const { brandProfile } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(brandProfile?.logo_url ?? '')
  const [primaryColor, setPrimaryColor] = useState('#C8FF00')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const token = await getIdToken()
      const res = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, folder: 'brand-assets' }),
      })
      const { uploadUrl, publicUrl } = await res.json()
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      setLogoUrl(publicUrl)
    } catch {
      // handle silently
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaved(false)
    try {
      const token = await getIdToken()
      await fetch('/api/brand/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_url: logoUrl, website_url: websiteUrl }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // handle silently
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-h2 font-syne text-text-primary mb-2">Brand Kit</h1>
      <p className="text-text-secondary mb-8">Manage your brand assets used in creator videos.</p>

      {/* Logo */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Image size={18} className="text-lime" />
          <h3 className="text-h3 font-syne text-text-primary">Logo</h3>
        </div>

        <div className="flex items-center gap-6">
          {logoUrl ? (
            <img src={logoUrl} alt="Brand logo" className="w-20 h-20 object-contain rounded-lg bg-surface-2 p-2" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted text-xs text-center">
              No logo
            </div>
          )}
          <div>
            <label className="btn-secondary cursor-pointer text-sm flex items-center gap-2">
              <Upload size={14} />
              {uploading ? 'Uploading…' : 'Upload Logo'}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            <p className="text-xs text-text-muted mt-2">PNG or SVG · max 2MB</p>
          </div>
        </div>
      </div>

      {/* Brand color */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={18} className="text-lime" />
          <h3 className="text-h3 font-syne text-text-primary">Brand Color</h3>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="color"
            value={primaryColor}
            onChange={e => setPrimaryColor(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border border-border bg-transparent"
          />
          <div>
            <p className="font-mono text-text-primary text-sm">{primaryColor.toUpperCase()}</p>
            <p className="text-xs text-text-muted">Used as overlay tint in rendered videos</p>
          </div>
        </div>
      </div>

      {/* Brand website */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <LinkIcon size={18} className="text-lime" />
          <h3 className="text-h3 font-syne text-text-primary">Website</h3>
        </div>

        <input
          type="url"
          className="input w-full"
          value={websiteUrl}
          onChange={e => setWebsiteUrl(e.target.value)}
          placeholder="https://yourbrand.com"
        />
        <p className="text-xs text-text-muted mt-2">
          Tracking links redirect here after recording the click.
        </p>
      </div>

      {/* Brand info */}
      <div className="card mb-8 bg-lime/5 border-lime/20">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center text-lime text-sm shrink-0">
            {brandProfile?.brand_name?.[0] ?? 'B'}
          </div>
          <div>
            <p className="font-medium text-text-primary">{brandProfile?.brand_name ?? 'Your Brand'}</p>
            <p className="text-sm text-text-muted">{brandProfile?.category ?? 'Category not set'}</p>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full">
        {saved ? 'Saved!' : 'Save Brand Kit'}
      </Button>
    </div>
  )
}
