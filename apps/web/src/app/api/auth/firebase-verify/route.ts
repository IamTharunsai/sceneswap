import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/clients/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) return NextResponse.json({ error: 'Token required' }, { status: 400 })

    const decoded = await verifyIdToken(idToken)
    return NextResponse.json({ userId: decoded.uid, email: decoded.email })
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
