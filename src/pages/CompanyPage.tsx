import { useEffect, useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { TextInput, TextTextarea } from '../components/FormFields'
import { saveCompany, useSiteData } from '../data/store'
import type { Company } from '../types'

export function CompanyPage() {
  const data = useSiteData()
  const [form, setForm] = useState<Company>(data.company)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(data.company)
  }, [data.company])

  const set =
    (key: keyof Company) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      setSaved(false)
    }

  const setSocial =
    (key: keyof Company['social']) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, social: { ...f.social, [key]: e.target.value } }))
      setSaved(false)
    }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await saveCompany(form)
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Company"
        subtitle="Contact details, about text, and social links shown on the public site."
      />
      <form className="panel form-grid" onSubmit={onSubmit}>
        <TextInput label="Company name" value={form.name} onChange={set('name')} required />
        <TextInput
          label="Short name"
          value={form.shortName}
          onChange={set('shortName')}
          required
        />
        <TextInput label="Email" type="email" value={form.email} onChange={set('email')} required />
        <TextInput label="Phone" value={form.phone} onChange={set('phone')} required />
        <TextInput
          label="WhatsApp number(s)"
          value={form.whatsapp}
          onChange={set('whatsapp')}
          placeholder="6294520056 / 6294205569"
          required
        />
        <TextInput label="Address" value={form.address} onChange={set('address')} required />
        <div className="span-2">
          <TextInput
            label="Hero tagline"
            value={form.tagline}
            onChange={set('tagline')}
            placeholder="Your Trusted Real Estate Partner in Kolkata"
            required
          />
        </div>
        <div className="span-2">
          <TextInput
            label="Footer tagline"
            value={form.footerTagline}
            onChange={set('footerTagline')}
            placeholder="#No.1 Realty Partner in Kolkata"
            required
          />
        </div>
        <div className="span-2">
          <TextTextarea label="About" value={form.about} onChange={set('about')} required />
          <p className="format-hint">
            Formatting: <code>**bold**</code>, <code>*italic*</code>, <code>__underline__</code>,{' '}
            <code>==highlight==</code>
          </p>
        </div>
        <div className="span-2">
          <TextTextarea
            label="Map embed URL"
            value={form.mapEmbed}
            onChange={set('mapEmbed')}
            required
          />
        </div>
        <TextInput
          label="WhatsApp link"
          value={form.social.whatsapp}
          onChange={setSocial('whatsapp')}
        />
        <TextInput
          label="Facebook URL"
          value={form.social.facebook}
          onChange={setSocial('facebook')}
        />
        <TextInput
          label="Instagram URL"
          value={form.social.instagram}
          onChange={setSocial('instagram')}
        />
        <div className="form-actions span-2">
          <button type="submit" className="btn btn-primary">
            Save company
          </button>
          {saved ? <span className="save-hint">Saved</span> : null}
        </div>
      </form>
    </div>
  )
}
