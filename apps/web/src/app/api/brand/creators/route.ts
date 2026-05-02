import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await verifyIdToken(token)

    const url = new URL(req.url)
    const search = url.searchParams.get('q')?.toLowerCase()
    const niche = url.searchParams.get('niche')

    const supabase = createAdminClient()

    let query = supabase
      .from('creator_profiles')
      .select('id, display_name, niche, follower_count, avg_views, location, total_earned')
      .order('follower_count', { ascending: false })
      .limit(50)

    if (niche) query = query.eq('niche', niche)
    if (search) query = query.ilike('display_name', `%${search}%`)

    const { data: creators } = await query

    const formatted = (creators ?? []).map(c => ({
      id: c.id,
      displayName: c.display_name ?? 'Creator',
      niche: c.niche ?? 'Lifestyle',
      followerCount: c.follower_count ?? 0,
      avgViews: c.avg_views ?? 0,
      totalVideos: 0,
      rating: 4.5,
      location: c.location ?? 'India',
    }))

    return NextResponse.json({ creators: formatted })
  } catch (err) {
    console.error('Brand creators error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
