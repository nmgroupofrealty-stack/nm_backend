import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { TextInput, TextTextarea } from '../components/FormFields'
import { removeItem, saveItem, uid, useSiteData } from '../data/store'
import type { WhyChooseItem } from '../types'

const empty = { title: '', icon: '', desc: '' }

export function WhyChoosePage() {
  const { whyChoose } = useSiteData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<WhyChooseItem | null>(null)
  const [form, setForm] = useState(empty)

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const openEdit = (item: WhyChooseItem) => {
    setEditing(item)
    setForm({ title: item.title, icon: item.icon, desc: item.desc })
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (editing) {
      await saveItem('whyChoose', editing.id, { ...editing, ...form })
    } else {
      const id = uid('wc')
      await saveItem('whyChoose', id, { id, ...form })
    }
    setOpen(false)
  }

  const remove = (id: string) => {
    if (!confirm('Delete this item?')) return
    removeItem('whyChoose', id)
  }

  return (
    <div>
      <PageHeader
        title="Why Choose Us"
        subtitle="Trust points shown on the homepage."
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add item
          </button>
        }
      />

      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th>Icon</th>
              <th>Title</th>
              <th>Description</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {whyChoose.map((item) => (
              <tr key={item.id}>
                <td className="icon-cell">{item.icon}</td>
                <td>{item.title}</td>
                <td>{item.desc}</td>
                <td className="row-actions">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        title={editing ? 'Edit item' : 'Add item'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form className="form-stack" onSubmit={onSubmit}>
          <TextInput
            label="Icon (emoji)"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            placeholder="✅"
            required
          />
          <TextInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <TextTextarea
            label="Description"
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
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
