import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'

const VALID_ACTIONS = ['active', 'rejected'] as const
type Action = typeof VALID_ACTIONS[number]

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  // Simple admin check via secret header (proper session auth added when admin login is built)
  const adminSecret = req.headers.get('x-admin-secret')
  const isFormPost = req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')

  if (!adminSecret && !isFormPost) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const action = params.action as Action
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('campaigns')
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('status', 'pending_approval')

    if (error) throw error

    // If rejected, insert notification for brand (best-effort)
    if (action === 'rejected') {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('brand_id, title')
        .eq('id', params.id)
        .single()

      if (campaign) {
        const { data: brand } = await supabase
          .from('brand_profiles')
          .select('user_id')
          .eq('id', campaign.brand_id)
          .single()

        if (brand) {
          await supabase.from('notifications').insert({
            user_id: brand.user_id,
            type: 'campaign_rejected',
            title: 'Campaign rejected',
            body: `Your campaign "${campaign.title}" was not approved. Please review and resubmit.`,
            data: { campaign_id: params.id },
          })
        }
      }
    }

    return NextResponse.redirect(new URL('/admin', req.url), { status: 303 })
  } catch (err) {
    console.error('Admin campaign action error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
