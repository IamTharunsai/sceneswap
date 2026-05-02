import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { calculateEarningsFromViews } from '@/lib/utils/earnings'

export async function GET(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(idToken)
    const supabase = createAdminClient()

    const { data: user } = await supabase.from('users').select('id').eq('firebase_uid', decoded.uid).single()
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: creator } = await supabase.from('creator_profiles').select('id').eq('user_id', user.id).single()
    if (!creator) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: assignments } = await supabase
      .from('creator_campaign_assignments')
      .select('*, campaign:campaigns(title, cpm_rate, brand:brand_profiles(brand_name))')
      .eq('creator_id', creator.id)
      .not('status', 'eq', 'available')
      .order('created_at', { ascending: false })

    const videos = (assignments ?? []).map(a => ({
      id: a.id,
      campaignTitle: (a.campaign as { title: string })?.title ?? '',
      brandName: ((a.campaign as { brand: { brand_name: string } })?.brand as { brand_name: string })?.brand_name ?? '',
      views: a.views_verified,
      rate: (a.campaign as { cpm_rate: number })?.cpm_rate ?? 0,
      earned: a.earnings_amount,
      status: a.status,
      trackingCode: a.tracking_code,
      renderedUrl: a.rendered_video_url,
    }))

    return NextResponse.json({ videos })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
