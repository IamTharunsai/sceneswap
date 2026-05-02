import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { idToken, displayName, niche, instagramHandle, youtubeHandle, city, state, followerCount } = body

    const decoded = await verifyIdToken(idToken)
    const supabase = createAdminClient()

    // Upsert user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(
        { firebase_uid: decoded.uid, email: decoded.email!, role: 'creator' },
        { onConflict: 'firebase_uid' }
      )
      .select()
      .single()

    if (userError) throw userError

    // Create creator profile
    const { data: profile, error: profileError } = await supabase
      .from('creator_profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: displayName || decoded.email!.split('@')[0],
          niche: niche || [],
          instagram_handle: instagramHandle || null,
          youtube_handle: youtubeHandle || null,
          city: city || null,
          state: state || null,
          follower_count: parseInt(followerCount || '0'),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (profileError) throw profileError

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Creator profile error:', err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}

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

    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
