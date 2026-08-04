import { useEffect, useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { TextInput } from '../components/FormFields'
import { emptyEmailConfig } from '../data/empty'
import { saveEmailConfig, useSiteData } from '../data/store'
import { sendConfiguredEmail } from '../utils/email'
import type { EmailConfig, FormEmailSettings } from '../types'

function FormEmailFields({
  title,
  value,
  onChange,
  onTest,
  testing,
}: {
  title: string
  value: FormEmailSettings
  onChange: (next: FormEmailSettings) => void
  onTest: () => void
  testing: boolean
}) {
  const templateLooksWrong =
    Boolean(value.templateId.trim()) && !/^template_[a-zA-Z0-9]+$/.test(value.templateId.trim())

  return (
    <div className="panel email-block">
      <div className="email-block-head">
        <h3>{title}</h3>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
          />
          <span>Enable email alerts</span>
        </label>
      </div>

      <div className="form-grid-2">
        <TextInput
          label="To email"
          type="email"
          value={value.toEmail}
          onChange={(e) => onChange({ ...value, toEmail: e.target.value })}
          placeholder="team@example.com"
          required={value.enabled}
        />
        <TextInput
          label="CC email (optional)"
          type="email"
          value={value.ccEmail}
          onChange={(e) => onChange({ ...value, ccEmail: e.target.value })}
          placeholder="manager@example.com"
        />
        <TextInput
          label="Email subject"
          value={value.subject}
          onChange={(e) => onChange({ ...value, subject: e.target.value })}
          placeholder="New submission"
          required={value.enabled}
        />
        <TextInput
          label="EmailJS template ID"
          value={value.templateId}
          onChange={(e) => onChange({ ...value, templateId: e.target.value })}
          placeholder="template_xxxxxxx"
          required={value.enabled}
        />
      </div>

      {templateLooksWrong ? (
        <p className="email-warning">
          This looks like an email address, not a Template ID. Open EmailJS → Email Templates and copy
          the ID that starts with <code>template_</code>.
        </p>
      ) : null}

      <div className="form-actions">
        <button type="button" className="btn btn-sm" disabled={testing || !value.enabled} onClick={onTest}>
          {testing ? 'Sending test…' : 'Send test email'}
        </button>
      </div>
    </div>
  )
}

export function EmailSettingsPage() {
  const data = useSiteData()
  const [form, setForm] = useState<EmailConfig>(data.emailConfig ?? emptyEmailConfig)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState<'siteVisit' | 'career' | null>(null)
  const [testMessage, setTestMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setForm(data.emailConfig ?? emptyEmailConfig)
  }, [data.emailConfig])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTestMessage(null)
    try {
      await saveEmailConfig(form)
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  const runTest = async (kind: 'siteVisit' | 'career') => {
    setTesting(kind)
    setTestMessage(null)
    setSaved(false)

    const result = await sendConfiguredEmail(form, kind, {
      name: 'Test User',
      phone: '9999999999',
      email: 'test@example.com',
      message: 'This is a test email from NM Admin Email Settings.',
      job_title: kind === 'career' ? 'Sales Executive' : '',
      requirement: kind === 'siteVisit' ? 'Flats' : '',
      date: kind === 'siteVisit' ? new Date().toISOString().slice(0, 10) : '',
      cv_file_name: kind === 'career' ? 'sample-cv.pdf' : '',
      note:
        kind === 'career'
          ? 'Download the full CV PDF from Admin → Careers → Applications.'
          : '',
    })

    setTesting(null)
    if (result.ok) {
      setTestMessage({ tone: 'ok', text: 'Test email sent. Check inbox and spam folder.' })
      return
    }
    setTestMessage({
      tone: 'error',
      text: result.error || 'Test email failed.',
    })
  }

  return (
    <div>
      <PageHeader
        title="Email Settings"
        subtitle="Dynamic notification emails for Book Site Visit and Career applications (EmailJS)."
      />

      <form className="form-stack email-settings-form" onSubmit={onSubmit}>
        <div className="panel email-block">
          <div className="email-block-head">
            <h3>
              <Mail size={18} /> EmailJS connection
            </h3>
          </div>
          <p className="email-help">
            Your EmailJS template must include <code>{'{{message}}'}</code> in the body (we put all
            fields there automatically: name, phone, email, requirement/date or job + CV file name).
            <br />
            Set <strong>To Email</strong> to <code>{'{{to_email}}'}</code> and Subject to{' '}
            <code>{'{{subject}}'}</code>.
            <br />
            Optional nicer layout: replace body with <code>{'{{{message_html}}}'}</code>.
            Career PDF is not attached — download it from Admin → Careers → Applications.
          </p>
          <div className="form-grid-2">
            <TextInput
              label="Public Key"
              value={form.publicKey}
              onChange={(e) => {
                setForm((f) => ({ ...f, publicKey: e.target.value }))
                setSaved(false)
              }}
              placeholder="Your EmailJS public key"
            />
            <TextInput
              label="Service ID"
              value={form.serviceId}
              onChange={(e) => {
                setForm((f) => ({ ...f, serviceId: e.target.value }))
                setSaved(false)
              }}
              placeholder="service_xxxxxxx"
            />
          </div>
        </div>

        <FormEmailFields
          title="Book Site Visit"
          value={form.siteVisit}
          testing={testing === 'siteVisit'}
          onChange={(siteVisit) => {
            setForm((f) => ({ ...f, siteVisit }))
            setSaved(false)
          }}
          onTest={() => void runTest('siteVisit')}
        />

        <FormEmailFields
          title="Career applications"
          value={form.career}
          testing={testing === 'career'}
          onChange={(career) => {
            setForm((f) => ({ ...f, career }))
            setSaved(false)
          }}
          onTest={() => void runTest('career')}
        />

        {testMessage ? (
          <p className={testMessage.tone === 'ok' ? 'email-test-ok' : 'email-warning'}>
            {testMessage.text}
          </p>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Save email settings
          </button>
          {saved ? <span className="save-hint">Saved</span> : null}
        </div>
      </form>
    </div>
  )
}
