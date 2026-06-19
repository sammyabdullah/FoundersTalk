import { Resend } from 'resend'
import { Founder, Topic, ARR_BUCKET_LABELS, BUSINESS_MODEL_LABELS, CUSTOMER_TYPE_LABELS } from './types'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }
function FROM() { return process.env.FROM_EMAIL || 'hello@founderstalk.com' }
function BASE_URL() { return process.env.NEXT_PUBLIC_BASE_URL || 'https://founderstalk.com' }

export async function sendApplicationConfirmation(founder: Founder) {
  await getResend().emails.send({
    from: `TwoFoundersTalk <${FROM()}>`,
    to: founder.email,
    subject: "Welcome to TwoFoundersTalk",
    html: `
      <p>Hi${founder.first_name ? ` ${founder.first_name}` : ''},</p>
      <p>Welcome to TwoFoundersTalk and thank you for creating a profile. When we find a founder who matches your topics, we'll send you an email with their profile and ask if you'd like an intro; we'll always get your opt-in and the other founder's opt-in before making any introduction.</p>
      <p>You can log in any time to update your profile, change your topics, pause matching, or delete your account. If you have questions, reach out to Blossom Street Ventures, who created and sponsor TwoFoundersTalk: <a href="mailto:sammy@blossomstreetventures.com">sammy@blossomstreetventures.com</a>.</p>
      <p>We hope you enjoy the service. <a href="${BASE_URL()}/login">Log in to your profile →</a></p>
      <p><em>Courtesy of Blossom Street Ventures</em></p>
    `,
  })
}

export async function sendAdminNotification(founder: Founder, topics: Array<{ name: string; direction: string }>) {
  const topicLines = topics.map(t => `• ${t.name} — ${t.direction === 'been_through_this' ? "I've been through this" : "I'm figuring this out"}`).join('\n')

  await getResend().emails.send({
    from: `TwoFoundersTalk <${FROM()}>`,
    to: 'sammy@blossomstreetventures.com',
    subject: `New TwoFoundersTalk profile — ${ARR_BUCKET_LABELS[founder.arr_bucket] || founder.arr_bucket}`,
    html: `
      <h2>New Profile</h2>
      <p><strong>Email:</strong> ${founder.email}</p>
      <p><strong>First name:</strong> ${founder.first_name || '—'}</p>
      <p><strong>ARR:</strong> ${ARR_BUCKET_LABELS[founder.arr_bucket]}</p>
      <p><strong>Business model:</strong> ${BUSINESS_MODEL_LABELS[founder.business_model]}</p>
      <p><strong>Customer type:</strong> ${CUSTOMER_TYPE_LABELS[founder.customer_type]}</p>
      <p><strong>Vertical:</strong> ${founder.vertical || '—'}</p>
      <p><strong>Geography:</strong> ${founder.geography}</p>
      <p><strong>Company description:</strong><br>${founder.company_description}</p>
      <p><strong>Open to share:</strong><br>${founder.open_to_share || '—'}</p>
      <p><strong>Additional notes:</strong><br>${founder.additional_notes || '—'}</p>
      <h3>Topics</h3>
      <pre>${topicLines}</pre>
      <p><a href="${BASE_URL()}/admin?tab=signups">Review in admin →</a></p>
    `,
  })
}

export async function sendWelcomeEmail(founder: Founder) {
  await getResend().emails.send({
    from: `TwoFoundersTalk <${FROM()}>`,
    to: founder.email,
    subject: "You're in — TwoFoundersTalk",
    html: `
      <p>Hi${founder.first_name ? ` ${founder.first_name}` : ''},</p>
      <p>Welcome to TwoFoundersTalk. Your profile is live and we'll reach out when we find a good match.</p>
      <p>In the meantime, if you have any feedback on the signup experience or anything we should know, just reply to this email.</p>
      <p><em>Courtesy of Blossom Street Ventures</em></p>
    `,
  })
}

