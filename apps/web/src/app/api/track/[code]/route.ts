import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'

// This endpoint must respond in < 100ms
// It: logs the event, increments views, and 301 redirects to campaign destination
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params

  // Validate code format fast (no DB call)
  if (!code || !/^[a-zA-Z0-9]{12}$/.test(code)) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const supabase = createAdminClient()

    // Lookup assignment by tracking code
    const { data: assignment } = await supabase
      .from('creator_campaign_assignments')
      .select('id, campaign:campaigns(brand_asset_url, status)')
      .eq('tracking_code', code)
      .single()

    if (!assignment) {
      return new NextResponse('Not found', { status: 404 })
    }

    const campaign = (assignment.campaign as unknown) as { brand_asset_url: string; status: string } | null

    // Log the analytics event (fire and forget — don't await)
    const ipRaw = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''
    const ip = ipRaw.split(',')[0].trim()
    const geo = (req as unknown as { geo?: { country?: string; region?: string; city?: string } }).geo

    // Non-blocking insert
    supabase
      .from('video_analytics_events')
      .insert({
        assignment_id: assignment.id,
        tracking_code: code,
        event_type: 'click',
        ip_hash: ip ? Buffer.from(ip).toString('base64').slice(0, 16) : null,
        country: geo?.country ?? null,
        region: geo?.region ?? null,
        city: geo?.city ?? null,
        device_type: req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
        referrer: req.headers.get('referer') ?? null,
      })
      .then(() => {
        // Also increment views counter (can be batched later for scale)
        supabase.rpc('increment_assignment_views', { p_tracking_code: code, p_count: 1 })
      })

    // Determine destination URL
    // For now redirect to a sceneswap analytics page that then redirects out
    const destination = campaign?.brand_asset_url
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/track/${code}/out`
      : `${process.env.NEXT_PUBLIC_APP_URL}`

    return NextResponse.redirect(destination, { status: 301 })
  } catch (err) {
    console.error('Track error:', err)
    // Still redirect even on error — never break the creator's link
    return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL ?? 'https://sceneswap.com', {
      status: 301,
    })
  }
}
