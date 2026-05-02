import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'

export const revalidate = 60 // cache 60s

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
