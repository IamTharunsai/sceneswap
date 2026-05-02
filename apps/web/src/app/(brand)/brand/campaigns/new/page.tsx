'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { getIdToken } from '@/lib/clients/firebase'

const STEPS = ['Details', 'Product', 'Asset', 'Targeting', 'Budget']

const PRODUCT_TYPES = [
  { value: 'beverage',    label: '🥤 Beverage',    desc: 'Drinks, bottles, cans, energy drinks' },
  { value: 'food',        label: '🍫 Food',         desc: 'Packaged food, snacks, condiments' },
  { value: 'electronics', label: '📱 Electronics',  desc: 'Phones, laptops, earbuds, gadgets' },
  { value: 'apparel',     label: '👟 Apparel',      desc: 'Clothing, shoes, bags, accessories' },
  { value: 'beauty',      label: '💄 Beauty',       desc: 'Skincare, cosmetics, personal care' },
  { value: 'home_decor',  label: '🏠 Home & Decor', desc: 'Furniture, decor, household products' },
  { value: 'books',       label: '📚 Books',        desc: 'Books, notebooks, stationery' },
  { value: 'fitness',     label: '💪 Fitness',      desc: 'Sports gear, supplements, equipment' },
  { value: 'other',       label: '📦 Other',        desc: 'General product or brand logo' },
]

const NICHES = ['Food', 'Fashion', 'Travel', 'Tech', 'Lifestyle', 'Fitness', 'Beauty', 'Gaming']
const REGIONS = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'All India', 'Global']

interface CampaignForm {
  title: string
  description: string
  productType: string
  productDescription: string
  brandAssetUrl: string
  brandAssetType: string
  targetNiches: string[]
  targetRegions: string[]
  minFollowers: number
  startDate: string
  endDate: string
  cpmRate: number
  totalBudget: number
}

