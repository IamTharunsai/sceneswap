'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, CheckCircle, Download, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Badge } from '@/components/ui/Badge/Badge'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { getIdToken } from '@/lib/clients/firebase'
import { formatViews } from '@/lib/utils/numbers'
import { formatEarnings } from '@/lib/utils/earnings'

interface VideoDetail {
  id: string
  status: string
  trackingCode: string | null
  renderedVideoUrl: string | null
  videoUrl: string | null
  viewsVerified: number
  earningsAmount: number
  campaignTitle: string
  brandName: string
  cpmRate: number
  trackingUrl: string | null
}

const STATUS_BADGE: Record<string, 'active' | 'pending' | 'info' | 'error'> = {
  ready: 'active',
  posted: 'active',
  rendering: 'pending',
  processing: 'pending',
  uploading: 'pending',
}

export default function VideoReadyPage({ params }: { params: { videoId: string } }) {
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const fetchVideo = useCallback(async () => {
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/creator/videos/${params.videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        setError('Could not load video details.')
        return null
      }
      const data = await res.json()
      setVideo(data.video)
      return data.video as VideoDetail
    } catch {
      setError('Network error. Please refresh.')
      return null
    } finally {
      setLoading(false)
    }
  }, [params.videoId])

  // Initial load
  useEffect(() => {
    fetchVideo()
  }, [fetchVideo])

  // Poll every 15s while still rendering
  useEffect(() => {
    if (!video) return
    if (video.status !== 'rendering' && video.status !== 'processing') return
    const interval = setInterval(async () => {
      const updated = await fetchVideo()
      if (updated?.status === 'ready' || updated?.status === 'posted') {
        clearInterval(interval)
      }
    }, 15_000)
    return () => clearInterval(interval)
  }, [video?.status, fetchVideo])

  async function copyLink() {
    if (!video?.trackingUrl) return
    await navigator.clipboard.writeText(video.trackingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function shareWhatsApp() {
    if (!video?.trackingUrl) return
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Watch my latest video — ${video.campaignTitle} 🎬\n${video.trackingUrl}`)}`,
      '_blank'
    )
  }

  async function shareInstagram() {
    if (!video?.trackingUrl) return
    await navigator.clipboard.writeText(video.trackingUrl)
    window.alert('Link copied! Paste it in your Instagram bio or caption.')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  if (error || !video) {
    return (
      <div className="card text-center py-12">
        <p className="text-text-secondary mb-4">{error || 'Video not found.'}</p>
        <Button variant="secondary" onClick={() => { setLoading(true); fetchVideo() }}>
          <RefreshCw size={14} />
          Retry
        </Button>
      </div>
    )
  }

  const isReady = video.status === 'ready' || video.status === 'posted'
  const isRendering = video.status === 'rendering' || video.status === 'processing'

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-h2 font-syne text-text-primary">{video.campaignTitle}</h1>
          <p className="text-sm text-text-muted">{video.brandName} · ${video.cpmRate}/1K views</p>
        </div>
        <Badge variant={STATUS_BADGE[video.status] ?? 'info'}>
          {video.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Rendering in progress */}
      {isRendering && (
        <div className="card text-center py-12 mb-6">
          <Loader2 size={40} className="mx-auto text-lime animate-spin mb-4" />
          <p className="text-text-primary font-medium mb-2">Compositing brand into your video…</p>
          <p className="text-text-secondary text-sm mb-4">This takes 5–15 minutes. Page auto-refreshes.</p>
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <RefreshCw size={12} className="animate-spin" />
            Checking every 15 seconds
          </div>
        </div>
      )}

      {isReady && (
        <>
          {/* Video preview */}
          {video.renderedVideoUrl && (
            <div className="mb-6 rounded-xl overflow-hidden border border-border bg-black">
              <video src={video.renderedVideoUrl} controls playsInline className="w-full max-h-80 object-contain" />
            </div>
          )}

          {/* Download */}
          <div className="card mb-6">
            <h3 className="text-h3 font-syne text-text-primary mb-3">Download Video</h3>
            {video.renderedVideoUrl ? (
              <a
                href={video.renderedVideoUrl}
                download
                className="btn-primary flex items-center justify-center gap-2 w-full"
              >
                <Download size={16} />
                Download Rendered Video
              </a>
            ) : (
              <p className="text-text-muted text-sm text-center py-2">Video URL not available yet.</p>
            )}
          </div>

          {/* THE MONEY CARD — Tracking Link */}
          <div className="card-highlight mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lime text-xl">🔗</span>
              <h3 className="text-h3 font-syne text-text-primary">Your Tracking Link</h3>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Every click on this link counts as a verified view and earns you money.
              Put it everywhere — bio, captions, stories, DMs.
            </p>

            {video.trackingUrl ? (
              <>
                <div className="bg-surface-2 rounded-lg p-4 flex items-center gap-3 mb-4 border border-lime/20">
                  <p className="flex-1 text-sm font-mono text-lime break-all">{video.trackingUrl}</p>
                  <button
                    onClick={copyLink}
                    className="shrink-0 p-2 rounded-lg hover:bg-surface-3 transition-colors"
                    aria-label="Copy link"
                  >
                    {copied
                      ? <CheckCircle size={18} className="text-success" />
                      : <Copy size={18} className="text-text-muted" />}
                  </button>
                </div>

                <button onClick={copyLink} className="btn-primary w-full mb-3 text-sm">
                  {copied ? '✓ Copied to clipboard!' : 'Copy Link →'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareInstagram}
                    className="btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <span>📸</span> Instagram
                  </button>
                  <button
                    onClick={shareWhatsApp}
                    className="btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <span>💬</span> WhatsApp
                  </button>
                </div>
              </>
            ) : (
              <p className="text-text-muted text-sm text-center py-2">
                Tracking link not generated yet. Contact support if this persists.
              </p>
            )}
          </div>

          {/* How to maximise */}
          <div className="card mb-6">
            <h3 className="text-h3 font-syne text-text-primary mb-3">How to maximise earnings</h3>
            <ol className="space-y-2 text-sm text-text-secondary">
              <li className="flex gap-3"><span className="text-lime font-bold shrink-0">1.</span>Post the video to Instagram Reels, TikTok, or YouTube Shorts</li>
              <li className="flex gap-3"><span className="text-lime font-bold shrink-0">2.</span>Add your tracking link in your bio and pin it as a comment</li>
              <li className="flex gap-3"><span className="text-lime font-bold shrink-0">3.</span>Ask viewers to click the link for more info about the brand</li>
              <li className="flex gap-3"><span className="text-lime font-bold shrink-0">4.</span>Each verified click = ${video.cpmRate} per 1,000 views → 70% is yours</li>
            </ol>
          </div>
        </>
      )}

      {/* Stats — always visible */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-metric-sm font-mono text-lime">{formatViews(video.viewsVerified)}</p>
          <p className="text-xs text-text-muted mt-1">verified views</p>
        </div>
        <div className="card text-center">
          <p className="text-metric-sm font-mono text-lime">{formatEarnings(video.earningsAmount)}</p>
          <p className="text-xs text-text-muted mt-1">earned so far</p>
        </div>
      </div>
    </div>
  )
}
