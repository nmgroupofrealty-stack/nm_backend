import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { TextInput, TextTextarea } from '../components/FormFields'
import { saveVisitSection, useSiteData } from '../data/store'
import type { VisitSection } from '../types'

export function VisitSectionPage() {
  const data = useSiteData()
  const [form, setForm] = useState<VisitSection>(data.visitSection)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(data.visitSection)
  }, [data.visitSection])

  const setPoint = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      points: f.points.map((p, i) => (i === index ? value : p)),
    }))
    setSaved(false)
  }

  const addPoint = () => {
    setForm((f) => ({ ...f, points: [...f.points, ''] }))
    setSaved(false)
  }

  const removePoint = (index: number) => {
    setForm((f) => ({ ...f, points: f.points.filter((_, i) => i !== index) }))
    setSaved(false)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await saveVisitSection({
        ...form,
        points: form.points.map((p) => p.trim()).filter(Boolean),
      })
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Visit Section"
        subtitle="Heading, description, and benefit points of the Book Free Site Visit section on the website."
      />
      <form className="panel form-grid" onSubmit={onSubmit}>
        <div className="span-2">
          <TextInput
            label="Section title"
            value={form.title}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }))
              setSaved(false)
            }}
            placeholder="Book Free Site Visit"
            required
          />
        </div>
        <div className="span-2">
          <TextTextarea
            label="Description"
            value={form.description}
            onChange={(e) => {
              setForm((f) => ({ ...f, description: e.target.value }))
              setSaved(false)
            }}
            placeholder="Fill in your details and our team will schedule a free property visit…"
            required
          />
          <p className="format-hint">
            Formatting: <code>**bold**</code>, <code>*italic*</code>, <code>__underline__</code>,{' '}
            <code>==highlight==</code>
          </p>
        </div>

        <div className="span-2 points-editor">
          <span className="points-label">Benefit points</span>
          {form.points.length === 0 ? (
            <p className="empty">No points yet. Add your first benefit point.</p>
          ) : null}
          {form.points.map((point, index) => (
            <div className="point-row" key={index}>
              <input
                value={point}
                onChange={(e) => setPoint(index, e.target.value)}
                placeholder="e.g. No charges for site visit"
                required
              />
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => removePoint(index)}
                aria-label="Remove point"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={addPoint}>
            <Plus size={15} />
            Add point
          </button>
        </div>

        <div className="form-actions span-2">
          <button type="submit" className="btn btn-primary">
            Save section
          </button>
          {saved ? <span className="save-hint">Saved</span> : null}
        </div>
      </form>
    </div>
  )
}
