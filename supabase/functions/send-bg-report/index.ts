// Supabase Edge Function: send-bg-report
// Sends email report when a B&G walkthrough is completed
// Supports both Gmail API (Google Workspace) and Resend

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BGWalkthroughData {
  id?: string
  date: string
  time: string
  campus: string
  auditor: string
  auditorEmail: string
  duration: number
  campusRating: 'PASS' | 'FAIL'
  zoneRatings: Record<string, 'GREEN' | 'AMBER' | 'RED'>
  issues: Array<{
    zoneId: string
    zoneName: string
    checkId: string
    checkText: string
    tier: number
    notes?: string
    photos?: string[]
  }>
  observations: Array<{
    categoryId: string
    categoryName: string
    pillar: string
    description: string
    photos?: string[]
  }>
  totalIssues: number
  totalObservations: number
  greenZones: number
  amberZones: number
  redZones: number
}

// SLA tier descriptions
const SLA_TIERS: Record<number, { name: string; resolution: string }> = {
  1: { name: 'CRITICAL', resolution: 'Same day' },
  2: { name: 'HIGH-VISIBILITY', resolution: '24 hours' },
  3: { name: 'ROUTINE', resolution: '48 hours' },
  4: { name: 'SCHEDULED', resolution: '1 week' },
}

