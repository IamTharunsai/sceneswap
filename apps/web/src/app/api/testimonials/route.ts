import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { name, role, content, rating } = await req.json()

    if (!name || !content) {
      return NextResponse.json({ error: 'name and content are required' }, { status: 400 })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('testimonials').insert({
      name: name.trim(),
      role: role?.trim() ?? null,
      content: content.trim(),
      rating: rating ?? 5,
      approved: false, // requires manual approval before showing publicly
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Testimonial error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, name, role, content, rating, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ testimonials: data ?? [] })
  } catch {
    return NextResponse.json({ testimonials: [] })
  }
}
