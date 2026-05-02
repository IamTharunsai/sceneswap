import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    // Verify signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (secret && signature) {
      const expected = createHmac('sha256', secret).update(body).digest('hex')
      if (expected !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    const supabase = createAdminClient()

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const { brand_id, amount } = payment.notes ?? {}

      if (brand_id && amount) {
        // Add funds to wallet
        const { data: brand } = await supabase
          .from('brand_profiles')
          .select('wallet_balance')
          .eq('id', brand_id)
          .single()

        if (brand) {
          const amountINR = amount / 100 // Razorpay uses paise

          await supabase
            .from('brand_profiles')
            .update({ wallet_balance: brand.wallet_balance + amountINR })
            .eq('id', brand_id)

          await supabase.from('wallet_transactions').insert({
            brand_id,
            type: 'deposit',
            amount: amountINR,
            description: 'Wallet recharge via Razorpay',
            razorpay_payment_id: payment.id,
          })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Razorpay webhook error:', err)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
