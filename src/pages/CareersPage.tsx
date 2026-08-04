import { useMemo, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Modal } from '../components/Modal'
import { TextInput, TextSelect, TextTextarea } from '../components/FormFields'
import { removeItem, saveItem, uid, useSiteData } from '../data/store'
import type { CareerJob } from '../types'

const empty = {
  title: '',
  location: '',
  type: 'Full-time',
  description: '',
}

export function CareersPage() {
  const { careers, careerApplications } = useSiteData()
  const [tab, setTab] = useState<'jobs' | 'applications'>('jobs')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CareerJob | null>(null)
  const [form, setForm] = useState(empty)

  const sortedApplications = useMemo(
    () =>
      [...careerApplications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [careerApplications],
  )

  const newCount = careerApplications.filter((a) => a.status === 'new').length

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }

  const openEdit = (item: CareerJob) => {
    setEditing(item)
    setForm({
      title: item.title,
      location: item.location,
      type: item.type,
      description: item.description,
    })
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (editing) {
      await saveItem('careers', editing.id, { ...editing, ...form })
    } else {
      const id = uid('job')
      await saveItem('careers', id, { id, ...form })
    }
    setOpen(false)
  }

  const remove = (id: string) => {
    if (!confirm('Delete this job opening?')) return
    removeItem('careers', id)
  }

  const removeApp = (id: string) => {
    if (!confirm('Delete this application?')) return
    removeItem('careerApplications', id)
  }

  return (
    <div>
      <PageHeader
        title="Careers"
        subtitle="Manage job openings and review applications from the website."
        action={
          tab === 'jobs' ? (
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} />
              Add job
            </button>
          ) : null
        }
      />

      <div className="careers-tabs">
        <button
          type="button"
          className={`careers-tab ${tab === 'jobs' ? 'active' : ''}`}
          onClick={() => setTab('jobs')}
        >
          Job openings ({careers.length})
        </button>
        <button
          type="button"
          className={`careers-tab ${tab === 'applications' ? 'active' : ''}`}
          onClick={() => setTab('applications')}
        >
          Applications ({careerApplications.length})
          {newCount > 0 ? <span className="tab-badge">{newCount} new</span> : null}
        </button>
      </div>

      {tab === 'jobs' ? (
        <>
          <div className="card-grid">
            {careers.map((item) => (
              <article key={item.id} className="review-card panel">
                <div className="review-meta">
                  <strong>{item.title}</strong>
                  <small>{item.type}</small>
                </div>
                <p>{item.location}</p>
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
              </article>
            ))}
          </div>
          {careers.length === 0 ? <p className="empty panel">No job openings yet.</p> : null}
        </>
      ) : (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Message</th>
                <th>CV</th>
                <th>Received</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedApplications.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.jobTitle}</td>
                  <td>{item.phone}</td>
                  <td>
                    <a href={`mailto:${item.email}`}>{item.email}</a>
                  </td>
                  <td className="app-message">{item.message || '—'}</td>
                  <td>
                    {item.cvData ? (
                      <a
                        className="btn btn-sm"
                        href={item.cvData}
                        download={item.cvFileName || 'cv.pdf'}
                      >
                        Download PDF
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="row-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeApp(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedApplications.length === 0 ? (
            <p className="empty">No applications yet.</p>
          ) : null}
        </div>
      )}

      <Modal
        title={editing ? 'Edit job' : 'Add job'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <form className="form-stack" onSubmit={onSubmit}>
          <TextInput
            label="Job title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            placeholder="Sales Executive"
          />
          <TextInput
            label="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            required
            placeholder="New Town, Kolkata"
          />
          <TextSelect
            label="Job type"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </TextSelect>
          <TextTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            placeholder="Role summary, responsibilities, requirements…"
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
