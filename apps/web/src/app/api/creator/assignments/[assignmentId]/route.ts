import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function GET(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(token)
    const supabase = createAdminClient()

    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('id')
      .eq('user_id', decoded.uid)
      .single()

    if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

    const { data: assignment } = await supabase
      .from('creator_campaign_assignments')
      .select(`
        id,
        status,
        tracking_code,
        campaign:campaigns(
          title,
          cpm_rate,
          brand_asset_url,
          brand:brand_profiles(brand_name)
        )
      `)
      .eq('id', params.assignmentId)
      .eq('creator_id', creator.id)
      .single()

    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    const campaign = (assignment.campaign as unknown) as {
      title: string
      cpm_rate: number
      brand_asset_url: string
      brand: { brand_name: string } | null
    } | null

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        status: assignment.status,
        campaignTitle: campaign?.title ?? '',
        brandName: campaign?.brand?.brand_name ?? '',
        brandAssetUrl: campaign?.brand_asset_url ?? '',
        cpmRate: campaign?.cpm_rate ?? 0,
      },
    })
  } catch (err) {
    console.error('Assignment detail error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
