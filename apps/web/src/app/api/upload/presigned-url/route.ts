import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { verifyIdToken } from '@/lib/clients/firebase-admin'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyIdToken(idToken)
    const { filename, contentType, assignmentId } = await req.json()

    // Sanitize filename and build key
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'mp4'
    const key = `videos/${decoded.uid}/${assignmentId}/${Date.now()}.${ext}`

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

    return NextResponse.json({ uploadUrl, publicUrl, key })
  } catch (err) {
    console.error('Presigned URL error:', err)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
