import type { EmailConfig, FormEmailSettings } from '../types'

export type EmailTemplateParams = Record<string, string>

export type EmailSendResult = {
  ok: boolean
  skipped?: boolean
  error?: string
}

function looksLikeTemplateId(value: string) {
  return /^template_[a-zA-Z0-9]+$/.test(value.trim())
}

function validateSettings(
  config: EmailConfig | null | undefined,
  settings: FormEmailSettings | undefined,
): string | null {
  if (!config?.publicKey?.trim()) return 'EmailJS Public Key is missing.'
  if (!config?.serviceId?.trim()) return 'EmailJS Service ID is missing.'
  if (!settings?.enabled) return 'Email alerts are disabled for this form.'
  if (!settings.toEmail?.trim()) return 'To email is missing.'
  if (!settings.templateId?.trim()) return 'EmailJS Template ID is missing.'
  if (!looksLikeTemplateId(settings.templateId)) {
    return 'Template ID must look like template_xxxxxxx (not an email address). Copy it from EmailJS → Email Templates.'
  }
  if (!/^service_[a-zA-Z0-9]+$/.test(config.serviceId.trim())) {
    return 'Service ID must look like service_xxxxxxx.'
  }
  return null
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildContentBlocks(kind: 'siteVisit' | 'career', params: EmailTemplateParams) {
  const rows =
    kind === 'siteVisit'
      ? [
          ['Form', 'Book Site Visit'],
          ['Name', params.name],
          ['Phone', params.phone],
          ['Requirement', params.requirement],
          ['Preferred date', params.date],
        ]
      : [
          ['Form', 'Career Application'],
          ['Job title', params.job_title],
          ['Name', params.name],
          ['Phone', params.phone],
          ['Email', params.email],
          ['Message', params.message],
          ['CV file', params.cv_file_name],
          ['Note', params.note],
        ]

  const filled = rows.filter(([, value]) => Boolean(value?.trim()))
  const content = filled.map(([label, value]) => `${label}: ${value}`).join('\n')
  // Many EmailJS starter templates only print {{message}} — put ALL fields there.
  const message = content
  const message_html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#222">
      <h2 style="margin:0 0 12px">${kind === 'siteVisit' ? 'New Site Visit Booking' : 'New Career Application'}</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:560px">
        ${filled
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;width:140px;vertical-align:top">${escapeHtml(label)}</td>
            <td style="padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;white-space:pre-wrap">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join('')}
      </table>
    </div>
  `.trim()

  return { content, message, message_html }
}

export async function sendConfiguredEmail(
  config: EmailConfig | null | undefined,
  kind: 'siteVisit' | 'career',
  params: EmailTemplateParams,
): Promise<EmailSendResult> {
  const settings = config?.[kind]
  const validationError = validateSettings(config, settings)
  if (validationError) {
    return { ok: false, skipped: true, error: validationError }
  }

  const { content, message, message_html } = buildContentBlocks(kind, params)
  const subject =
    settings!.subject.trim() ||
    params.subject ||
    (kind === 'siteVisit' ? 'New Site Visit Booking' : 'New Career Application')

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: config!.serviceId.trim(),
        template_id: settings!.templateId.trim(),
        user_id: config!.publicKey.trim(),
        template_params: {
          to_email: settings!.toEmail.trim(),
          cc_email: settings!.ccEmail.trim(),
          subject,
          form_type: kind === 'siteVisit' ? 'Book Site Visit' : 'Career Application',
          name: params.name ?? '',
          phone: params.phone ?? '',
          email: params.email ?? '',
          job_title: params.job_title ?? '',
          requirement: params.requirement ?? '',
          date: params.date ?? '',
          cv_file_name: params.cv_file_name ?? '',
          note: params.note ?? '',
          message,
          content,
          message_html,
          from_name: params.name ?? '',
          user_name: params.name ?? '',
          user_email: params.email ?? '',
          user_phone: params.phone ?? '',
          reply_to: params.email || settings!.toEmail.trim(),
        },
      }),
    })

    if (response.ok) return { ok: true }

    const body = (await response.text()).trim()
    return {
      ok: false,
      error: body || `EmailJS error (${response.status}). Check Public Key, Service ID, and Template ID.`,
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error while sending email.',
    }
  }
}
