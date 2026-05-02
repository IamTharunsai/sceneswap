import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'
import type { WaitlistRequest } from '@sceneswap/types'

export async function POST(req: NextRequest) {
  try {
    const body: WaitlistRequest = await req.json()
    const { email, type } = body

    if (!email || !type) {
      return NextResponse.json({ error: 'email and type are required' }, { status: 400 })
    }

    if (!['creator', 'brand'].includes(type)) {
      return NextResponse.json({ error: 'type must be creator or brand' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('waitlist')
      .upsert({ email: email.toLowerCase().trim(), type }, { onConflict: 'email' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}
