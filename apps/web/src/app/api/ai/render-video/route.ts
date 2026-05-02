import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { generateTrackingCode } from '@/lib/utils/tracking'
import type { SurfaceZone } from '@sceneswap/types'

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await verifyIdToken(idToken)

    const { assignmentId, selectedZoneId } = await req.json()
    const supabase = createAdminClient()

    // Fetch assignment with campaign brand asset + product info
    const { data: assignment } = await supabase
      .from('creator_campaign_assignments')
      .select(`
        id, video_url, surface_zones,
        campaign:campaigns(
          brand_asset_url,
          brand_asset_type,
          product_type,
          product_description,
          title
        )
      `)
      .eq('id', assignmentId)
      .single()

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (!assignment.video_url) {
      return NextResponse.json({ error: 'No video uploaded yet' }, { status: 400 })
    }

    const campaign = (assignment.campaign as unknown) as {
      brand_asset_url: string
      brand_asset_type: string
      product_type: string
      product_description: string | null
      title: string
    } | null

    if (!campaign?.brand_asset_url) {
      return NextResponse.json({ error: 'Brand has no product asset uploaded' }, { status: 400 })
    }

    // Find the selected zone from stored surface_zones
    const zones = (assignment.surface_zones ?? []) as SurfaceZone[]
    const selectedZone = zones.find(z => z.id === selectedZoneId)

    if (!selectedZone) {
      return NextResponse.json({ error: 'Selected zone not found' }, { status: 404 })
    }

    // Generate tracking code (creator can share link even while rendering)
    const trackingCode = generateTrackingCode()

    // Build the full render payload — pass corners + all placement context to Modal
    const renderPayload = {
      video_url: assignment.video_url,
      product_url: campaign.brand_asset_url,
      zone: {
        id: selectedZone.id,
        type: selectedZone.type,
        label: selectedZone.label,
        coordinates: selectedZone.coordinates,
        corners: selectedZone.corners ?? null,
        frame_start: selectedZone.frame_start,
        frame_end: selectedZone.frame_end,
        depth_estimate: selectedZone.depth_estimate ?? 0.5,
        placement_context: selectedZone.placement_context ?? null,
      },
      assignment_id: assignmentId,
      tracking_code: trackingCode,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://sceneswap.app'}/api/webhooks/modal`,
    }

    // Trigger Modal.com render job
    const modalEndpoint = process.env.MODAL_RENDER_URL ?? process.env.MODAL_ENDPOINT ?? ''
    let jobId = `job-${Date.now()}`

    if (modalEndpoint) {
      const modalRes = await fetch(modalEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MODAL_TOKEN_ID ?? ''}`,
        },
        body: JSON.stringify(renderPayload),
      }).catch(() => null)

      if (modalRes?.ok) {
        const body = await modalRes.json().catch(() => ({}))
        jobId = body.call_id ?? body.job_id ?? jobId
      }
    }

    // Update assignment: zone selected, render started
    await supabase
      .from('creator_campaign_assignments')
      .update({
        selected_zone_id: selectedZoneId,
        render_job_id: jobId,
        tracking_code: trackingCode,
        status: 'rendering',
      })
      .eq('id', assignmentId)

    return NextResponse.json({ jobId, trackingCode })
  } catch (err) {
    console.error('Render video error:', err)
    return NextResponse.json({ error: 'Failed to start rendering' }, { status: 500 })
  }
}
