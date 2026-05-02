import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { getMatchingCreators } from '@/lib/db/creators'
import { createAssignments } from '@/lib/db/assignments'

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(idToken)
    const supabase = createAdminClient()

    // Get brand profile
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', decoded.uid)
      .single()

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: brand } = await supabase
      .from('brand_profiles')
      .select('id, wallet_balance')
      .eq('user_id', user.id)
      .single()

    if (!brand) return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })

    const body = await req.json()
    const {
      title,
      description,
      surface_preference,
      cpm_rate,
      total_budget,
      target_niches,
      target_regions,
      min_followers,
      start_date,
      end_date,
      brand_asset_url,
      brand_asset_type,
      allowed_categories,
    } = body

    // Validate required fields
    if (!title || !surface_preference || !cpm_rate || !total_budget || !brand_asset_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (total_budget < 2000) {
      return NextResponse.json({ error: 'Minimum budget is ₹2,000' }, { status: 400 })
    }

    // Check wallet balance
    if (brand.wallet_balance < total_budget) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance. Please add funds.' },
        { status: 402 }
      )
    }

    // Create campaign
    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .insert({
        brand_id: brand.id,
        title,
        description,
        surface_preference,
        cpm_rate,
        total_budget,
        target_niches: target_niches ?? [],
        target_regions: target_regions ?? [],
        min_followers: min_followers ?? 0,
        start_date,
        end_date,
        brand_asset_url,
        brand_asset_type: brand_asset_type ?? 'image',
        allowed_categories: allowed_categories ?? [],
        status: 'pending_approval',
      })
      .select()
      .single()

    if (campError) throw campError

    // Find matching creators
    const matchingCreators = await getMatchingCreators({
      niches: target_niches ?? [],
      regions: target_regions ?? [],
      minFollowers: min_followers ?? 0,
      limit: 50,
    })

    // Create assignments for matched creators
    if (matchingCreators.length > 0) {
      await createAssignments(
        matchingCreators.map(c => ({
          creator_id: c.id,
          campaign_id: campaign.id,
        }))
      )
    }

    // Deduct from wallet
    await supabase
      .from('brand_profiles')
      .update({ wallet_balance: brand.wallet_balance - total_budget })
      .eq('id', brand.id)

    // Log wallet transaction
    await supabase.from('wallet_transactions').insert({
      brand_id: brand.id,
      type: 'campaign_spend',
      amount: -total_budget,
      description: `Campaign: ${title}`,
      campaign_id: campaign.id,
    })

    return NextResponse.json({
      campaignId: campaign.id,
      matchedCreators: matchingCreators.length,
      estimatedReach: Math.round(total_budget / cpm_rate) * 1000,
    })
  } catch (err) {
    console.error('Create campaign error:', err)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(idToken)
    const supabase = createAdminClient()

    const { data: user } = await supabase.from('users').select('id').eq('firebase_uid', decoded.uid).single()
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: brand } = await supabase.from('brand_profiles').select('id').eq('user_id', user.id).single()
    if (!brand) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('brand_id', brand.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ campaigns: campaigns ?? [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}
