import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(idToken)
    const supabase = createAdminClient()

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', decoded.uid)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!creator) return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })

    const { data: assignments } = await supabase
      .from('creator_campaign_assignments')
      .select(`
        *,
        campaign:campaigns(
          *,
          brand:brand_profiles(brand_name, logo_url, category)
        )
      `)
      .eq('creator_id', creator.id)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    return NextResponse.json({ assignments: assignments ?? [] })
  } catch (err) {
    console.error('Get campaigns error:', err)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}
