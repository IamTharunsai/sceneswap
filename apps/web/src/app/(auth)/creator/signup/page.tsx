'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUpWithEmail, signInWithGoogle, getIdToken } from '@/lib/clients/firebase'

const NICHES = ['Food', 'Fashion', 'Travel', 'Tech', 'Lifestyle', 'Fitness', 'Beauty', 'Gaming', 'Other']

export default function CreatorSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    niche: [] as string[],
    instagramHandle: '',
    youtubeHandle: '',
    city: '',
    state: '',
    followerCount: '0',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleNiche(n: string) {
    setForm(f => ({
      ...f,
      niche: f.niche.includes(n) ? f.niche.filter(x => x !== n) : [...f.niche, n],
    }))
  }

  async function handleGoogleSignup() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      await createProfile()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSignup() {
    setLoading(true)
    setError('')
    try {
      await signUpWithEmail(form.email, form.password)
      await createProfile()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function createProfile() {
    const idToken = await getIdToken()
    const res = await fetch('/api/creator/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, ...form }),
    })
    if (!res.ok) throw new Error('Failed to create profile')
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-lg">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all ${
              s <= step ? 'bg-lime' : 'bg-surface-3'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h1 className="text-h1 font-syne text-text-primary mb-2">Create your account</h1>
          <p className="text-text-secondary mb-8">Join 1,200+ creators already earning</p>

          <div className="card space-y-4">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="btn-secondary w-full flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Sign up with Google
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-text-muted">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <input
              className="input"
              type="password"
              placeholder="Password (min 8 chars)"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
            <button onClick={() => setStep(2)} className="btn-primary w-full" disabled={!form.email || form.password.length < 8}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-h1 font-syne text-text-primary mb-2">Tell us about yourself</h1>
          <p className="text-text-secondary mb-8">Help brands find the right creator</p>

          <div className="card space-y-4">
            <input
              className="input"
              placeholder="Display name (shown to brands)"
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Instagram @handle (optional)"
              value={form.instagramHandle}
              onChange={e => setForm(f => ({ ...f, instagramHandle: e.target.value }))}
            />
            <input
              className="input"
              placeholder="YouTube channel (optional)"
              value={form.youtubeHandle}
              onChange={e => setForm(f => ({ ...f, youtubeHandle: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              <input className="input" placeholder="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
            </div>
            <button onClick={() => setStep(3)} className="btn-primary w-full" disabled={!form.displayName}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-h1 font-syne text-text-primary mb-2">Pick your niche</h1>
          <p className="text-text-secondary mb-8">Brands target by niche — be accurate for better matches</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {NICHES.map(n => (
              <button
                key={n}
                onClick={() => toggleNiche(n)}
                className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all ${
                  form.niche.includes(n)
                    ? 'border-lime bg-lime/10 text-lime'
                    : 'border-border text-text-secondary hover:border-surface-3'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-error mb-4">{error}</p>}

          <button
            onClick={form.email ? handleEmailSignup : handleGoogleSignup}
            className="btn-primary w-full"
            disabled={loading || form.niche.length === 0}
          >
            {loading ? 'Creating account...' : 'Start Earning Free →'}
          </button>
        </div>
      )}
    </div>
  )
}
