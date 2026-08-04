import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { TextInput } from '../components/FormFields'
import { ImageField } from '../components/ImageField'
import { removeItem, saveItem, uid, useSiteData, type CollectionKey } from '../data/store'
import type { Associate } from '../types'

type AssociateKind = 'associates' | 'bankingAssociates'

const empty = { name: '', image: '' }

const tabs: { key: AssociateKind; label: string }[] = [
  { key: 'associates', label: 'Associates' },
  { key: 'bankingAssociates', label: 'Banking Associates' },
]

export function AssociatesPage() {
  const data = useSiteData()
  const [tab, setTab] = useState<AssociateKind>('associates')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Associate | null>(null)
  const [form, setForm] = useState(empty)

  const items = data[tab]

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const openEdit = (item: Associate) => {
    setEditing(item)
    setForm({ name: item.name, image: item.image })
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const collection = tab as CollectionKey
    if (editing) {
      await saveItem(collection, editing.id, { ...editing, ...form })
    } else {
      const id = uid(tab === 'associates' ? 'assoc' : 'bank')
      await saveItem(collection, id, { id, ...form })
    }
    setOpen(false)
  }

  const remove = (id: string) => {
    if (!confirm('Delete this associate logo?')) return
    removeItem(tab, id)
  }

  return (
    <div>
      <PageHeader
        title="Associates"
        subtitle="Logo marquees for Our Associates and Our Banking Associates."
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add logo
          </button>
        }
      />

      <div className="careers-tabs">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`careers-tab${tab === item.key ? ' active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label} ({data[item.key].length})
          </button>
        ))}
      </div>

      <div className="card-grid dense">
        {items.map((item) => (
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

      {items.length === 0 ? (
        <p className="empty">No logos yet. Add associate logos to show on the website marquee.</p>
      ) : null}

      <Modal
        title={
          editing
            ? `Edit ${tab === 'associates' ? 'associate' : 'banking'} logo`
            : `Add ${tab === 'associates' ? 'associate' : 'banking'} logo`
        }
        open={open}
        onClose={() => setOpen(false)}
      >
        <form className="form-stack" onSubmit={onSubmit}>
          <TextInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder={tab === 'associates' ? 'Purti Realty' : 'HDFC Bank'}
          />
          <ImageField
            label="Logo image"
            value={form.image}
            folder="associates"
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
