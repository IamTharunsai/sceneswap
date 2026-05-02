import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(token)
    const supabase = createAdminClient()

    const { data: brand } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', decoded.uid)
      .single()

    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', params.campaignId)
      .eq('brand_id', brand.id)
      .single()

    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    const { data: assignments } = await supabase
      .from('creator_campaign_assignments')
      .select(`
        id,
        status,
        tracking_code,
        views_verified,
        earnings_amount,
        creator:creator_profiles(display_name)
      `)
      .eq('campaign_id', params.campaignId)
      .order('created_at', { ascending: false })

    const formattedAssignments = (assignments ?? []).map(a => {
      const creator = (a.creator as unknown) as { display_name: string } | null
      return {
        id: a.id,
        creatorName: creator?.display_name ?? 'Creator',
        status: a.status,
        viewsVerified: a.views_verified ?? 0,
        earningsAmount: a.earnings_amount ?? 0,
        trackingCode: a.tracking_code,
      }
    })

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status,
        cpmRate: campaign.cpm_rate,
        totalBudget: campaign.total_budget,
        spentAmount: campaign.spent_amount ?? 0,
        surfacePreference: campaign.surface_preference,
        createdAt: campaign.created_at,
        assignments: formattedAssignments,
      },
    })
  } catch (err) {
    console.error('Campaign detail error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
