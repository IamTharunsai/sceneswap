import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'

export async function GET(
  req: NextRequest,
  { params }: { params: { videoId: string } }
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
        rendered_video_url,
        video_url,
        views_verified,
        earnings_amount,
        campaign:campaigns(
          title,
          cpm_rate,
          brand:brand_profiles(brand_name)
        )
      `)
      .eq('id', params.videoId)
      .eq('creator_id', creator.id)
      .single()

    if (!assignment) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

    const campaign = (assignment.campaign as unknown) as {
      title: string
      cpm_rate: number
      brand: { brand_name: string } | null
    } | null

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sceneswap.com'

    return NextResponse.json({
      video: {
        id: assignment.id,
        status: assignment.status,
        trackingCode: assignment.tracking_code,
        renderedVideoUrl: assignment.rendered_video_url,
        videoUrl: assignment.video_url,
        viewsVerified: assignment.views_verified ?? 0,
        earningsAmount: assignment.earnings_amount ?? 0,
        campaignTitle: campaign?.title ?? '',
        brandName: campaign?.brand?.brand_name ?? '',
        cpmRate: campaign?.cpm_rate ?? 0,
        trackingUrl: assignment.tracking_code
          ? `${appUrl}/api/track/${assignment.tracking_code}`
          : null,
      },
    })
  } catch (err) {
    console.error('Video detail error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