export async function sendMatchEmail(
  recipient: Founder,
  otherFounder: Founder,
  topics: Topic[],
  token: string
) {
  const topicList = topics.map(t => t.name).join(', ')
  const responseUrl = `${BASE_URL()}/match/${token}`

  await getResend().emails.send({
    from: `TwoFoundersTalk <${FROM()}>`,
    to: recipient.email,
    subject: 'A founder wants to talk to you',
    html: `
      <p>Hi${recipient.first_name ? ` ${recipient.first_name}` : ''},</p>
      <p>We think you two might have a useful conversation. Here's who we matched you with — take a look and let us know if you'd like an intro.</p>
      <hr>
      <h3>${otherFounder.first_name || 'Your match'}</h3>
      <p><strong>Company:</strong> ${otherFounder.company_description}</p>
      <p><strong>ARR:</strong> ${ARR_BUCKET_LABELS[otherFounder.arr_bucket]}</p>
      <p><strong>Business model:</strong> ${BUSINESS_MODEL_LABELS[otherFounder.business_model]}</p>
      <p><strong>Customer type:</strong> ${CUSTOMER_TYPE_LABELS[otherFounder.customer_type]}</p>
      ${otherFounder.vertical ? `<p><strong>Vertical:</strong> ${otherFounder.vertical}</p>` : ''}
      <p><strong>Geography:</strong> ${otherFounder.geography}</p>
      <p><strong>Matched on:</strong> ${topicList}</p>
      ${otherFounder.open_to_share ? `<p><strong>From them:</strong> ${otherFounder.open_to_share}</p>` : ''}
      ${otherFounder.additional_notes ? `<p><strong>Additional notes:</strong> ${otherFounder.additional_notes}</p>` : ''}
      <hr>
      <p><a href="${responseUrl}" style="background:#1e3a5f;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:8px 0;">Yes, I'd like to connect</a></p>
      <p><a href="${responseUrl}" style="color:#666;">No thanks — see the full response page</a></p>
      <p style="font-size:12px;color:#999;">This link is unique to you. It expires in 5 days.</p>
    `,
  })
}

export async function sendIntroEmail(founderA: Founder, founderB: Founder, topic: Topic) {
  const nameA = founderA.first_name || 'there'
  const nameB = founderB.first_name || 'there'

  const emailTo = (recipientName: string, otherName: string, otherEmail: string) => `
    <p>Hi ${recipientName},</p>
    <p>You both opted in to connect on TwoFoundersTalk. Their email is below; take it from here and good luck.</p>
    <p><strong>${otherName}:</strong> ${otherEmail}</p>
    <p><em>Courtesy of Blossom Street Ventures</em></p>
  `

  await Promise.all([
    getResend().emails.send({
      from: `TwoFoundersTalk <${FROM()}>`,
      to: founderA.email,
      subject: `Your intro — ${nameB}`,
      html: emailTo(nameA, nameB, founderB.email),
    }),
    getResend().emails.send({
      from: `TwoFoundersTalk <${FROM()}>`,
      to: founderB.email,
      subject: `Your intro — ${nameA}`,
      html: emailTo(nameB, nameA, founderA.email),
    }),
  ])
}

export async function sendPasswordResetEmail(founder: { email: string; first_name?: string | null }, token: string) {
  const resetUrl = `${BASE_URL()}/reset-password/${token}`
  await getResend().emails.send({
    from: `TwoFoundersTalk <${FROM()}>`,
    to: founder.email,
    subject: 'Reset your TwoFoundersTalk password',
    html: `
      <p>Hi${founder.first_name ? ` ${founder.first_name}` : ''},</p>
      <p>We received a request to reset your password. Click the link below — it expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="background:#1e3a5f;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:8px 0;">Reset my password</a></p>
      <p style="font-size:12px;color:#999;">If you didn't request this, you can ignore this email.</p>
    `,
  })
}