const INITIAL: CampaignForm = {
  title: '',
  description: '',
  productType: '',
  productDescription: '',
  brandAssetUrl: '',
  brandAssetType: 'image',
  targetNiches: [],
  targetRegions: [],
  minFollowers: 1000,
  startDate: '',
  endDate: '',
  cpmRate: 8,
  totalBudget: 500,
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<CampaignForm>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingAsset, setUploadingAsset] = useState(false)

  function update<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggle(key: 'targetNiches' | 'targetRegions', item: string) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(item) ? f[key].filter(x => x !== item) : [...f[key], item],
    }))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDrop: async files => {
      if (!files[0]) return
      setUploadingAsset(true)
      try {
        const token = await getIdToken()
        const urlRes = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ filename: files[0].name, contentType: files[0].type, assignmentId: 'brand-asset' }),
        })
        const { uploadUrl, publicUrl } = await urlRes.json()
        await fetch(uploadUrl, { method: 'PUT', body: files[0], headers: { 'Content-Type': files[0].type } })
        update('brandAssetUrl', publicUrl)
        update('brandAssetType', 'image')
      } finally {
        setUploadingAsset(false)
      }
    },
  })

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const token = await getIdToken()
      const res = await fetch('/api/brand/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          surface_preference: 'object',
          product_type: form.productType,
          product_description: form.productDescription,
          cpm_rate: form.cpmRate,
          total_budget: form.totalBudget,
          target_niches: form.targetNiches,
          target_regions: form.targetRegions,
          min_followers: form.minFollowers,
          start_date: form.startDate,
          end_date: form.endDate,
          brand_asset_url: form.brandAssetUrl,
          brand_asset_type: form.brandAssetType,
          allowed_categories: [],
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create campaign')
      const data = await res.json()
      router.push(`/brand/campaigns/${data.campaignId}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const estimatedReach = Math.round(form.totalBudget / form.cpmRate) * 1000
  const selectedProductType = PRODUCT_TYPES.find(p => p.value === form.productType)

  const canAdvance = [
    step === 0 && !!form.title,
    step === 1 && !!form.productType,
    step === 2 && !!form.brandAssetUrl,
    step === 3,
    step === 4 && !!form.startDate && !!form.endDate,
  ][step] ?? true

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-h2 font-syne text-text-primary mb-2">Create Campaign</h1>
      <p className="text-text-secondary mb-8">
        AI will place your product naturally inside creator videos — like real product placement.
      </p>

      {/* Step progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-lime' : 'text-text-muted'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < step ? 'bg-lime border-lime text-black' :
                i === step ? 'border-lime text-lime' :
                'border-surface-3 text-text-muted'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs hidden sm:block whitespace-nowrap">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-lime' : 'bg-surface-3'}`} />}
          </div>
        ))}
      </div>

      <div className="card">
        {/* ── Step 0: Details ── */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-h3 font-syne text-text-primary">Campaign Details</h2>
            <div>
              <label className="text-sm text-text-secondary block mb-2">Campaign name *</label>
              <input
                className="input"
                placeholder="e.g. Pepsi Summer 2026 · boAt Monsoon Campaign"
                value={form.title}
                onChange={e => update('title', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-2">Campaign description (optional)</label>
              <textarea
                className="input min-h-[90px] resize-none"
                placeholder="What is this campaign about? Any creative direction?"
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Product Type ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-h3 font-syne text-text-primary mb-1">What are you placing?</h2>
              <p className="text-sm text-text-secondary">
                The AI uses this to find the most natural placement spots in creator videos.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {PRODUCT_TYPES.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => update('productType', pt.value)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    form.productType === pt.value
                      ? 'border-lime bg-lime/5'
                      : 'border-border hover:border-surface-3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">{pt.label.split(' ')[0]}</span>
                    <div>
                      <span className="font-medium text-text-primary text-sm">{pt.label.slice(pt.label.indexOf(' ') + 1)}</span>
                      <p className="text-xs text-text-muted mt-0.5">{pt.desc}</p>
                    </div>
                    {form.productType === pt.value && (
                      <CheckCircle size={16} className="text-lime ml-auto shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {form.productType && (
              <div>
                <label className="text-sm text-text-secondary block mb-2">
                  Describe your product (optional — helps AI place it better)
                </label>
                <input
                  className="input"
                  placeholder={`e.g. "Red Pepsi can, 330ml" · "boAt Airdopes 311 white earbuds"`}
                  value={form.productDescription}
                  onChange={e => update('productDescription', e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Asset Upload ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-h3 font-syne text-text-primary mb-1">Upload your product image</h2>
              <p className="text-sm text-text-secondary">
                This is the actual product image that gets inserted into creator videos.
                PNG with transparent background works best for natural compositing.
              </p>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                form.brandAssetUrl ? 'border-lime bg-lime/5' :
                isDragActive ? 'border-lime bg-lime/5' :
                'border-border hover:border-lime/40'
              }`}
            >
              <input {...getInputProps()} />
              {uploadingAsset ? (
                <div>
                  <div className="w-8 h-8 border-2 border-lime border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-text-secondary text-sm">Uploading...</p>
                </div>
              ) : form.brandAssetUrl ? (
                <div>
                  <CheckCircle size={32} className="mx-auto text-lime mb-3" />
                  <p className="text-lime font-medium mb-1">Product image uploaded</p>
                  <p className="text-text-muted text-xs">Click to replace</p>
                </div>
              ) : (
                <div>
                  <Upload size={32} className="mx-auto text-text-muted mb-3" />
                  <p className="text-text-primary font-medium mb-1">Drop your product image here</p>
                  <p className="text-text-muted text-sm">PNG (transparent), JPG, WebP · Max 50MB</p>
                  <p className="text-text-muted text-xs mt-3">
                    Tip: PNG with transparent background = most natural insertion result
                  </p>
                </div>
              )}
            </div>

            {selectedProductType && (
              <div className="p-3 bg-surface-2 rounded-lg border border-border text-sm text-text-secondary">
                <span className="text-lime font-medium">AI placement for {selectedProductType.label}:</span>
                {' '}The AI will look for{' '}
                {form.productType === 'beverage' && 'tables, counters, and near-hand spots in creator videos'}
                {form.productType === 'food' && 'dining surfaces, kitchen areas, and table tops'}
                {form.productType === 'electronics' && 'desks, shelves, and beside-laptop spots'}
                {form.productType === 'apparel' && 'floor space, shelves, and display areas'}
                {form.productType === 'beauty' && 'vanity surfaces, bathroom counters, and shelves'}
                {form.productType === 'home_decor' && 'shelves, mantles, and background decor spots'}
                {form.productType === 'books' && 'desks, shelves, and bedside areas'}
                {form.productType === 'fitness' && 'floor spaces and gym-adjacent surfaces'}
                {form.productType === 'other' && 'tables, shelves, and natural display areas'}
                .
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Targeting ── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-h3 font-syne text-text-primary">Creator Targeting</h2>
            <div>
              <p className="text-sm text-text-secondary mb-3">Creator niches (leave empty for all)</p>
              <div className="grid grid-cols-4 gap-2">
                {NICHES.map(n => (
                  <button
                    key={n}
                    onClick={() => toggle('targetNiches', n)}
                    className={`text-sm py-2.5 rounded-lg border transition-all ${
                      form.targetNiches.includes(n)
                        ? 'border-lime bg-lime/10 text-lime'
                        : 'border-border text-text-secondary hover:border-surface-3'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-3">Target regions (leave empty for all)</p>
              <div className="grid grid-cols-3 gap-2">
                {REGIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => toggle('targetRegions', r)}
                    className={`text-sm py-2 px-3 rounded-lg border transition-all ${
                      form.targetRegions.includes(r)
                        ? 'border-lime bg-lime/10 text-lime'
                        : 'border-border text-text-secondary hover:border-surface-3'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-2">Minimum creator followers</label>
              <input
                type="number"
                className="input"
                value={form.minFollowers}
                onChange={e => update('minFollowers', parseInt(e.target.value) || 0)}
                min="0"
                step="1000"
              />
            </div>
          </div>
        )}

        {/* ── Step 4: Budget ── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-h3 font-syne text-text-primary">Budget & Timeline</h2>
            <div>
              <label className="text-sm text-text-secondary block mb-2">CPM Rate ($ per 1,000 verified views)</label>
              <input
                type="number"
                className="input"
                value={form.cpmRate}
                onChange={e => update('cpmRate', parseInt(e.target.value) || 3)}
                min="3"
                max="100"
                step="1"
              />
              <p className="text-xs text-text-muted mt-1">Recommended: $3–$15 for most campaigns</p>
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-2">Total Budget ($)</label>
              <input
                type="number"
                className="input"
                value={form.totalBudget}
                onChange={e => update('totalBudget', parseInt(e.target.value) || 50)}
                min="50"
                step="50"
              />
              <p className="text-xs text-text-muted mt-1">Minimum $50</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-text-secondary block mb-2">Start Date *</label>
                <input type="date" className="input" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-text-secondary block mb-2">End Date *</label>
                <input type="date" className="input" value={form.endDate} onChange={e => update('endDate', e.target.value)} />
              </div>
            </div>

            {/* Reach estimate */}
            <div className="card-highlight rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary">Estimated reach</p>
                <span className="text-metric-sm font-mono text-lime">{estimatedReach.toLocaleString('en-US')}</span>
              </div>
              <p className="text-xs text-text-muted">views · at ${form.cpmRate} CPM with ${form.totalBudget.toLocaleString('en-US')} budget</p>
              <div className="mt-3 pt-3 border-t border-lime/20">
                <p className="text-xs text-text-muted">
                  Creators earn 70% · Platform fee 30% · You pay only per verified view
                </p>
              </div>
            </div>

            {/* Review summary */}
            <div className="space-y-2">
              {[
                { label: 'Campaign', value: form.title },
                { label: 'Product', value: selectedProductType?.label ?? '—' },
                { label: 'Asset', value: form.brandAssetUrl ? '✓ Uploaded' : '✗ Not uploaded' },
                { label: 'Niches', value: form.targetNiches.join(', ') || 'All niches' },
                { label: 'Regions', value: form.targetRegions.join(', ') || 'All regions' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-text-muted text-sm">{row.label}</span>
                  <span className="text-text-primary text-sm font-medium">{row.value || '—'}</span>
                </div>
              ))}
            </div>

            {error && <p className="text-error text-sm">{error}</p>}
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={16} /> Back
            </Button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance}>
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading} disabled={!canAdvance}>
              Launch Campaign 🚀
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
