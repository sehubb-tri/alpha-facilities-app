// Supabase Edge Function: on-audit-complete
// Triggers when a new audit is saved, creates a Wrike task and optionally sends email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuditData {
  id: string
  date: string
  time: string
  campus: string
  auditor: string
  auditor_email: string
  status: 'GREEN' | 'AMBER' | 'RED'
  defects: number
  zones: number
  duration: number
  tour_ready: boolean
  condition_alerts_count: number
  zone_results: Record<string, Record<string, string>>
  condition_alert_details: Array<{
    zoneId: string
    hasIssue: boolean
    note: string
    photo: string
  }>
}

// Create Wrike task
async function createWrikeTask(audit: AuditData, photoUrls: string[]) {
  const WRIKE_TOKEN = Deno.env.get('WRIKE_API_TOKEN')
  const WRIKE_FOLDER_ID = Deno.env.get('WRIKE_FOLDER_ID')

  if (!WRIKE_TOKEN || !WRIKE_FOLDER_ID) {
    console.log('Wrike credentials not configured, skipping task creation')
    return null
  }

  const statusEmoji = audit.status === 'GREEN' ? '🟢' : audit.status === 'AMBER' ? '🟡' : '🔴'

  // Build task title
  const title = `[${audit.status}] ${audit.campus} - Daily QC Audit - ${audit.date}`

  // Build task description
  let description = `
<b>Daily QC Audit Report</b>

<b>Status:</b> ${statusEmoji} ${audit.status}
<b>Campus:</b> ${audit.campus}
<b>Auditor:</b> ${audit.auditor}
<b>Email:</b> ${audit.auditor_email || 'N/A'}
<b>Date:</b> ${audit.date} at ${audit.time}
<b>Duration:</b> ${audit.duration} minutes
<b>Zones Checked:</b> ${audit.zones}
<b>Total Defects:</b> ${audit.defects}
<b>Tour Ready:</b> ${audit.tour_ready ? 'Yes' : 'No'}
<b>Condition Alerts:</b> ${audit.condition_alerts_count}
`

  // Add defect details if any
  if (audit.defects > 0 && audit.zone_results) {
    description += '\n<b>Defect Details:</b>\n'
    for (const [zoneId, results] of Object.entries(audit.zone_results)) {
      const defects = Object.entries(results).filter(([_, v]) => v === 'no')
      if (defects.length > 0) {
        description += `\n• ${zoneId}: ${defects.length} defect(s)`
      }
    }
  }

  // Add condition alert details if any
  if (audit.condition_alert_details && audit.condition_alert_details.length > 0) {
    description += '\n\n<b>Condition Alert Details:</b>\n'
    for (const alert of audit.condition_alert_details) {
      if (alert.hasIssue) {
        description += `\n• ${alert.zoneId}: ${alert.note || 'No note'}`
        if (alert.photo) {
          description += ` [Photo attached]`
        }
      }
    }
  }

  // Add photo URLs if any
  if (photoUrls.length > 0) {
    description += '\n\n<b>Zone Photos:</b>\n'
    photoUrls.forEach((url, i) => {
      description += `\n• Photo ${i + 1}: ${url}`
    })
  }

  // Determine priority based on status
  const importance = audit.status === 'RED' ? 'High' : audit.status === 'AMBER' ? 'Normal' : 'Low'

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
        customStatus: audit.status === 'RED' ? 'Urgent' : undefined,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Wrike API error:', error)
      return null
    }

    const result = await response.json()
    console.log('Wrike task created:', result.data?.[0]?.id)
    return result.data?.[0]
  } catch (error) {
    console.error('Error creating Wrike task:', error)
    return null
  }
}

// Send email notification (using Resend)
async function sendEmailReport(audit: AuditData, photoUrls: string[]) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@alpha-facilities.com'

  if (!RESEND_API_KEY || !audit.auditor_email) {
    console.log('Email not configured or no auditor email, skipping')
    return null
  }

  const statusEmoji = audit.status === 'GREEN' ? '🟢' : audit.status === 'AMBER' ? '🟡' : '🔴'

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${audit.status === 'GREEN' ? '#dcfce7' : audit.status === 'AMBER' ? '#fef3c7' : '#fee2e2'}; padding: 20px; text-align: center; border-radius: 8px;">
        <h1 style="margin: 0; color: ${audit.status === 'GREEN' ? '#166534' : audit.status === 'AMBER' ? '#92400e' : '#b91c1c'};">
          ${statusEmoji} ${audit.status}
        </h1>
        <p style="margin: 10px 0 0; color: #666;">${audit.campus}</p>
      </div>

      <div style="padding: 20px;">
        <h2>Audit Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Auditor</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${audit.auditor}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Date</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${audit.date} at ${audit.time}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Duration</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${audit.duration} minutes</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Zones Checked</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${audit.zones}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Defects Found</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${audit.defects}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tour Ready</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${audit.tour_ready ? 'Yes' : 'No'}</td></tr>
        </table>

        ${audit.defects > 0 ? `
        <h3 style="margin-top: 20px;">Defects</h3>
        <p>${audit.defects} defect(s) were found during this audit.</p>
        ` : ''}

        ${audit.condition_alerts_count > 0 ? `
        <h3 style="margin-top: 20px;">Condition Alerts</h3>
        <p>${audit.condition_alerts_count} condition alert(s) were reported.</p>
        ` : ''}

        ${photoUrls.length > 0 ? `
        <h3 style="margin-top: 20px;">Photos</h3>
        <p>${photoUrls.length} photo(s) were captured during this audit.</p>
        ` : ''}
      </div>

      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 8px;">
        Alpha Facilities App - Daily QC Checklist
      </div>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: audit.auditor_email,
        subject: `${statusEmoji} QC Audit Report - ${audit.campus} - ${audit.date}`,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return null
    }

    const result = await response.json()
    console.log('Email sent:', result.id)
    return result
  } catch (error) {
    console.error('Error sending email:', error)
    return null
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()

    if (!record) {
      return new Response(
        JSON.stringify({ error: 'No audit record provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const audit = record as AuditData

    // Get zone photos for this audit
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: photos } = await supabase
      .from('zone_photos')
      .select('photo_url')
      .eq('audit_id', audit.id)

    const photoUrls = (photos || []).map(p => p.photo_url)

    // Create Wrike task and send email in parallel
    const [wrikeResult, emailResult] = await Promise.all([
      createWrikeTask(audit, photoUrls),
      sendEmailReport(audit, photoUrls),
    ])

    return new Response(
      JSON.stringify({
        success: true,
        wrike: wrikeResult ? 'created' : 'skipped',
        email: emailResult ? 'sent' : 'skipped',
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
