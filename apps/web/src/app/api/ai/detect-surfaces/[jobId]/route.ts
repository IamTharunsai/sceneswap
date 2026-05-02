import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { getSceneAnalysisStatus } from '@/lib/ai/analyze-scene'
import type { ProductType } from '@sceneswap/types'

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await verifyIdToken(idToken)

    const supabase = createAdminClient()

    // Fetch the assignment to know which product type to use for fallback zones
    const { data: assignment } = await supabase
      .from('creator_campaign_assignments')
      .select('campaign:campaigns(product_type)')
      .eq('render_job_id', params.jobId)
      .single()

    const productType: ProductType =
      (assignment?.campaign as { product_type?: ProductType } | null)?.product_type ?? 'other'

    const result = await getSceneAnalysisStatus(params.jobId, productType)

    // Persist zones to DB when analysis completes (status stays 'processing'
    // until creator confirms zone and rendering starts)
    if (result.status === 'completed' && result.zones) {
      await supabase
        .from('creator_campaign_assignments')
        .update({ surface_zones: result.zones })
        .eq('render_job_id', params.jobId)
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Scene analysis status error:', err)
    return NextResponse.json({ status: 'failed', error: 'Failed to get status' })
  }
}
