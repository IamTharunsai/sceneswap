import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'
import { createAdminClient } from '@/lib/clients/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(token)
    const supabase = createAdminClient()

    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, type, title, body, read, created_at, data')
      .eq('user_id', decoded.uid)
      .order('created_at', { ascending: false })
      .limit(20)

    const unreadCount = (notifications ?? []).filter(n => !n.read).length

    return NextResponse.json({ notifications: notifications ?? [], unreadCount })
  } catch (err) {
    console.error('Notifications error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(token)
    const supabase = createAdminClient()

    const body = await req.json()
    const ids: string[] = body.ids ?? []

    if (ids.length === 0) {
      // Mark all as read
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', decoded.uid)
        .eq('read', false)
    } else {
      await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', ids)
        .eq('user_id', decoded.uid)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Mark read error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
