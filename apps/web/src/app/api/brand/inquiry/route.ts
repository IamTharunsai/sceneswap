import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/clients/supabase-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const NOTIFY_EMAIL = 'nandinimorigadi@gmail.com'

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

    // Notify SceneSwap team of new brand inquiry
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_your')) {
      await resend.emails.send({
        from: 'SceneSwap <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        subject: `🎯 New Brand Inquiry — ${company}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#C8FF00;background:#080808;padding:16px;border-radius:8px;margin:0 0 24px">
              New Brand Partnership Inquiry
            </h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#666;width:120px">Company</td><td style="padding:8px 0;font-weight:bold">${company}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Contact</td><td style="padding:8px 0">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${phone}</td></tr>` : ''}
              ${category ? `<tr><td style="padding:8px 0;color:#666">Category</td><td style="padding:8px 0">${category}</td></tr>` : ''}
              ${budget ? `<tr><td style="padding:8px 0;color:#666">Budget</td><td style="padding:8px 0">${budget}</td></tr>` : ''}
            </table>
            <p style="margin-top:24px;color:#666;font-size:14px">Submitted via SceneSwap founding brand form</p>
          </div>
        `,
      }).catch(e => console.warn('Email notify failed (non-fatal):', e.message))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Brand inquiry error:', err)
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
  }
}
