import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { TextInput, TextSelect, TextTextarea } from '../components/FormFields'
import { ImageField } from '../components/ImageField'
import { GalleryField } from '../components/GalleryField'
import { removeItem, saveItem, useSiteData } from '../data/store'
import type { Property } from '../types'

const emptyForm = {
  title: '',
  price: '',
  location: '',
  bhk: '',
  area: '',
  type: 'Flats',
  image: '',
  gallery: [] as string[],
  description: '',
  bathrooms: '',
  parking: '',
  facing: '',
  floor: '',
  status: 'Ready to Move',
  furnishing: '',
  amenitiesText: '',
}

function amenitiesToText(amenities?: string[]) {
  return (amenities ?? []).join(', ')
}

function textToAmenities(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function PropertiesPage() {
  const { properties, categories } = useSiteData()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')

  const filtered = properties.filter((p) => {
    const q = query.toLowerCase()
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    )
  })

  const openCreate = () => {
    setEditingId(null)
    setForm({
      ...emptyForm,
      type: categories[0]?.title ?? 'Flats',
    })
    setOpen(true)
  }

  const openEdit = (item: Property) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      price: item.price,
      location: item.location,
      bhk: item.bhk,
      area: item.area,
      type: item.type,
      image: item.image,
      gallery: item.gallery ?? [],
      description: item.description ?? '',
      bathrooms: item.bathrooms ?? '',
      parking: item.parking ?? '',
      facing: item.facing ?? '',
      floor: item.floor ?? '',
      status: item.status ?? 'Ready to Move',
      furnishing: item.furnishing ?? '',
      amenitiesText: amenitiesToText(item.amenities),
    })
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { amenitiesText, ...rest } = form
    const payload = {
      ...rest,
      gallery: rest.gallery.filter(Boolean),
      amenities: textToAmenities(amenitiesText),
    }

    if (editingId != null) {
      await saveItem('properties', editingId, { id: editingId, ...payload })
    } else {
      const nextId = Math.max(0, ...properties.map((p) => p.id)) + 1
      await saveItem('properties', nextId, { id: nextId, ...payload })
    }
    setOpen(false)
  }

  const remove = (id: number) => {
    if (!confirm('Delete this property?')) return
    removeItem('properties', id)
  }

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="Featured listings shown on the public website."
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add property
          </button>
        }
      />

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search title, location, type…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Price</th>
              <th>Location</th>
              <th>BHK</th>
              <th>Type</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="cell-media">
                    <img src={item.image} alt="" />
                    <div>
                      <strong>{item.title}</strong>
                      <small>
                        {item.area}
                        {item.gallery?.length ? ` · ${item.gallery.length} gallery` : ''}
                      </small>
                    </div>
                  </div>
                </td>
                <td>{item.price}</td>
                <td>{item.location}</td>
                <td>{item.bhk}</td>
                <td>{item.type}</td>
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
        {filtered.length === 0 ? <p className="empty">No properties found.</p> : null}
      </div>

      <Modal
        title={editingId != null ? 'Edit property' : 'Add property'}
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
      >
        <form className="form-stack" onSubmit={onSubmit}>
          <div className="form-grid-2">
            <TextInput
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <TextInput
              label="Price"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
              placeholder="₹85 Lakh"
            />
            <TextInput
              label="Location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              required
            />
            <TextSelect
              label="Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              {categories.length === 0 ? (
                <>
                  <option value="Flats">Flats</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Resale Property">Resale Property</option>
                  <option value="Plots">Plots</option>
                </>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.title}
                  </option>
                ))
              )}
            </TextSelect>
            <TextInput
              label="BHK / Unit"
              value={form.bhk}
              onChange={(e) => setForm((f) => ({ ...f, bhk: e.target.value }))}
              required
            />
            <TextInput
              label="Area"
              value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              required
            />
            <TextInput
              label="Bathrooms"
              value={form.bathrooms}
              onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
              placeholder="2 Baths"
            />
            <TextInput
              label="Parking"
              value={form.parking}
              onChange={(e) => setForm((f) => ({ ...f, parking: e.target.value }))}
              placeholder="1 Covered"
            />
            <TextInput
              label="Facing"
              value={form.facing}
              onChange={(e) => setForm((f) => ({ ...f, facing: e.target.value }))}
              placeholder="East Facing"
            />
            <TextInput
              label="Floor"
              value={form.floor}
              onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
              placeholder="5th of 12"
            />
            <TextSelect
              label="Status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
              <option value="New Launch">New Launch</option>
              <option value="Resale">Resale</option>
            </TextSelect>
            <TextInput
              label="Furnishing"
              value={form.furnishing}
              onChange={(e) => setForm((f) => ({ ...f, furnishing: e.target.value }))}
              placeholder="Semi Furnished"
            />
          </div>

          <TextTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Highlight key selling points, nearby landmarks, and unique features…"
          />
          <TextInput
            label="Amenities"
            value={form.amenitiesText}
            onChange={(e) => setForm((f) => ({ ...f, amenitiesText: e.target.value }))}
            placeholder="Lift, Gym, Power Backup, Security (comma separated)"
          />

          <ImageField
            label="Cover image"
            value={form.image}
            folder="properties"
            required
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
          />
          <GalleryField
            label="Gallery side images"
            value={form.gallery}
            folder="properties"
            max={6}
            onChange={(gallery) => setForm((f) => ({ ...f, gallery }))}
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
