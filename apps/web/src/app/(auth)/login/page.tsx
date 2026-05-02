'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInWithGoogle, signInWithEmail, getIdToken, firebaseReady } from '@/lib/clients/firebase'

type Tab = 'creator' | 'brand'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || ''

  const [tab, setTab] = useState<Tab>('creator')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAfterAuth() {
    const idToken = await getIdToken()
    if (!idToken) throw new Error('No token')

    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })

    if (!res.ok) {
      // New user — redirect to signup
      router.push(tab === 'creator' ? '/creator/signup' : '/brand/signup')
      return
    }

    const { role } = await res.json()
    const dest = redirect || (role === 'brand' ? '/brand/dashboard' : '/dashboard')
    router.push(dest)
  }

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      await handleAfterAuth()
    } catch (e) {
      setError((e as Error).message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmail(email, password)
      await handleAfterAuth()
    } catch (e) {
      setError((e as Error).message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {!firebaseReady && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm">
          <p className="font-semibold text-amber-400 mb-1">⚠️ Firebase not configured</p>
          <p className="text-amber-300/80">
            Add your Firebase keys to <code className="font-mono bg-black/30 px-1 rounded">apps/web/.env.local</code> to enable login.
            Get them from the <a href="https://console.firebase.google.com" target="_blank" rel="noopener" className="underline">Firebase Console</a>.
          </p>
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="text-h1 font-syne text-text-primary mb-2">Welcome back</h1>
        <p className="text-text-secondary">Sign in to your SceneSwap account</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-surface-2 rounded-lg p-1 mb-6">
        {(['creator', 'brand'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all capitalize ${
              tab === t
                ? 'bg-surface-1 text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t} Login
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs text-text-muted bg-surface-1 px-2">or</div>
        </div>

        {/* Email/password */}
        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {error && <p className="text-sm text-error text-center">{error}</p>}
      </div>

      <p className="text-center text-sm text-text-muted mt-6">
        Don&apos;t have an account?{' '}
        <Link
          href={tab === 'creator' ? '/creator/signup' : '/brand/signup'}
          className="text-lime hover:underline"
        >
          Sign up free
        </Link>
      </p>
    </div>
  )
}
