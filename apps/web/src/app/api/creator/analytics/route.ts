import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'

export async function GET(req: NextRequest) {
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

    const { data: assignments } = await supabase
      .from('creator_campaign_assignments')
      .select(`
        id,
        status,
        views_verified,
        earnings_amount,
        campaign:campaigns(title)
      `)
      .eq('creator_id', creator.id)

    const all = assignments ?? []

    const totalViews = all.reduce((sum, a) => sum + (a.views_verified ?? 0), 0)
    const totalEarnings = all.reduce((sum, a) => sum + (a.earnings_amount ?? 0), 0)
    const activeVideos = all.filter(a => ['ready', 'posted'].includes(a.status)).length

    const topVideo = all.length > 0
      ? all.reduce((best, a) => (a.views_verified ?? 0) > (best.views_verified ?? 0) ? a : best)
      : null

    const { count: totalClicks } = await supabase
      .from('video_analytics_events')
      .select('*', { count: 'exact', head: true })
      .in('assignment_id', all.map(a => a.id))
      .eq('event_type', 'click')

    return NextResponse.json({
      summary: {
        totalViews,
        totalClicks: totalClicks ?? 0,
        totalEarnings,
        activeVideos,
        topVideo: topVideo
          ? {
              campaignTitle: ((topVideo.campaign as unknown) as { title: string } | null)?.title ?? '',
              views: topVideo.views_verified ?? 0,
              earnings: topVideo.earnings_amount ?? 0,
            }
          : null,
      },
    })
  } catch (err) {
    console.error('Creator analytics error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
