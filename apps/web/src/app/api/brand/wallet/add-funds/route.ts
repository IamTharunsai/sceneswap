import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(token)
    const supabase = createAdminClient()

    const { data: brand } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', decoded.uid)
      .single()

    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

    const body = await req.json()
    const amount = parseInt(body.amount)

    if (!amount || amount < 2000) {
      return NextResponse.json({ error: 'Minimum deposit is ₹2,000' }, { status: 400 })
    }

    // Razorpay stub — will be replaced with real order when keys are available
    const orderId = `order_stub_${Date.now()}`

    return NextResponse.json({ orderId, amount, currency: 'INR', status: 'stub' })
  } catch (err) {
    console.error('Add funds error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
