import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const decoded = await verifyIdToken(idToken)

    const supabase = createAdminClient()

    // Look up user in our DB
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', decoded.uid)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let creatorProfile = null
    let brandProfile = null

    if (user.role === 'creator') {
      const { data } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      creatorProfile = data
    } else if (user.role === 'brand') {
      const { data } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      brandProfile = data
    }

    return NextResponse.json({ role: user.role, creatorProfile, brandProfile })
  } catch (err) {
    console.error('Session error:', err)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
