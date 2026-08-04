import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { TextInput, TextSelect, TextTextarea } from '../components/FormFields'
import { removeItem, saveItem, uid, useSiteData } from '../data/store'
import type { Review } from '../types'

const empty = { name: '', rating: 5, date: '', text: '' }

export function ReviewsPage() {
  const { reviews } = useSiteData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Review | null>(null)
  const [form, setForm] = useState(empty)

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const openEdit = (item: Review) => {
    setEditing(item)
    setForm({
      name: item.name,
      rating: item.rating,
      date: item.date,
      text: item.text,
    })
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (editing) {
      await saveItem('reviews', editing.id, { ...editing, ...form })
    } else {
      const id = uid('rev')
      await saveItem('reviews', id, { id, ...form })
    }
    setOpen(false)
  }

  const remove = (id: string) => {
    if (!confirm('Delete this review?')) return
    removeItem('reviews', id)
  }

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle="Customer testimonials on the homepage."
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add review
          </button>
        }
      />

      <div className="card-grid">
        {reviews.map((item) => (
          <article key={item.id} className="review-card panel">
            <div className="review-meta">
              <strong>{item.name}</strong>
              <span>
                {'★'.repeat(item.rating)}
                {'☆'.repeat(5 - item.rating)}
              </span>
              <small>{item.date}</small>
            </div>
            <p>{item.text}</p>
            <div className="row-actions">
              <button type="button" className="btn btn-sm" onClick={() => openEdit(item)}>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => remove(item.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        title={editing ? 'Edit review' : 'Add review'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form className="form-stack" onSubmit={onSubmit}>
          <TextInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <TextSelect
            label="Rating"
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </TextSelect>
          <TextInput
            label="Date label"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
            placeholder="2 weeks ago"
          />
          <TextTextarea
            label="Review text"
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            required
          />
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
