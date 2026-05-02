import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { startSceneAnalysis } from '@/lib/ai/analyze-scene'
import type { ProductType } from '@sceneswap/types'

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await verifyIdToken(idToken)

    const { videoUrl, assignmentId } = await req.json()

    // Validate video URL is from our R2 bucket
    const r2Domain = process.env.R2_PUBLIC_URL ?? ''
    if (r2Domain && !videoUrl.startsWith(r2Domain)) {
      return NextResponse.json({ error: 'Invalid video URL' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get assignment → campaign → product_type so scene analysis is product-aware
    const { data: assignment } = await supabase
      .from('creator_campaign_assignments')
      .select('id, campaign:campaigns(product_type, brand_asset_url)')
      .eq('id', assignmentId)
      .single()

    const productType: ProductType =
      (assignment?.campaign as { product_type?: ProductType } | null)?.product_type ?? 'other'

    // Mark assignment as processing
    await supabase
      .from('creator_campaign_assignments')
      .update({ status: 'processing', video_url: videoUrl })
      .eq('id', assignmentId)

    // Step 1: Extract keyframe via Modal (non-blocking — we trigger it async)
    // In production this calls Modal's extract_keyframe function.
    // For now we pass videoUrl directly; Modal URL is configured via MODAL_EXTRACT_FRAME_URL.
    let keyframeUrl: string | undefined
    const modalExtractUrl = process.env.MODAL_EXTRACT_FRAME_URL
    if (modalExtractUrl) {
      const extractRes = await fetch(modalExtractUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MODAL_TOKEN_ID ?? ''}`,
        },
        body: JSON.stringify({ video_url: videoUrl, assignment_id: assignmentId }),
      }).catch(() => null)

      if (extractRes?.ok) {
        const { frame_url } = await extractRes.json().catch(() => ({}))
        keyframeUrl = frame_url
      }
    }

    // Step 2: Start scene analysis with product-type-aware prompts
    const { jobId } = await startSceneAnalysis(videoUrl, productType, keyframeUrl)

    await supabase
      .from('creator_campaign_assignments')
      .update({ render_job_id: jobId })
      .eq('id', assignmentId)

    return NextResponse.json({ jobId, estimatedSeconds: 45, productType })
  } catch (err) {
    console.error('Scene analysis error:', err)
    return NextResponse.json({ error: 'Scene analysis failed' }, { status: 500 })
  }
}
