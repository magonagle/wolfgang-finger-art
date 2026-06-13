import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { contactSchema } from '@/lib/validations'

const resend = new Resend(process.env.RESEND_API_KEY)

async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  })
  const data = await res.json()
  return data.success === true
}

export async function POST(request: Request) {
  const body = await request.json()
  const { turnstileToken, ...fields } = body

  // Verify Turnstile — skip in dev if no key set
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return NextResponse.json({ error: 'Missing captcha token' }, { status: 400 })
    }
    const valid = await verifyTurnstile(turnstileToken)
    if (!valid) {
      return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400 })
    }
  }

  const result = contactSchema.safeParse(fields)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 })
  }

  const { name, email, message } = result.data

  // Save to database
  const supabase = await createServiceClient()
  const { error: dbError } = await supabase.from('contact_messages').insert(result.data)
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  // Send email notification if configured
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
    await resend.emails.send({
      from: 'Wolfgang Finger <hello@wolfgangsart.com>',
      to: process.env.CONTACT_TO_EMAIL,
      cc: process.env.CONTACT_CC_EMAIL ? [process.env.CONTACT_CC_EMAIL] : undefined,
      replyTo: email,
      subject: `New message from ${name} — wolfgangsart.com`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr />
        <p style="color: #888; font-size: 12px;">Sent from wolfgangsart.com contact form</p>
      `,
    })
  }

  return NextResponse.json({ ok: true })
}