function generateEmailHtml(data: BGWalkthroughData): string {
  const isPassing = data.campusRating === 'PASS'
  const headerBg = isPassing ? '#059669' : '#dc2626'
  const statusIcon = isPassing ? 'PASS' : 'FAIL'

  // Group issues by tier
  const tier1Issues = data.issues.filter(i => i.tier === 1)
  const tier2Issues = data.issues.filter(i => i.tier === 2)
  const tier3PlusIssues = data.issues.filter(i => i.tier >= 3)

  let issuesHtml = ''

  if (tier1Issues.length > 0) {
    issuesHtml += `
      <div style="margin-bottom: 16px;">
        <div style="background: #fee2e2; color: #b91c1c; padding: 8px 12px; border-radius: 6px; font-weight: bold; margin-bottom: 8px;">
          TIER 1 - CRITICAL (${SLA_TIERS[1].resolution})
        </div>
        ${tier1Issues.map(issue => `
          <div style="padding: 10px; background: #fef2f2; border-radius: 6px; margin-bottom: 6px;">
            <div style="font-weight: 500;">${issue.zoneName}</div>
            <div style="color: #666; font-size: 14px;">${issue.checkText}</div>
            ${issue.notes ? `<div style="color: #888; font-size: 13px; margin-top: 4px;">Notes: ${issue.notes}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }

  if (tier2Issues.length > 0) {
    issuesHtml += `
      <div style="margin-bottom: 16px;">
        <div style="background: #fef3c7; color: #92400e; padding: 8px 12px; border-radius: 6px; font-weight: bold; margin-bottom: 8px;">
          TIER 2 - HIGH-VISIBILITY (${SLA_TIERS[2].resolution})
        </div>
        ${tier2Issues.map(issue => `
          <div style="padding: 10px; background: #fffbeb; border-radius: 6px; margin-bottom: 6px;">
            <div style="font-weight: 500;">${issue.zoneName}</div>
            <div style="color: #666; font-size: 14px;">${issue.checkText}</div>
            ${issue.notes ? `<div style="color: #888; font-size: 13px; margin-top: 4px;">Notes: ${issue.notes}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }

  if (tier3PlusIssues.length > 0) {
    issuesHtml += `
      <div style="margin-bottom: 16px;">
        <div style="background: #e5e7eb; color: #374151; padding: 8px 12px; border-radius: 6px; font-weight: bold; margin-bottom: 8px;">
          TIER 3/4 - ROUTINE (${SLA_TIERS[3].resolution})
        </div>
        ${tier3PlusIssues.map(issue => `
          <div style="padding: 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 6px;">
            <div style="font-weight: 500;">${issue.zoneName}</div>
            <div style="color: #666; font-size: 14px;">${issue.checkText}</div>
            ${issue.notes ? `<div style="color: #888; font-size: 13px; margin-top: 4px;">Notes: ${issue.notes}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }

  let observationsHtml = ''
  if (data.observations.length > 0) {
    observationsHtml = `
      <h3 style="margin: 24px 0 12px 0; color: #092849;">Observations Routed to Other Pillars (${data.observations.length})</h3>
      ${data.observations.map(obs => `
        <div style="padding: 12px; background: #f0f9ff; border-radius: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #0369a1;">${obs.categoryName}</span>
            <span style="font-size: 12px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px;">
              to ${obs.pillar}
            </span>
          </div>
          <div style="font-size: 14px; color: #333; margin-top: 4px;">${obs.description}</div>
        </div>
      `).join('')}
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff;">
        <!-- Header -->
        <div style="background: ${headerBg}; color: #fff; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Campus ${statusIcon}</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.campus} - Weekly B&G Walkthrough</p>
        </div>

        <!-- Summary -->
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Auditor</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.auditor}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Date & Time</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.date} at ${data.time}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Duration</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.duration || 'N/A'} minutes</td>
            </tr>
          </table>

          <!-- Zone Summary -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="width: 33%; background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #059669;">${data.greenZones || 0}</div>
                <div style="font-size: 13px; color: #065f46; font-weight: 600;">GREEN</div>
              </td>
              <td style="width: 8px;"></td>
              <td style="width: 33%; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #d97706;">${data.amberZones || 0}</div>
                <div style="font-size: 13px; color: #92400e; font-weight: 600;">AMBER</div>
              </td>
              <td style="width: 8px;"></td>
              <td style="width: 33%; background: #fee2e2; border: 2px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${data.redZones || 0}</div>
                <div style="font-size: 13px; color: #991b1b; font-weight: 600;">RED</div>
              </td>
            </tr>
          </table>

          <!-- Issues Section -->
          ${data.issues.length > 0 ? `
            <h3 style="margin: 0 0 16px 0; color: #092849;">Issues Found (${data.issues.length})</h3>
            ${issuesHtml}
          ` : `
            <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 16px;">
              <span style="color: #059669; font-weight: 600;">No Issues Found</span>
            </div>
          `}

          <!-- Observations Section -->
          ${observationsHtml}
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">Alpha Facilities App - Weekly B&G Walkthrough Report</p>
          <p style="margin: 4px 0 0 0;">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generatePlainText(data: BGWalkthroughData): string {
  let text = `
WEEKLY B&G WALKTHROUGH REPORT
=============================
Campus: ${data.campus}
Date: ${data.date}
Time: ${data.time}
Auditor: ${data.auditor}
Duration: ${data.duration || 'N/A'} minutes

CAMPUS RATING: ${data.campusRating}
=============================

ZONE SUMMARY:
- GREEN: ${data.greenZones || 0}
- AMBER: ${data.amberZones || 0}
- RED: ${data.redZones || 0}
`

  if (data.issues.length > 0) {
    text += `\nISSUES FOUND (${data.issues.length}):\n`
    text += '-----------------------------\n'

    const tier1 = data.issues.filter(i => i.tier === 1)
    const tier2 = data.issues.filter(i => i.tier === 2)
    const otherTiers = data.issues.filter(i => i.tier > 2)

    if (tier1.length > 0) {
      text += `\nTIER 1 - CRITICAL (${SLA_TIERS[1].resolution}):\n`
      tier1.forEach(issue => {
        text += `  - ${issue.zoneName}: ${issue.checkText}\n`
        if (issue.notes) text += `    Notes: ${issue.notes}\n`
      })
    }

    if (tier2.length > 0) {
      text += `\nTIER 2 - HIGH-VISIBILITY (${SLA_TIERS[2].resolution}):\n`
      tier2.forEach(issue => {
        text += `  - ${issue.zoneName}: ${issue.checkText}\n`
        if (issue.notes) text += `    Notes: ${issue.notes}\n`
      })
    }

    if (otherTiers.length > 0) {
      text += `\nTIER 3/4 - ROUTINE:\n`
      otherTiers.forEach(issue => {
        text += `  - ${issue.zoneName}: ${issue.checkText}\n`
        if (issue.notes) text += `    Notes: ${issue.notes}\n`
      })
    }
  }

  if (data.observations.length > 0) {
    text += `\nOBSERVATIONS ROUTED TO OTHER PILLARS (${data.observations.length}):\n`
    text += '-----------------------------\n'
    data.observations.forEach(obs => {
      text += `  - ${obs.categoryName} -> ${obs.pillar}\n`
      text += `    ${obs.description}\n`
    })
  }

  text += `\n-----------------------------\n`
  text += `Report generated by Alpha Facilities App\n`

  return text
}

// ============================================
// GMAIL API (Google Workspace) EMAIL SENDING
// ============================================

interface GoogleServiceAccountCredentials {
  client_email: string
  private_key: string
}

async function createGoogleJWT(credentials: GoogleServiceAccountCredentials, userEmail: string): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: credentials.client_email,
    sub: userEmail, // The workspace user to impersonate
    scope: 'https://www.googleapis.com/auth/gmail.send',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  // Import the private key and sign
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(credentials.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signatureInput)
  )

  const encodedSignature = base64UrlEncode(new Uint8Array(signature))
  return `${signatureInput}.${encodedSignature}`
}

function base64UrlEncode(data: string | Uint8Array): string {
  let base64: string
  if (typeof data === 'string') {
    base64 = btoa(data)
  } else {
    base64 = btoa(String.fromCharCode(...data))
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

async function getGoogleAccessToken(credentials: GoogleServiceAccountCredentials, userEmail: string): Promise<string> {
  const jwt = await createGoogleJWT(credentials, userEmail)

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Google access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

async function sendViaGmail(
  credentials: GoogleServiceAccountCredentials,
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ success: boolean; messageId?: string }> {
  // Get access token
  const accessToken = await getGoogleAccessToken(credentials, fromEmail)

  // Build the email in RFC 2822 format
  const boundary = `boundary_${Date.now()}`
  const emailLines = [
    `From: ${fromEmail}`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    textContent,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    '',
    htmlContent,
    '',
    `--${boundary}--`
  ]

  const rawEmail = emailLines.join('\r\n')
  const encodedEmail = base64UrlEncode(new TextEncoder().encode(rawEmail))

  // Send via Gmail API
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodedEmail })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gmail API error: ${error}`)
  }

  const result = await response.json()
  return { success: true, messageId: result.id }
}

// ============================================
// RESEND EMAIL SENDING (Fallback)
// ============================================

async function sendViaResend(
  apiKey: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ success: boolean; emailId?: string }> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend API error: ${errorText}`)
  }

  const result = await response.json()
  return { success: true, emailId: result.id }
}

