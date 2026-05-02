'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'

/* ── FadeUp ─────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── WaitlistCount ─────────────────────────────────────── */
function WaitlistCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/waitlist/count').then(r => r.json()).then(d => setCount(d.count ?? 0)).catch(() => setCount(0))
  }, [])
  if (count === null) return <span className="skeleton inline-block w-10 h-4 rounded" />
  if (count === 0) return <span>Be the first</span>
  return <span>{count.toLocaleString('en-US')}+ creators</span>
}

/* ── Ticker ─────────────────────────────────────────────── */
const TICKER_ITEMS = [
  'AI-powered product placement',
  'creators earn 70%',
  'zero production overhead',
  'real products · real scenes',
  '$3–$15 CPM',
  'perspective-correct compositing',
  'live in 48 hours',
  'no awkward ad reads',
]

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', background: 'rgba(6,6,6,0.95)' }}>
      <div style={{ display: 'inline-flex', animation: 'ticker 30s linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '0 32px', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: "'Space Mono', monospace" }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF00', flexShrink: 0, display: 'inline-block' }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Hero stat badge ─────────────────────────────────────── */
function StatBadge({ value, label, align = 'left' }: { value: string; label: string; align?: 'left' | 'right' }) {
  return (
    <div style={{ background: 'rgba(10,10,10,0.82)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 14, padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {align === 'right' && <span style={{ display: 'block', height: 1, width: 36, background: 'rgba(255,255,255,0.18)', transform: 'rotate(18deg)', flexShrink: 0 }} />}
        <span style={{ fontSize: 'clamp(18px,2.5vw,30px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', fontFamily: "'Space Mono', monospace" }}>{value}</span>
        {align === 'left' && <span style={{ display: 'block', height: 1, width: 36, background: 'rgba(255,255,255,0.18)', transform: 'rotate(-18deg)', flexShrink: 0 }} />}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5, textAlign: align === 'right' ? 'right' : 'left', fontWeight: 300, letterSpacing: '.02em' }}>{label}</div>
    </div>
  )
}

/* ── Before/After drag slider ────────────────────────────── */
function BeforeAfter() {
  const [split, setSplit] = useState(48)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const calc = useCallback((clientX: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setSplit(Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) calc(e.clientX) }
    const onTouchMove = (e: TouchEvent) => { if (dragging.current) calc(e.touches[0].clientX) }
    const stop = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', stop)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', stop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', stop)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', stop)
    }
  }, [calc])

  return (
    <div ref={ref} onMouseDown={() => { dragging.current = true }} onTouchStart={() => { dragging.current = true }}
      style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9', cursor: 'ew-resize', userSelect: 'none' }}>
      {/* Before */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(135deg,#111 0%,#1a1a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', opacity: 0.4 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '.1em', color: '#fff', marginBottom: 10, textTransform: 'uppercase' }}>Before</div>
          <div style={{ width: 140, height: 90, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Mono',monospace" }}>kitchen counter</span>
          </div>
        </div>
      </div>
      {/* After */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, clipPath: `inset(0 ${100 - split}% 0 0)`, background: 'linear-gradient(135deg,#0d1a00 0%,#111 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: '.1em', color: '#C8FF00', marginBottom: 10, textTransform: 'uppercase' }}>With SceneSwap</div>
          <div style={{ width: 140, height: 90, background: 'rgba(200,255,0,0.07)', border: '1px solid rgba(200,255,0,0.22)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 30 }}>🥤</span>
            <span style={{ fontSize: 9, color: 'rgba(200,255,0,0.55)', fontFamily: "'Space Mono',monospace" }}>brand product composited</span>
          </div>
        </div>
      </div>
      {/* Handle */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${split}%`, width: 2, background: 'rgba(200,255,0,0.85)', zIndex: 5, transform: 'translateX(-50%)', boxShadow: '0 0 18px rgba(200,255,0,0.55)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: '#C8FF00', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(200,255,0,0.7)' }}>
          <span style={{ fontSize: 13, color: '#000', fontWeight: 700 }}>⇄</span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 14, left: 14, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: "'Space Mono',monospace", padding: '5px 12px', borderRadius: 999, zIndex: 6, background: 'rgba(0,0,0,0.72)', color: 'rgba(255,255,255,0.5)' }}>original</div>
      <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: "'Space Mono',monospace", padding: '5px 12px', borderRadius: 999, zIndex: 6, background: 'rgba(200,255,0,0.13)', color: '#C8FF00', border: '1px solid rgba(200,255,0,0.28)' }}>with sceneswap</div>
    </div>
  )
}

/* ── AI Scene Mockup ────────────────────────────────────── */
function SceneMockup() {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStage(s => (s + 1) % 4), 1800)
    return () => clearInterval(t)
  }, [])
  const stages = [
    { label: 'Analyzing scene…', color: 'text-text-secondary' },
    { label: 'AI detected: Coffee table', color: 'text-cyan-400' },
    { label: 'Matching brand product…', color: 'text-violet-400' },
    { label: '✓ Product placed!', color: 'text-lime' },
  ]
  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-violet" style={{ background: 'linear-gradient(135deg, #1a1035 0%, #0d1a2e 100%)', aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ background: 'linear-gradient(180deg,transparent,rgba(15,10,40,0.8))' }} />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-3 bg-[#2a1f5e] rounded-full opacity-70" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-1 bg-violet-500/30 blur-sm" />
          <div className="absolute top-4 right-8 w-20 h-24 rounded-lg border border-white/5 bg-white/2" />
          <div className="absolute top-4 right-8 grid grid-cols-2 gap-1 w-20 h-24 p-2">
            {[...Array(4)].map((_, i) => (<div key={i} className="rounded bg-cyan-400/5 border border-cyan-400/10" />))}
          </div>
        </div>
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div key="detection-zone" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }} className="absolute border-2 border-lime rounded-lg" style={{ bottom: '18%', left: '28%', width: '44%', height: '28%' }}>
              <div className="absolute -top-5 left-0 text-[10px] font-mono text-lime bg-[#05021A]/80 px-1.5 py-0.5 rounded whitespace-nowrap">table_surface · 94%</div>
              {([{ top: -2, left: -2 }, { top: -2, right: -2 }, { bottom: -2, left: -2 }, { bottom: -2, right: -2 }] as React.CSSProperties[]).map((pos, i) => (
                <div key={i} className="absolute w-2 h-2 bg-lime rounded-sm" style={pos} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {stage === 3 && (
            <motion.div key="product-can" initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.4, y: 16, transition: { duration: 0.2 } }} transition={{ type: 'spring', damping: 14, stiffness: 260 }} className="absolute" style={{ bottom: '21%', left: '43%' }}>
              <div className="w-8 h-12 rounded-full relative overflow-hidden shadow-lime" style={{ background: 'linear-gradient(180deg, #ff0033 0%, #cc0029 100%)' }}>
                <div className="absolute inset-x-1 top-2 h-1 bg-white/20 rounded-full" />
                <div className="absolute inset-x-0 bottom-0 h-3 bg-black/30" />
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-white/10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-20 h-24 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(160,140,220,0.8) 0%, transparent 70%)' }} />
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <div className="flex gap-1">
            {stages.map((_, i) => (<div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${i <= stage ? 'bg-lime' : 'bg-white/10'}`} />))}
          </div>
        </div>
      </div>
      <motion.div key={stage} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full border border-white/10 bg-[#0D0829]/90 backdrop-blur-xl text-xs font-mono shadow-card">
        <span className={stages[stage].color}>{stages[stage].label}</span>
      </motion.div>
      <div className="absolute -inset-8 rounded-3xl bg-violet-500/10 blur-2xl -z-10" />
    </div>
  )
}

/* ── TiltCard ───────────────────────────────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = ((e.clientX - left) / width - 0.5) * 16
    const y = ((e.clientY - top) / height - 0.5) * -16
    el.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateZ(8px)`
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)'
  }
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`card-3d ${className}`} style={{ transition: 'transform 0.12s cubic-bezier(0.16,1,0.3,1)', willChange: 'transform' }}>
      {children}
    </div>
  )
}

/* ── Testimonial section ────────────────────────────────── */
function TestimonialSection() {
  const [form, setForm] = useState({ name: '', handle: '', niche: '', quote: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch { setStatus('error') }
  }
  if (status === 'success') return (
    <div className="card-glass text-center py-12">
      <div className="text-4xl mb-4">🎉</div>
      <p className="text-h3 font-syne text-text-primary mb-2">Thank you!</p>
      <p className="text-text-secondary">Your review will appear here once verified.</p>
    </div>
  )
  return (
    <div className="card-glass">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet/30 bg-violet-10 text-violet-light text-sm font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-violet-light animate-pulse" />0 reviews · Be the first
        </div>
        <h3 className="text-h2 font-syne text-text-primary mb-2">Have you used SceneSwap?</h3>
        <p className="text-text-secondary text-sm">Share your real experience — we only show verified creator reviews.</p>
      </div>
      <form onSubmit={submit} className="space-y-4 max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input className="input" placeholder="@handle" value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))} />
        </div>
        <input className="input" placeholder="Your niche (e.g. Food, Tech, Travel)" value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))} />
        <textarea className="input min-h-[100px] resize-none" placeholder="What was your experience using SceneSwap?" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} required />
        <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>{status === 'loading' ? 'Submitting…' : 'Submit My Review →'}</button>
        {status === 'error' && <p className="text-error text-sm text-center">Something went wrong. Try again.</p>}
      </form>
    </div>
  )
}

/* ── Steps data ─────────────────────────────────────────── */
const STEPS = [
  { num: '01', icon: '🎬', title: 'Upload your video', desc: 'Any content works — cooking, travel, tech, lifestyle. Drop your existing video. No new filming needed.' },
  { num: '02', icon: '✨', title: 'AI reads every frame', desc: 'Our scene analysis identifies every surface in your video — tables, shelves, counters — and maps where a brand product would feel natural.' },
  { num: '03', icon: '🎯', title: 'Product appears, naturally', desc: "The brand's actual product is composited into your video, perspective-correct, frame by frame. Like it was always there." },
  { num: '04', icon: '💰', title: 'Post it. Earn 70%.', desc: 'Download your video, post it anywhere. Every verified view earns you $3–$15 per 1,000 views. Payout weekly.' },
]

/* ── Main Page ──────────────────────────────────────────── */
export default function HomePage() {
  const [email, setEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [glitch, setGlitch] = useState(false)

  // Glitch effect every 7s
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 420)
    }, 7000)
    return () => clearInterval(id)
  }, [])

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setWaitlistStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, type: 'creator' }) })
      if (!res.ok) throw new Error()
      setWaitlistStatus('success')
    } catch { setWaitlistStatus('error') }
  }

  return (
    <>
      {/* ══════════════════════════════════════════
          HERO — fullscreen cinema
      ══════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden', background: '#080808', marginTop: '-64px' }}>

        {/* Video background */}
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} src="/hero.mp4" />

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(8,8,8,0.62)' }} />

        {/* Scan-line shimmer */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, rgba(200,255,0,0.022), transparent)', animation: 'scanline 8s linear infinite' }} />
        </div>

        {/* Glitch layer */}
        {glitch && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, animation: 'glitch 0.4s steps(1) forwards', opacity: 0.45, background: 'linear-gradient(45deg, transparent 45%, rgba(200,255,0,0.05) 50%, transparent 55%)' }} />
        )}

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', zIndex: 2, background: 'linear-gradient(to bottom, transparent 0%, #080808 100%)', pointerEvents: 'none' }} />

        {/* Left fade */}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '25%', zIndex: 2, background: 'linear-gradient(to right, rgba(8,8,8,0.6), transparent)', pointerEvents: 'none' }} />

        {/* Lime corner vignette */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '40%', zIndex: 2, background: 'radial-gradient(ellipse at top right, rgba(200,255,0,0.045), transparent 70%)', pointerEvents: 'none' }} />

        {/* ── Giant hero words ── */}
        {/* Word 1 — white, top-left */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', zIndex: 10, left: 'clamp(16px,4vw,52px)', top: '18%', fontFamily: "'Syne', sans-serif", fontSize: 'clamp(64px,13vw,184px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.92, color: '#fff', pointerEvents: 'none' }}
        >
          place
        </motion.h1>

        {/* Word 2 — lime glow, right */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', zIndex: 10, right: 'clamp(16px,4vw,52px)', top: '36%', fontFamily: "'Syne', sans-serif", fontSize: 'clamp(64px,13vw,184px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.92, color: '#C8FF00', textAlign: 'right', animation: 'limePulse 3s ease-in-out infinite', pointerEvents: 'none' }}
        >
          brands
        </motion.h1>

        {/* Word 3 — outline ghost */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', zIndex: 10, left: 'clamp(16px,12vw,180px)', top: '55%', fontFamily: "'Syne', sans-serif", fontSize: 'clamp(64px,13vw,184px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.92, color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.32)', pointerEvents: 'none' }}
        >
          inside
        </motion.h1>

        {/* Sub copy — left, between word 1 and 3 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{ position: 'absolute', zIndex: 10, left: 'clamp(16px,4vw,52px)', top: '47%', maxWidth: 240 }}
        >
          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.58)', fontWeight: 300 }}>
            AI drops real brand products into your videos — naturally, between cuts. Like movie product placement.{' '}
            <span style={{ color: '#C8FF00', fontWeight: 600 }}>Fully automated.</span>
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Link href="/creator/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#C8FF00', color: '#000', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, borderRadius: 9999, padding: '11px 22px', textDecoration: 'none', whiteSpace: 'nowrap', minHeight: 44 }}>
              Start Earning →
            </Link>
            <a href="#how-it-works" style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9999, padding: '11px 22px', textDecoration: 'none', whiteSpace: 'nowrap', minHeight: 44 }}>
              See how ↓
            </a>
          </div>
        </motion.div>

        {/* ── Stat badges ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ position: 'absolute', zIndex: 10, right: 'clamp(16px,5vw,80px)', top: '14%' }}>
          <StatBadge value="+12k" label="creators on waitlist" align="right" />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          style={{ position: 'absolute', zIndex: 10, left: 'clamp(16px,5vw,80px)', bottom: 'clamp(90px,14vh,140px)' }}>
          <StatBadge value="70%" label="revenue share, always" align="left" />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          style={{ position: 'absolute', zIndex: 10, right: 'clamp(16px,5vw,80px)', bottom: 'clamp(70px,12vh,120px)' }}>
          <StatBadge value="$15" label="avg CPM paid by brands" align="right" />
        </motion.div>

        {/* ── Floating AI badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{ position: 'absolute', zIndex: 10, bottom: 'clamp(110px,16vh,180px)', left: '50%', transform: 'translateX(-50%)', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: 16, animation: 'float 4s ease-in-out infinite' }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C8FF00', display: 'block', flexShrink: 0, boxShadow: '0 0 12px #C8FF00', animation: 'blink 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>AI analyzing scene</span>
          <span style={{ fontSize: 11, color: '#C8FF00', fontFamily: "'Space Mono',monospace" }}>live ·</span>
          <span style={{ fontSize: 11, color: '#fff', fontFamily: "'Space Mono',monospace" }}>97%</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{ position: 'absolute', zIndex: 10, bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
        >
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '.14em', textTransform: 'uppercase' }}>scroll</span>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', animation: 'scrollDot 1.8s ease-in-out infinite' }} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          TICKER STRIP
      ══════════════════════════════════════════ */}
      <Ticker />

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 px-6 relative overflow-hidden">
        <div className="ambient-blob w-[600px] h-[400px] bg-violet-500/15 top-0 left-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <p className="text-xs font-mono text-lime uppercase tracking-[0.2em] mb-4">How It Works</p>
            <h2 className="text-h1 font-syne text-text-primary mb-4">
              Not a banner. Not a watermark.
              <br />
              <span className="text-gradient-violet">The product IS in your video.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              SceneSwap uses computer vision to understand your scene — then inserts the brand&apos;s
              real product where it naturally fits.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {STEPS.map((step, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <TiltCard className="card h-full">
                  <div className="text-3xl mb-5">{step.icon}</div>
                  <div className="text-[11px] font-mono text-lime tracking-widest mb-2">{step.num}</div>
                  <h3 className="text-h3 font-syne text-text-primary mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
                </TiltCard>
              </FadeUp>
            ))}
          </div>

          {/* AI callout */}
          <FadeUp delay={0.2}>
            <div className="card-glass p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <p className="text-xs font-mono text-cyan uppercase tracking-[0.2em] mb-4">AI Scene Intelligence</p>
                <h3 className="text-h2 font-syne text-text-primary mb-4">
                  The AI sees your video
                  <br />
                  <span className="text-gradient-lime">the way a director does.</span>
                </h3>
                <p className="text-text-secondary leading-relaxed mb-3">
                  It detects every object — the coffee table, the shelf, the desk.
                  Then it decides where the brand&apos;s product would feel most natural
                  given the camera angle, depth, and lighting.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  The result is perspective-correct. Depth-aware. Looks like it was always there.
                </p>
              </div>
              <div className="w-full md:w-80 shrink-0 space-y-2">
                {[
                  { label: 'Coffee table — foreground', hint: 'Pepsi, Red Bull, snacks', conf: 94, color: 'text-lime' },
                  { label: 'Background shelf', hint: 'Any product display', conf: 87, color: 'text-cyan-400' },
                  { label: 'Desk beside laptop', hint: 'Tech gadgets, drinks', conf: 81, color: 'text-violet-light' },
                ].map(z => (
                  <div key={z.label} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/8">
                    <div>
                      <p className="text-xs font-medium text-text-primary">{z.label}</p>
                      <p className="text-xs text-text-muted">{z.hint}</p>
                    </div>
                    <span className={`text-xs font-mono shrink-0 ml-3 ${z.color}`}>{z.conf}%</span>
                  </div>
                ))}
                <div className="text-center pt-1">
                  <span className="text-xs text-lime font-mono">✨ Scene analysis complete</span>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BEFORE / AFTER DEMO
      ══════════════════════════════════════════ */}
      <section style={{ background: '#050505', padding: '100px clamp(20px,6vw,88px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(200,255,0,0.04) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeUp>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ display: 'inline-block', width: 20, height: 2, background: '#C8FF00', borderRadius: 2 }} />
                <span style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: "'Space Mono',monospace" }}>live demo</span>
                <span style={{ display: 'inline-block', width: 20, height: 2, background: '#C8FF00', borderRadius: 2 }} />
              </div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(28px,4vw,54px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: 14 }}>
                drag to see the <span style={{ color: '#C8FF00' }}>difference</span>
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
                your content. their product. zero production cost.
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <BeforeAfter />
          </FadeUp>
          <FadeUp delay={0.2}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 36, flexWrap: 'wrap' }}>
              {[
                { v: '<48hrs', l: 'from upload to live' },
                { v: '0 reshoots', l: 'required' },
                { v: '100%', l: 'automatic' },
              ].map(s => (
                <div key={s.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', fontFamily: "'Space Mono',monospace" }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 5, fontWeight: 300 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOR CREATORS
      ══════════════════════════════════════════ */}
      <section className="py-28 px-6 relative" style={{ background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.06) 50%, transparent)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <p className="text-xs font-mono text-lime uppercase tracking-[0.2em] mb-4">For Creators</p>
              <h2 className="text-h1 font-syne text-text-primary mb-6">
                Your existing videos.
                <br />
                <span className="text-gradient-lime">A new income stream.</span>
              </h2>
              <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                No new filming. No brand negotiations. No minimum followers.
                Upload any video you&apos;ve already made and our AI handles the rest.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  ['70% revenue share', 'You keep 70% of every dollar a brand spends on your video'],
                  ['$3–$15 per 1K views', 'CPM rates set by brands — you see the rate before accepting'],
                  ['Weekly payouts', 'Bank transfer or PayPal every Friday, no minimum threshold'],
                  ['Zero creative effort', 'AI handles compositing, tracking, rendering — you just post'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-lime" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/creator/signup" className="btn-primary">Join as Creator →</Link>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="space-y-4">
                <div className="card-glow p-6">
                  <p className="text-xs font-mono text-lime uppercase tracking-widest mb-4">Earnings Estimate</p>
                  <div className="space-y-3">
                    {[
                      { views: '10K', cpm: 3, earn: 21 },
                      { views: '50K', cpm: 5, earn: 175 },
                      { views: '100K', cpm: 10, earn: 700 },
                    ].map(row => (
                      <div key={row.views} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm text-text-primary font-medium">{row.views} views</p>
                          <p className="text-xs text-text-muted">at ${row.cpm} CPM</p>
                        </div>
                        <p className="text-metric-sm font-mono text-lime">${row.earn}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-3">70% creator share applied. Actual earnings depend on verified views and brand CPM.</p>
                </div>
                <div className="card border-violet/30 bg-violet-10 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet/20 flex items-center justify-center shrink-0 text-xl">🚀</div>
                  <div>
                    <p className="font-semibold text-text-primary mb-1">Early Access Bonus</p>
                    <p className="text-sm text-text-secondary">First 500 creators get priority campaign matching and a 3-month fee waiver. <WaitlistCount /> on waitlist.</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOR BRANDS — creator/brand split cards
      ══════════════════════════════════════════ */}
      <section id="brands" style={{ background: '#080808', padding: '100px clamp(20px,6vw,88px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Creator card */}
          <FadeUp>
            <div style={{ background: 'linear-gradient(140deg, rgba(200,255,0,0.07) 0%, rgba(200,255,0,0.02) 100%)', border: '1px solid rgba(200,255,0,0.18)', borderRadius: 24, padding: '48px 40px', animation: 'borderPulse 4s ease-in-out infinite', height: '100%' }}>
              <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: 22, fontFamily: "'Space Mono',monospace" }}>for creators</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3vw,40px)', fontWeight: 800, color: '#fff', marginBottom: 18, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                monetize every<br />frame you shoot
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', marginBottom: 30, fontWeight: 300 }}>
                No cold emails to sponsors. No awkward reads. Brands pay CPM — you earn 70% of every impression. Automatically, weekly.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 34 }}>
                {['70% revenue share — always, guaranteed', 'Works on existing videos, not just new ones', 'You approve every brand placement', 'Real-time earnings dashboard + instant payouts'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF00', flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.62)', fontWeight: 300, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/creator/signup" style={{ display: 'inline-flex', alignItems: 'center', background: '#C8FF00', color: '#000', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, borderRadius: 9999, padding: '12px 24px', textDecoration: 'none', minHeight: 44 }}>
                apply as creator →
              </Link>
            </div>
          </FadeUp>

          {/* Brand card */}
          <FadeUp delay={0.1}>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '48px 40px', height: '100%' }}>
              <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 22, fontFamily: "'Space Mono',monospace" }}>for brands</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,3vw,40px)', fontWeight: 800, color: '#fff', marginBottom: 18, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                native placement.<br />measurable ROI.
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', marginBottom: 30, fontWeight: 300 }}>
                Your actual product — lit, 3D-matched, perspective-correct — inside content your audience is already watching. CPM pricing. Audience targeting.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 34 }}>
                {['$3–$15 CPM with audience targeting', 'Real product rendered — not a banner or logo', 'Scene-context AI matches brand to creator', 'Per-video performance reports + ROAS data'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.28)', flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.62)', fontWeight: 300, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/for-brands" style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 400, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 9999, padding: '12px 24px', textDecoration: 'none', minHeight: 44 }}>
                talk to sales →
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          METRICS STRIP
      ══════════════════════════════════════════ */}
      <section style={{ background: '#040404', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '60px clamp(20px,6vw,88px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { v: '12,400+', l: 'creators on waitlist' },
            { v: '400+', l: 'brands signed up' },
            { v: '70%', l: 'creator revenue split' },
            { v: '48hrs', l: 'average go-live time' },
          ].map((m, i) => (
            <FadeUp key={m.l} delay={i * 0.08}>
              <div style={{ padding: '0 16px' }}>
                <div style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', marginBottom: 8, fontFamily: "'Space Mono',monospace" }}>{m.v}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 300, letterSpacing: '.03em' }}>{m.l}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CREATOR REVIEWS
      ══════════════════════════════════════════ */}
      <section className="py-28 px-6" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,217,255,0.03) 50%, transparent)' }}>
        <div className="max-w-3xl mx-auto">
          <FadeUp className="text-center mb-12">
            <p className="text-xs font-mono text-lime uppercase tracking-[0.2em] mb-4">Creator Reviews</p>
            <h2 className="text-h1 font-syne text-text-primary mb-3">What creators say</h2>
            <p className="text-text-secondary">We&apos;re in early access. No reviews yet — yours could be first.</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <TestimonialSection />
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CLOSING CTA
      ══════════════════════════════════════════ */}
      <section style={{ background: '#080808', padding: '120px clamp(20px,6vw,88px) 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Lime glow from bottom */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(200,255,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <FadeUp>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28, background: 'rgba(200,255,0,0.07)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: 999, padding: '6px 16px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8FF00', animation: 'blink 1.5s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 10, letterSpacing: '.12em', color: '#C8FF00', fontFamily: "'Space Mono',monospace" }}>EARLY ACCESS · LIMITED SPOTS</span>
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(34px,6vw,78px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20, lineHeight: 1.0 }}>
              the future of brand<br />
              <span style={{ color: '#C8FF00' }}>integration is here</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.42)', marginBottom: 44, fontWeight: 300, maxWidth: 520, margin: '0 auto 44px' }}>
              Join 12,000+ creators and 400+ brands already on the waitlist. We onboard in batches — early applicants lock in the best rates and get first access.
            </p>
            {waitlistStatus === 'success' ? (
              <div className="card-glow text-center py-10 max-w-md mx-auto">
                <p className="text-3xl mb-3">🎉</p>
                <p className="text-h3 font-syne text-text-primary mb-2">You&apos;re in!</p>
                <p className="text-text-secondary text-sm">We&apos;ll notify you at <strong className="text-lime">{email}</strong> when you&apos;re admitted.</p>
              </div>
            ) : (
              <form onSubmit={joinWaitlist} style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ flex: '1 1 260px', maxWidth: 320, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9999, padding: '14px 22px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}
                />
                <button type="submit" disabled={waitlistStatus === 'loading'}
                  style={{ background: '#C8FF00', color: '#000', fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 9999, padding: '14px 32px', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44 }}>
                  {waitlistStatus === 'loading' ? 'Joining…' : 'join the waitlist'}
                </button>
              </form>
            )}
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', fontWeight: 300, marginTop: 16 }}>
              free for first 6 months · no credit card · cancel anytime
            </p>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
