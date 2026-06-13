import { Resend } from 'resend'

const FROM = 'Wolfgang Finger <hello@wolfgangsart.com>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendAdminNotification(subject: string, html: string) {
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_CC_EMAIL) return
  await getResend().emails.send({
    from: FROM,
    replyTo: 'fingersoccer@aol.com',
    to: process.env.CONTACT_CC_EMAIL,
    subject,
    html,
  })
}

export async function sendShippingConfirmation({
  to,
  customerName,
  artworkTitle,
  trackingNumber,
}: {
  to: string
  customerName: string | null
  artworkTitle: string
  trackingNumber: string
}) {
  if (!process.env.RESEND_API_KEY) return
  await getResend().emails.send({
    from: FROM,
    replyTo: 'fingersoccer@aol.com',
    to,
    subject: 'Your order has shipped — Wolfgang Finger',
    html: `
      <p>Hi${customerName ? ` ${customerName}` : ''},</p>
      <p>Great news — your order of <strong>${artworkTitle}</strong> has shipped!</p>
      <p><strong>Tracking number:</strong> ${trackingNumber}</p>
      <p>Please allow 1–2 business days for tracking to update. If you have any questions, reply to this email and we'll be happy to help.</p>
      <p>Thank you for supporting Wolfgang's work.</p>
      <hr />
      <p style="color:#888;font-size:12px;">Wolfgang Finger — wolfgangsart.com</p>
    `,
  })
}