// ============================================
// WRIKE TASK CREATION
// ============================================

async function createWrikeTask(data: BGWalkthroughData): Promise<{ success: boolean; taskId?: string }> {
  const WRIKE_TOKEN = Deno.env.get('WRIKE_API_TOKEN')
  const WRIKE_FOLDER_ID = Deno.env.get('WRIKE_FOLDER_ID')

  if (!WRIKE_TOKEN || !WRIKE_FOLDER_ID) {
    console.log('Wrike credentials not configured, skipping task creation')
    return { success: false }
  }

  const statusEmoji = data.campusRating === 'PASS' ? '[PASS]' : '[FAIL]'

  // Build task title
  const title = `${statusEmoji} B&G Walkthrough - ${data.campus} - ${data.date}`

  // Group issues by tier for description
  const tier1Issues = data.issues.filter(i => i.tier === 1)
  const tier2Issues = data.issues.filter(i => i.tier === 2)
  const tier3PlusIssues = data.issues.filter(i => i.tier >= 3)

  // Build task description (Wrike uses HTML)
  let description = `
<b>Weekly B&G Walkthrough Report</b>

<b>Status:</b> ${data.campusRating}
<b>Campus:</b> ${data.campus}
<b>Auditor:</b> ${data.auditor}
<b>Email:</b> ${data.auditorEmail}
<b>Date:</b> ${data.date} at ${data.time}
<b>Duration:</b> ${data.duration || 'N/A'} minutes

<b>Zone Summary:</b>
• GREEN: ${data.greenZones || 0}
• AMBER: ${data.amberZones || 0}
• RED: ${data.redZones || 0}
`

  if (data.issues.length > 0) {
    description += `\n<b>Total Issues:</b> ${data.issues.length}\n`

    if (tier1Issues.length > 0) {
      description += `\n<b>TIER 1 - CRITICAL (Same day):</b>\n`
      tier1Issues.forEach(issue => {
        description += `• ${issue.zoneName}: ${issue.checkText}\n`
        if (issue.notes) description += `  Notes: ${issue.notes}\n`
      })
    }

    if (tier2Issues.length > 0) {
      description += `\n<b>TIER 2 - HIGH-VISIBILITY (24 hours):</b>\n`
      tier2Issues.forEach(issue => {
        description += `• ${issue.zoneName}: ${issue.checkText}\n`
        if (issue.notes) description += `  Notes: ${issue.notes}\n`
      })
    }

    if (tier3PlusIssues.length > 0) {
      description += `\n<b>TIER 3/4 - ROUTINE (48 hours - 1 week):</b>\n`
      tier3PlusIssues.forEach(issue => {
        description += `• ${issue.zoneName}: ${issue.checkText}\n`
        if (issue.notes) description += `  Notes: ${issue.notes}\n`
      })
    }
  }

  if (data.observations.length > 0) {
    description += `\n<b>Observations Routed to Other Pillars (${data.observations.length}):</b>\n`
    data.observations.forEach(obs => {
      description += `• ${obs.categoryName} → ${obs.pillar}: ${obs.description}\n`
    })
  }

  // Determine priority: FAIL or any Tier 1 issues = High
  const importance = (data.campusRating === 'FAIL' || tier1Issues.length > 0) ? 'High' :
                     (tier2Issues.length > 0) ? 'Normal' : 'Low'

  try {
    const response = await fetch(`https://www.wrike.com/api/v4/folders/${WRIKE_FOLDER_ID}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WRIKE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        importance,
        status: 'Active',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Wrike API error:', error)
      return { success: false }
    }

    const result = await response.json()
    const taskId = result.data?.[0]?.id
    console.log('Wrike task created:', taskId)
    return { success: true, taskId }
  } catch (error) {
    console.error('Error creating Wrike task:', error)
    return { success: false }
  }
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: BGWalkthroughData = await req.json()

    // Validate required fields
    if (!data.auditorEmail) {
      return new Response(
        JSON.stringify({ error: 'Auditor email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate email content
    const htmlContent = generateEmailHtml(data)
    const textContent = generatePlainText(data)

    // Determine subject line
    const statusEmoji = data.campusRating === 'PASS' ? '[PASS]' : '[FAIL]'
    const subject = `${statusEmoji} B&G Walkthrough Report - ${data.campus} - ${data.date}`

    // Check which email provider to use
    const GOOGLE_SERVICE_ACCOUNT = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    const GOOGLE_WORKSPACE_EMAIL = Deno.env.get('GOOGLE_WORKSPACE_EMAIL')
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@alpha-facilities.com'

    // Run Wrike task creation and email in parallel
    const wrikePromise = createWrikeTask(data)

    let emailResult: { success: boolean; emailId?: string; messageId?: string } | null = null

    // Try Gmail API first if configured
    if (GOOGLE_SERVICE_ACCOUNT && GOOGLE_WORKSPACE_EMAIL) {
      console.log('Using Gmail API for email delivery')
      try {
        const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT)
        emailResult = await sendViaGmail(
          credentials,
          GOOGLE_WORKSPACE_EMAIL,
          data.auditorEmail,
          subject,
          htmlContent,
          textContent
        )
        console.log('Email sent via Gmail:', emailResult.messageId)
      } catch (gmailError) {
        console.error('Gmail API failed, falling back to Resend:', gmailError)
        if (RESEND_API_KEY) {
          emailResult = await sendViaResend(RESEND_API_KEY, FROM_EMAIL, data.auditorEmail, subject, htmlContent, textContent)
        }
      }
    } else if (RESEND_API_KEY) {
      console.log('Using Resend for email delivery')
      emailResult = await sendViaResend(RESEND_API_KEY, FROM_EMAIL, data.auditorEmail, subject, htmlContent, textContent)
      console.log('Email sent via Resend:', emailResult?.emailId)
    }

    // Wait for Wrike task creation
    const wrikeResult = await wrikePromise

    return new Response(
      JSON.stringify({
        success: true,
        wrike: wrikeResult.success ? 'created' : 'skipped',
        wrikeTaskId: wrikeResult.taskId,
        email: emailResult ? 'sent' : 'skipped',
        emailId: emailResult?.emailId || emailResult?.messageId,
        recipient: data.auditorEmail
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
