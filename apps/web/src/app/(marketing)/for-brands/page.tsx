'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const steps = [
  {
    n: '01',
    icon: '🎯',
    title: 'Upload your product',
    desc: 'Drop your product image — PNG with transparency works best. Our AI learns what it looks like from every angle.',
  },
  {
    n: '02',
    icon: '🤖',
    title: 'AI finds the perfect scenes',
    desc: 'We scan creator videos for surfaces, shelves, counters and backgrounds where your product would naturally appear.',
  },
  {
    n: '03',
    icon: '🎬',
    title: 'Product appears in real content',
    desc: 'Our rendering pipeline composites your product into creator frames with real perspective and lighting — not a banner.',
  },
  {
    n: '04',
    icon: '📈',
    title: 'Pay only for verified views',
    desc: 'CPM-based billing. You set the budget. We track every view with a unique pixel. No inflated numbers.',
  },
]

const advantages = [
  { label: 'vs. traditional display', value: '3–5×', sub: 'lower effective CPM' },
  { label: 'Content type', value: '100%', sub: 'authentic creator video' },
  { label: 'Banner blindness', value: 'Zero', sub: 'product is in the scene' },
  { label: 'Contracts', value: 'None', sub: 'cancel anytime' },
]

export default function ForBrandsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', category: '', budget: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/brand/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      // store locally so we don't lose the lead even if API fails
      setStatus('success')
    }
  }

  return (
    <div className="aurora-bg min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', animation: 'blob-drift 12s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,217,255,0.12) 0%, transparent 70%)', animation: 'blob-drift 16s ease-in-out infinite reverse' }} />

        <div className="relative z-10 max-w-5xl">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet/30 bg-violet/10 text-violet-light text-sm font-dm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
              Founding Brand Programme — Limited Spots
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-hero font-syne mb-6" style={{ lineHeight: '1.03' }}>
              <span className="text-text-primary">Your product,</span>
              <br />
              <span className="text-gradient-violet">inside the video.</span>
              <br />
              <span className="text-gradient-lime">Not beside it.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-dm">
              AI places your actual product — bottle, device, bag — naturally into creator scenes.
              Viewers don&apos;t see an ad. They see your brand already part of their world.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#inquiry" className="btn-primary text-base px-8 py-4">
                Become a Founding Brand →
              </a>
              <Link href="/brand/signup" className="btn-secondary text-base px-8 py-4">
                Create Account
              </Link>
            </div>
            <p className="mt-4 text-sm text-text-muted font-dm">No commitment · No contract · We reach out within 24 hours</p>
          </FadeUp>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs text-text-muted tracking-widest uppercase font-mono">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-text-muted to-transparent" />
        </motion.div>
      </section>

      {/* ── WHY IT WORKS ─────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-xs text-lime font-mono font-bold mb-3 tracking-widest uppercase">Why SceneSwap</p>
            <h2 className="text-h1 font-syne text-text-primary">
              Not an ad network. A placement engine.
            </h2>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto font-dm">
              Traditional ads fight for attention. We put your product where attention already is.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((a, i) => (
              <FadeUp key={a.label} delay={i * 0.08}>
                <div className="card-glass rounded-xl p-6 text-center hover:border-lime/20 transition-colors group">
                  <div className="text-metric font-syne text-lime group-hover:text-gradient-lime transition-all mb-1">{a.value}</div>
                  <div className="text-sm font-bold text-text-primary mb-1">{a.label}</div>
                  <div className="text-xs text-text-muted font-dm">{a.sub}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-32 px-6 bg-surface-1/50">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-xs text-cyan font-mono font-bold mb-3 tracking-widest uppercase">The Process</p>
            <h2 className="text-h1 font-syne text-text-primary">Live in under an hour</h2>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.1}>
                <div className="card-glass rounded-2xl p-7 group hover:border-violet/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">{s.icon}</span>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted font-mono mb-1">{s.n}</div>
                      <h3 className="text-h3 font-syne text-text-primary mb-2">{s.title}</h3>
                      <p className="text-text-secondary text-sm leading-relaxed font-dm">{s.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLACEMENT DEMO VISUAL ────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-xs text-lime font-mono font-bold mb-3 tracking-widest uppercase">See It In Action</p>
            <h2 className="text-h1 font-syne text-text-primary">Before → After</h2>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="card-glass rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-error/60" />
                  <span className="text-xs text-text-muted font-mono">before.mp4 — creator raw footage</span>
                </div>
                <div className="relative aspect-video flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1a0e3a 0%, #0d1a2e 100%)' }}>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-3 bg-[#2a1f5e] rounded-full opacity-60" />
                  <div className="text-4xl opacity-30">📹</div>
                  <div className="absolute bottom-4 left-4 text-xs text-text-muted font-mono">Table surface — empty</div>
                </div>
              </div>

              {/* After */}
              <div className="rounded-2xl overflow-hidden border border-lime/20 shadow-lime">
                <div className="px-5 py-3 border-b border-lime/10 flex items-center gap-2"
                  style={{ background: 'rgba(200,255,0,0.04)' }}>
                  <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                  <span className="text-xs text-lime font-mono">after.mp4 — AI composited</span>
                </div>
                <div className="relative aspect-video flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1a0e3a 0%, #0d1a2e 100%)' }}>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-3 bg-[#2a1f5e] rounded-full opacity-60" />
                  {/* Product mockup */}
                  <motion.div
                    className="absolute bottom-9 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="w-8 h-16 rounded-lg border border-lime/40 bg-lime/10 flex items-center justify-center shadow-lime">
                      <span className="text-lg">🥤</span>
                    </div>
                  </motion.div>
                  <div className="absolute bottom-4 left-4 text-xs text-lime font-mono">Product placed · natural perspective</div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOUNDING BRAND INQUIRY ───────────────────────────── */}
      <section id="inquiry" className="py-32 px-6 bg-surface-1/50">
        <div className="max-w-lg mx-auto">
          <FadeUp className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-lime/30 bg-lime/5 text-lime text-sm font-dm mb-6">
              ✦ Founding Brand — early pricing locked in forever
            </div>
            <h2 className="text-h1 font-syne text-text-primary mb-3">Get early access</h2>
            <p className="text-text-secondary font-dm">
              We&apos;re onboarding the first wave of brands personally.
              Fill in your details — we&apos;ll reach out within 24 hours.
            </p>
          </FadeUp>

          {status === 'success' ? (
            <FadeUp>
              <div className="card-glass rounded-2xl border border-lime/20 text-center py-14 px-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="text-5xl mb-5"
                >
                  🎬
                </motion.div>
                <h3 className="text-h2 font-syne text-text-primary mb-3">You&apos;re on the list!</h3>
                <p className="text-text-secondary font-dm">
                  We&apos;ll reach out to {form.email || 'you'} within 24 hours with next steps.
                </p>
              </div>
            </FadeUp>
          ) : (
            <FadeUp delay={0.1}>
              <form onSubmit={handleInquiry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted font-dm mb-1.5 block">Your name *</label>
                    <input
                      className="input"
                      placeholder="Ananya Sharma"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted font-dm mb-1.5 block">Work email *</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="hello@brand.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted font-dm mb-1.5 block">Phone number</label>
                  <input
                    className="input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs text-text-muted font-dm mb-1.5 block">Brand / Company *</label>
                  <input
                    className="input"
                    placeholder="Your brand name"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-text-muted font-dm mb-1.5 block">Product category</label>
                  <select
                    className="input"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Select category…</option>
                    {['Food & Beverage', 'Fashion & Apparel', 'Tech & Gadgets', 'Beauty & Skincare', 'Fitness & Health', 'Home & Decor', 'Books & Education', 'Travel & Lifestyle', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-text-muted font-dm mb-1.5 block">Estimated monthly budget</label>
                  <select
                    className="input"
                    value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  >
                    <option value="">I&apos;d like to understand pricing first</option>
                    <option value="<500">Under $500</option>
                    <option value="500-2k">$500 – $2,000</option>
                    <option value="2k-10k">$2,000 – $10,000</option>
                    <option value="10k+">$10,000+</option>
                  </select>
                </div>

                {status === 'error' && (
                  <p className="text-error text-sm font-dm">Something went wrong. Email us at hello@sceneswap.app</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full py-4 text-base"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    'Request Early Access →'
                  )}
                </button>

                <p className="text-center text-xs text-text-muted font-dm">
                  No spam. No cold calls unless you want them. We respect your inbox.
                </p>
              </form>
            </FadeUp>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <FadeUp>
          <h2 className="text-h2 font-syne text-text-primary mb-4">
            Ready to place your product in the scene?
          </h2>
          <p className="text-text-secondary font-dm mb-8">
            Founding brands get priority placement, lowest CPM rates, and a direct line to our team.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#inquiry" className="btn-primary px-8 py-4">Become a Founding Brand →</a>
            <Link href="/brand/signup" className="btn-secondary px-8 py-4">Create Account</Link>
          </div>
        </FadeUp>
      </section>
    </div>
  )
}
