import { PageHeader } from '../components/PageHeader'
import { removeItem, useSiteData } from '../data/store'

export function BookingsPage() {
  const { bookings } = useSiteData()

  const remove = (id: string) => {
    if (!confirm('Delete this booking?')) return
    removeItem('bookings', id)
  }

  return (
    <div>
      <PageHeader
        title="Site visit bookings"
        subtitle="Leads from the Book Free Site Visit form. Connect a database later to receive live submissions."
      />

      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Requirement</th>
              <th>Preferred date</th>
              <th>Received</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {bookings.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>{item.requirement}</td>
                <td>{item.date}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td className="row-actions">
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
        {bookings.length === 0 ? <p className="empty">No bookings yet.</p> : null}
      </div>
    </div>
  )
}
