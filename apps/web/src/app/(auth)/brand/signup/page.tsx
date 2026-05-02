'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUpWithEmail, signInWithGoogle, getIdToken } from '@/lib/clients/firebase'

const CATEGORIES = ['Food & Beverage', 'Fashion & Apparel', 'Technology', 'Beauty & Personal Care', 'Health & Fitness', 'Travel & Hospitality', 'Real Estate', 'Finance', 'Education', 'Other']

export default function BrandSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '',
    password: '',
    brandName: '',
    category: '',
    gstNumber: '',
    website: '',
    contactName: '',
    contactPhone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      if (form.email) {
        await signUpWithEmail(form.email, form.password)
      }
      const idToken = await getIdToken()
      const res = await fetch('/api/brand/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, ...form }),
      })
      if (!res.ok) throw new Error('Failed to create brand profile')
      router.push('/brand/dashboard')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? 'bg-lime' : 'bg-surface-3'}`} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h1 className="text-h1 font-syne text-text-primary mb-2">Create brand account</h1>
          <p className="text-text-secondary mb-8">Start placing your brand in creator content today</p>
          <div className="card space-y-4">
            <button
              onClick={async () => { await signInWithGoogle(); setStep(2) }}
              className="btn-secondary w-full flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-text-muted">or</span>
              <div className="flex-1 border-t border-border" />
            </div>
            <input className="input" type="email" placeholder="Work email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <button onClick={() => setStep(2)} className="btn-primary w-full" disabled={!form.email || form.password.length < 8}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-h1 font-syne text-text-primary mb-2">Brand details</h1>
          <p className="text-text-secondary mb-8">Tell creators about your brand</p>
          <div className="card space-y-4">
            <input className="input" placeholder="Brand / Company name" value={form.brandName} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))} required />
            <input className="input" placeholder="Website (optional)" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
            <input className="input" placeholder="GST Number (optional)" value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))} />
            <div>
              <p className="text-sm text-text-secondary mb-3">Category</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, category: c }))}
                    className={`text-sm py-2.5 px-3 rounded-lg border transition-all text-left ${
                      form.category === c ? 'border-lime bg-lime/10 text-lime' : 'border-border text-text-secondary hover:border-surface-3'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(3)} className="btn-primary w-full" disabled={!form.brandName || !form.category}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-h1 font-syne text-text-primary mb-2">Contact details</h1>
          <p className="text-text-secondary mb-8">Who should we contact about campaigns?</p>
          <div className="card space-y-4">
            <input className="input" placeholder="Your full name" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} required />
            <input className="input" placeholder="Phone number" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} required />
            {error && <p className="text-sm text-error">{error}</p>}
            <button onClick={handleSubmit} className="btn-primary w-full" disabled={loading || !form.contactName || !form.contactPhone}>
              {loading ? 'Creating account...' : 'Launch My Brand →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
