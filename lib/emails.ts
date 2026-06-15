import { Resend } from 'resend'
import { Founder, Topic, ARR_BUCKET_LABELS, BUSINESS_MODEL_LABELS, CUSTOMER_TYPE_LABELS } from './types'

function getResend() { return new Resend(process.env.RESEND_API_KEY) }
function FROM() { return process.env.FROM_EMAIL || 'hello@founderstalk.com' }
function BASE_URL() { return process.env.NEXT_PUBLIC_BASE_URL || 'https://founderstalk.com' }

export async function sendApplicationConfirmation(founder: Founder) {
  await getResend().emails.send({
    from: `Sammy at FoundersTalk <${FROM()}>`,
    to: founder.email,
    subject: "You're on the list",
    html: `
      <p>Hi${founder.first_name ? ` ${founder.first_name}` : ''},</p>
      <p>Thanks for applying to FoundersTalk. We review every application personally — you'll hear from us shortly.</p>
      <p>Sammy</p>
    `,
  })
}

export async function sendAdminNotification(founder: Founder, topics: Array<{ name: string; direction: string }>) {
  const topicLines = topics.map(t => `• ${t.name} — ${t.direction === 'been_through_this' ? "I've been through this" : "I'm figuring this out"}`).join('\n')

  await getResend().emails.send({
    from: `FoundersTalk <${FROM()}>`,
    to: 'sammy@blossomstreetventures.com',
    subject: `New FoundersTalk application — ${ARR_BUCKET_LABELS[founder.arr_bucket]}`,
    html: `
      <h2>New Application</h2>
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
      <p><a href="${BASE_URL()}/admin">Review in admin →</a></p>
    `,
  })
}

export async function sendWelcomeEmail(founder: Founder) {
  await getResend().emails.send({
    from: `Sammy <${FROM()}>`,
    to: founder.email,
    subject: "You're in — FoundersTalk",
    html: `
      <p>Hi${founder.first_name ? ` ${founder.first_name}` : ''},</p>
      <p>Welcome to FoundersTalk. Your profile is live and we'll reach out when we find a good match.</p>
      <p>In the meantime, if you have any feedback on the signup experience or anything we should know, just reply to this email.</p>
      <p>Sammy</p>
    `,
  })
}

export async function sendMatchEmail(
  recipient: Founder,
  otherFounder: Founder,
  topic: Topic,
  otherDirection: string,
  token: string
) {
  const directionLabel = otherDirection === 'been_through_this' ? "has been through this" : "is figuring this out"
  const responseUrl = `${BASE_URL()}/match/${token}`

  await getResend().emails.send({
    from: `Sammy at FoundersTalk <${FROM()}>`,
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
      <p><strong>Matched on:</strong> ${topic.name} — ${directionLabel}</p>
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

  const body = `
    <p>Hi ${nameA}, meet ${nameB}. ${nameB.charAt(0).toUpperCase() + nameB.slice(1)}, meet ${nameA.charAt(0).toUpperCase() + nameA.slice(1)}.</p>
    <p>You both wanted to connect about <strong>${topic.name}</strong>. We'll leave it here — take it wherever is most useful.</p>
    <p>${nameA}: ${founderA.email}<br>${nameB}: ${founderB.email}</p>
    <p>Sammy</p>
  `

  await getResend().emails.send({
    from: `Sammy <${FROM()}>`,
    to: founderA.email,
    cc: founderB.email,
    subject: `Meet ${nameB}`,
    html: body,
  })
}
