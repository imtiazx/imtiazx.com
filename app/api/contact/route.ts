import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, subject, message } = await req.json()

  if (!email || !subject || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: 'Portfolio Contact <noreply@imtiazx.com>',
    to: 'imtiazx@protonmail.com',
    replyTo: email,
    subject: `[Portfolio] ${subject}`,
    text: `From: ${email}\n\n${message}`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
