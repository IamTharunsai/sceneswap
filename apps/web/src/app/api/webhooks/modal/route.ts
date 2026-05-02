import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { calculateEarningsFromViews } from '@/lib/utils/earnings'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  // Timing-safe compare
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    // Verify HMAC signature if secret is configured
    const secret = process.env.MODAL_WEBHOOK_SECRET
    if (secret) {
      const sig = req.headers.get('x-modal-signature')
      if (!verifySignature(rawBody, sig, secret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const body = JSON.parse(rawBody)
    const { job_id, status, output_url, assignment_id } = body

    if (!assignment_id) {
      return NextResponse.json({ error: 'Missing assignment_id' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Idempotency: check if already processed
    const { data: existing } = await supabase
      .from('creator_campaign_assignments')
      .select('status, rendered_video_url')
      .eq('id', assignment_id)
      .single()

    if (existing?.status === 'ready' || existing?.status === 'posted') {
      // Already processed — success without duplicate work
      return NextResponse.json({ ok: true, skipped: true })
    }

    if (status === 'failed') {
      await supabase
        .from('creator_campaign_assignments')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', assignment_id)
      console.error('Modal render job failed:', job_id)
      return NextResponse.json({ ok: true })
    }

    if (status !== 'completed' || !output_url) {
      return NextResponse.json({ ok: true })
    }

    // Fetch full assignment to calculate earnings
    const { data: assignment } = await supabase
      .from('creator_campaign_assignments')
      .select(`
        id,
        views_verified,
        tracking_code,
        creator:creator_profiles(user_id, display_name),
        campaign:campaigns(title, cpm_rate)
      `)
      .eq('id', assignment_id)
      .single()

    const campaign = (assignment?.campaign as unknown) as { title: string; cpm_rate: number } | null
    const creator = (assignment?.creator as unknown) as { user_id: string; display_name: string } | null

    // Calculate initial earnings based on existing views (usually 0 at this point)
    const views = assignment?.views_verified ?? 0
    const cpmRate = campaign?.cpm_rate ?? 0
    const earningsAmount = calculateEarningsFromViews(views, cpmRate)

    // Update assignment: rendered video ready
    await supabase
      .from('creator_campaign_assignments')
      .update({
        rendered_video_url: output_url,
        status: 'ready',
        earnings_amount: earningsAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignment_id)

    // Notify creator
    if (creator?.user_id) {
      await supabase.from('notifications').insert({
        user_id: creator.user_id,
        type: 'video_ready',
        title: 'Your video is ready! 🎬',
        body: `"${campaign?.title ?? 'Your campaign video'}" has been rendered. Download it and share your tracking link to start earning.`,
        data: { assignment_id, video_url: output_url },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Modal webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
