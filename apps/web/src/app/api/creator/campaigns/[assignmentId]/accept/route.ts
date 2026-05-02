import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(token)
    const supabase = createAdminClient()

    // Get creator profile
    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('id')
      .eq('user_id', decoded.uid)
      .single()

    if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 })

    // Verify assignment belongs to this creator and is still available
    const { data: assignment } = await supabase
      .from('creator_campaign_assignments')
      .select('id, status, campaign:campaigns(title)')
      .eq('id', params.assignmentId)
      .eq('creator_id', creator.id)
      .single()

    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    if (assignment.status !== 'available') {
      return NextResponse.json(
        { error: `Assignment is already ${assignment.status}` },
        { status: 409 }
      )
    }

    // Accept it
    const { error } = await supabase
      .from('creator_campaign_assignments')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', params.assignmentId)
      .eq('creator_id', creator.id)

    if (error) throw error

    const campaignTitle = ((assignment.campaign as unknown) as { title: string } | null)?.title ?? 'Campaign'
    return NextResponse.json({ ok: true, assignmentId: params.assignmentId, campaignTitle })
  } catch (err) {
    console.error('Accept campaign error:', err)
    return NextResponse.json({ error: 'Failed to accept campaign' }, { status: 500 })
  }
}
