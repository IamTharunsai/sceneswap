import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { idToken, brandName, category, gstNumber, website, contactName, contactPhone } = body

    const decoded = await verifyIdToken(idToken)
    const supabase = createAdminClient()

    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(
        { firebase_uid: decoded.uid, email: decoded.email!, role: 'brand' },
        { onConflict: 'firebase_uid' }
      )
      .select()
      .single()

    if (userError) throw userError

    const { data: profile, error } = await supabase
      .from('brand_profiles')
      .upsert(
        {
          user_id: user.id,
          brand_name: brandName,
          category,
          gst_number: gstNumber || null,
          website: website || null,
          contact_name: contactName,
          contact_phone: contactPhone,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Brand profile error:', err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
