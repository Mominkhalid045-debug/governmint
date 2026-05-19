import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY || ''
export const resend = resendApiKey ? new Resend(resendApiKey) : null

export interface EmailPayload {
  to: string[]
  subject: string
  html: string
  attachments?: { filename: string; content: string | Buffer }[]
}

export async function sendEmail({ to, subject, html, attachments }: EmailPayload) {
  if (!resend) {
    console.warn("Mailing unavailable. RESEND_API_KEY environment variable is not set. Sending logged to console.")
    console.log(`[EMAIL SEND SIMULATION] To: ${to.join(', ')} | Subject: ${subject}`)
    return null
  }

  try {
    const data = await resend.emails.send({
      from: 'GovernMINT Notifications <notifications@governmint.xyz>',
      to,
      subject,
      html,
      attachments
    })
    return data
  } catch (error) {
    console.error("Failed to send email through Resend:", error)
    return null
  }
}
