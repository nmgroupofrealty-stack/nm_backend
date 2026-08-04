import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { TextInput, TextTextarea } from '../components/FormFields'
import { ImageField } from '../components/ImageField'
import { removeItem, saveItem, useSiteData } from '../data/store'
import type { Category } from '../types'

const empty: Category = {
  id: '',
  title: '',
  icon: '',
  description: '',
  image: '',
}

export function CategoriesPage() {
  const { categories } = useSiteData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Category>(empty)

  const openCreate = () => {
    setEditing(false)
    setForm(empty)
    setOpen(true)
  }

  const openEdit = (item: Category) => {
    setEditing(true)
    setForm(item)
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (editing) {
      await saveItem('categories', form.id, form)
    } else {
      const id =
        form.id.trim() ||
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      await saveItem('categories', id, { ...form, id })
    }
    setOpen(false)
  }

  const remove = (id: string) => {
    if (!confirm('Delete this category?')) return
    removeItem('categories', id)
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Featured property categories (Flats, Plots, etc.)."
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add category
          </button>
        }
      />

      <div className="card-grid">
        {categories.map((item) => (
          <article key={item.id} className="entity-card">
            <img src={item.image} alt={item.title} />
            <div className="entity-card-body">
              <h3>
                <span>{item.icon}</span> {item.title}
              </h3>
              <p>{item.description}</p>
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
            </div>
          </article>
        ))}
      </div>

      <Modal
        title={editing ? 'Edit category' : 'Add category'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form className="form-stack" onSubmit={onSubmit}>
          {!editing ? (
            <TextInput
              label="ID (optional slug)"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              placeholder="flats"
            />
          ) : null}
          <TextInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <TextInput
            label="Icon (emoji or text)"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            required
          />
          <TextTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
          <ImageField
            label="Image"
            value={form.image}
            folder="categories"
            required
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
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
