'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import { getIdToken } from '@/lib/clients/firebase'
import type { SurfaceZone } from '@sceneswap/types'

type UploadStep = 'loading' | 'select' | 'uploading' | 'detecting' | 'review' | 'rendering' | 'done'

const SURFACE_COLORS: Record<string, string> = {
  wall: 'rgba(200,255,0,0.5)',
  object: 'rgba(107,33,255,0.5)',
  screen: 'rgba(59,130,246,0.5)',
  apparel: 'rgba(245,158,11,0.5)',
}

interface AssignmentData {
  campaignTitle: string
  brandName: string
  brandAssetUrl: string
  cpmRate: number
}

export default function VideoUploadPage({ params }: { params: { campaignId: string } }) {
  const router = useRouter()

  const [step, setStep] = useState<UploadStep>('loading')
  const [progress, setProgress] = useState(0)
  const [zones, setZones] = useState<SurfaceZone[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [error, setError] = useState('')
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(null)
  const [trackingCode, setTrackingCode] = useState('')

  // Load assignment + campaign data on mount
  useEffect(() => {
    async function loadAssignment() {
      try {
        const token = await getIdToken()
        const res = await fetch(`/api/creator/assignments/${params.campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Assignment not found')
        const data = await res.json()
        setAssignmentData(data.assignment)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setStep('select')
      }
    }
    loadAssignment()
  }, [params.campaignId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'video/*': ['.mp4', '.mov', '.webm'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 * 1024,
    onDrop: async files => {
      if (files[0]) await handleUpload(files[0])
    },
  })

  async function handleUpload(file: File) {
    setStep('uploading')
    setError('')
    try {
      const token = await getIdToken()

      // Get presigned URL
      const urlRes = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          assignmentId: params.campaignId,
        }),
      })
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, publicUrl } = await urlRes.json()

      // Upload directly to R2 with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)))
        xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'))
        xhr.send(file)
      })

      setStep('detecting')

      // Start AI surface detection
      const detectRes = await fetch('/api/ai/detect-surfaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ videoUrl: publicUrl, assignmentId: params.campaignId }),
      })
      if (!detectRes.ok) throw new Error('Surface detection failed to start')
      const { jobId } = await detectRes.json()

      await pollDetection(jobId, token ?? '')
    } catch (e) {
      setError((e as Error).message)
      setStep('select')
    }
  }

  async function pollDetection(jobId: string, token: string) {
    const MAX_ATTEMPTS = 60 // 3 minutes
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await new Promise(r => setTimeout(r, 3000))
      try {
        const res = await fetch(`/api/ai/detect-surfaces/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.status === 'completed' && data.zones?.length > 0) {
          setZones(data.zones)
          setStep('review')
          return
        }
        if (data.status === 'failed') {
          throw new Error(data.error ?? 'Surface detection failed')
        }
      } catch (pollErr) {
        // Transient network error — keep polling
        if (i === MAX_ATTEMPTS - 1) throw pollErr
      }
    }
    throw new Error('Detection timed out after 3 minutes. Please try again.')
  }

  async function handleConfirmZone() {
    if (!selectedZone) return
    setStep('rendering')
    setError('')
    try {
      const token = await getIdToken()
      const res = await fetch('/api/ai/render-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assignmentId: params.campaignId,
          selectedZoneId: selectedZone,
          brandAssetUrl: assignmentData?.brandAssetUrl ?? '',
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to start rendering')
      }

      const { trackingCode: code } = await res.json()
      if (code) setTrackingCode(code)
      setStep('done')
    } catch (e) {
      setError((e as Error).message)
      setStep('review')
    }
  }

  const stepIndex = ['loading', 'select', 'uploading', 'detecting', 'review', 'rendering', 'done'].indexOf(step)

  return (
    <div className="max-w-3xl">
      <h1 className="text-h2 font-syne text-text-primary mb-1">Upload Your Video</h1>
      {assignmentData && (
        <p className="text-text-secondary mb-6">
          Campaign: <span className="text-text-primary font-medium">{assignmentData.campaignTitle}</span>
          {' '}by {assignmentData.brandName} · ${assignmentData.cpmRate}/1K views
        </p>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {['Upload', 'AI Scan', 'Review', 'Done'].map((label, i) => {
          const uiStep = Math.max(0, stepIndex - 1)
          const done = i < uiStep
          const active = i === uiStep
          return (
            <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                done ? 'bg-lime text-black' : active ? 'border-2 border-lime text-lime' : 'bg-surface-3 text-text-muted'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${active ? 'text-text-primary' : 'text-text-muted'}`}>{label}</span>
              {i < 3 && <div className="flex-1 h-px bg-surface-3" />}
            </div>
          )
        })}
      </div>

      {/* Loading campaign data */}
      {step === 'loading' && (
        <div className="card text-center py-12">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading campaign details…</p>
        </div>
      )}

      {/* Select video */}
      {step === 'select' && (
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-lime bg-lime/5' : 'border-border hover:border-lime/40'
            }`}
          >
            <input {...getInputProps()} />
            <Upload size={40} className="mx-auto text-text-muted mb-4" />
            <p className="text-text-primary font-medium mb-2">Drop your video here</p>
            <p className="text-text-muted text-sm mb-4">or click to browse · MP4, MOV, WebM · up to 2GB</p>
            <Button variant="secondary" size="sm">Choose File</Button>
          </div>
          {error && (
            <div className="flex items-start gap-2 mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Uploading */}
      {step === 'uploading' && (
        <div className="card text-center py-12">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-text-primary font-medium mb-4">Uploading your video…</p>
          <div className="w-full bg-surface-3 rounded-full h-2.5 max-w-xs mx-auto mb-2">
            <div className="bg-lime h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-text-muted text-sm">{progress}% uploaded</p>
        </div>
      )}

      {/* Detecting */}
      {step === 'detecting' && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4 animate-pulse">✨</div>
          <p className="text-text-primary font-medium mb-2">AI is scanning your video…</p>
          <p className="text-text-secondary text-sm mb-4">Detecting walls, objects, and screens suitable for brand placement</p>
          <p className="text-text-muted text-xs">Usually takes 30–90 seconds</p>
        </div>
      )}

      {/* Review surfaces */}
      {step === 'review' && (
        <div>
          <div className="card mb-4">
            <h3 className="text-h3 font-syne text-text-primary mb-2">
              {zones.length} surface{zones.length !== 1 ? 's' : ''} detected
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Choose where the brand placement appears. Higher confidence = more stable, less distracting.
            </p>
            <div className="space-y-3">
              {zones.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedZone === zone.id
                      ? 'border-lime bg-lime/5'
                      : 'border-border hover:border-surface-3'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ background: SURFACE_COLORS[zone.type] ?? '#666' }} />
                      <div>
                        <span className="font-medium text-text-primary capitalize">{zone.type}</span>
                        <span className="text-text-muted text-sm ml-2">— {zone.label}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-text-primary">{Math.round(zone.confidence * 100)}%</span>
                      <span className="text-xs text-text-muted ml-1">confidence</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
              <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep('select')}>← Back</Button>
            <Button onClick={handleConfirmZone} disabled={!selectedZone} className="flex-1">
              Confirm &amp; Start Rendering →
            </Button>
          </div>
        </div>
      )}

      {/* Rendering */}
      {step === 'rendering' && (
        <div className="card text-center py-12">
          <Loader2 size={40} className="mx-auto text-lime animate-spin mb-4" />
          <p className="text-text-primary font-medium mb-2">Starting render job…</p>
          <p className="text-text-secondary text-sm">Submitting to our render pipeline. This takes 5–15 minutes.</p>
          <p className="text-text-muted text-xs mt-4">You can close this page — we&apos;ll notify you when it&apos;s ready.</p>
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="card text-center py-12">
          <CheckCircle size={48} className="mx-auto text-lime mb-4" />
          <h3 className="text-h2 font-syne text-text-primary mb-3">Render job submitted!</h3>
          <p className="text-text-secondary mb-2">
            Your video is being rendered with the brand included.
          </p>
          {trackingCode && (
            <p className="text-text-muted text-sm mb-6">
              Tracking code: <span className="font-mono text-lime">{trackingCode}</span>
            </p>
          )}
          <p className="text-text-muted text-sm mb-8">
            Takes 5–15 minutes. We&apos;ll send a notification when your video is ready to download.
          </p>
          <Button onClick={() => router.push('/videos')}>
            View My Videos →
          </Button>
        </div>
      )}
    </div>
  )
}
