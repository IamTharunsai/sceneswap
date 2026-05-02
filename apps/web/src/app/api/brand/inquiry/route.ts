import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, company, category, budget } = await req.json()

    if (!name || !email || !company) {
      return NextResponse.json({ error: 'name, email, and company are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('brand_inquiries').insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() ?? null,
      company: company.trim(),
      category: category?.trim() ?? null,
      budget: budget?.trim() ?? null,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Brand inquiry error:', err)
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
  }
}
