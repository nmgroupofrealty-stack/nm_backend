import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { TextInput } from '../components/FormFields'
import { ImageField } from '../components/ImageField'
import { removeItem, saveItem, uid, useSiteData } from '../data/store'
import type { Location } from '../types'

const empty = { name: '', image: '' }

export function LocationsPage() {
  const { locations } = useSiteData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [form, setForm] = useState(empty)

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const openEdit = (item: Location) => {
    setEditing(item)
    setForm({ name: item.name, image: item.image })
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (editing) {
      await saveItem('locations', editing.id, { ...editing, ...form })
    } else {
      const id = uid('loc')
      await saveItem('locations', id, { id, ...form })
    }
    setOpen(false)
  }

  const remove = (id: string) => {
    if (!confirm('Delete this location?')) return
    removeItem('locations', id)
  }

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Areas shown in Property by Location."
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add location
          </button>
        }
      />

      <div className="card-grid dense">
        {locations.map((item) => (
          <article key={item.id} className="entity-card compact">
            <img src={item.image} alt={item.name} />
            <div className="entity-card-body">
              <h3>{item.name}</h3>
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
        title={editing ? 'Edit location' : 'Add location'}
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
          <ImageField
            label="Image"
            value={form.image}
            folder="locations"
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
