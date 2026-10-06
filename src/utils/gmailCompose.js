/**
 * Gmail Compose URL Builder
 * Opens Gmail's compose window with pre-filled To, Subject, and Body.
 * The user just has to click "Send" — zero typing needed.
 */

/**
 * Build a Gmail compose URL and open it in a new tab.
 * @param {{ to: string|string[], subject: string, body: string }} params
 */
export function openGmailCompose({ to, subject, body }) {
  const toStr = Array.isArray(to) ? to.join(',') : to
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',       // fullscreen compose
    to: toStr,
    su: subject,
    body: body,
  })
  const url = `https://mail.google.com/mail/?${params.toString()}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Build a pre-filled Gmail email to contact a donor about their donation.
 * Used on the Donations Board cards.
 */
export function composeContactDonorEmail({ donorName, donorEmail, foodName, quantity, city, expiryTime, senderName }) {
  const expiry = expiryTime ? new Date(expiryTime).toLocaleString() : 'N/A'
  const subject = `SharePlate — Interested in your donation: ${foodName}`
  const body = `Hi ${donorName},

I'm writing from SharePlate regarding your food donation:

🍽️ Food Item: ${foodName}
📦 Quantity: ${quantity} servings
📍 Location: ${city}
⏰ Expires: ${expiry}

We are interested in claiming and rescuing this food. Could you please confirm availability and pickup details?

${senderName ? `Best regards,\n${senderName}` : 'Thank you!'}

---
Sent via SharePlate — Food Rescue OS
https://shareplate.vercel.app`

  openGmailCompose({ to: donorEmail, subject, body })
}

/**
 * Build a pre-filled Gmail email to alert NGOs after a donor submits a donation.
 * Called automatically after successful donation creation.
 */
export function composeAlertNGOsEmail({ ngoEmails, donorName, foodName, quantity, foodType, city, address, phone, expiryTime, notes }) {
  const expiry = expiryTime ? new Date(expiryTime).toLocaleString() : 'N/A'
  const subject = `🚨 SharePlate Alert — New Surplus Food Available: ${foodName} (${city})`
  const body = `Dear NGO Partner,

A new food donation has just been posted on SharePlate and needs rescue!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DONATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽️ Food: ${foodName}
📦 Quantity: ${quantity} servings
🥗 Type: ${foodType}
📍 Pickup: ${address}, ${city}
📞 Contact: ${phone}
⏰ Expires: ${expiry}
${notes ? `📝 Notes: ${notes}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏪 Donated by: ${donorName}

⚡ Please claim this donation on SharePlate as soon as possible to prevent food waste.
👉 Visit: https://shareplate.vercel.app/donations

Thank you for making a difference!

---
SharePlate — Food Rescue OS
Every meal matters. 🌱`

  openGmailCompose({ to: ngoEmails, subject, body })
}
