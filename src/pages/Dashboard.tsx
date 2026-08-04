import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CalendarCheck2,
  FolderKanban,
  Handshake,
  MapPin,
  MessageSquareQuote,
  TrendingUp,
} from 'lucide-react'
import { useSiteData } from '../data/store'
import { PageHeader } from '../components/PageHeader'

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}

function StatValue({ value }: { value: number }) {
  const n = useCountUp(value)
  return <span className="stat-value">{n}</span>
}

function MiniSpark({ values, color, id }: { values: number[]; color: string; id: string }) {
  const max = Math.max(...values, 1)
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100
      const y = 28 - (v / max) * 22
      return `${x},${y}`
    })
    .join(' ')
  const gradId = `spark-${id}`

  return (
    <svg className="stat-spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polyline fill={`url(#${gradId})`} stroke="none" points={`0,32 ${points} 100,32`} opacity="0.18" />
    </svg>
  )
}

function BarChart({
  items,
}: {
  items: { label: string; value: number; color: string }[]
}) {
  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <div className="dash-bars" role="img" aria-label="Content inventory chart">
      {items.map((item, index) => (
        <div key={item.label} className="dash-bar-row">
          <span className="dash-bar-label">{item.label}</span>
          <div className="dash-bar-track">
            <div
              className="dash-bar-fill"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color,
                animationDelay: `${index * 80}ms`,
              }}
            />
          </div>
          <strong className="dash-bar-value">{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[]
  centerLabel: string
  centerValue: number
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const radius = 54
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="dash-donut-wrap">
      <svg className="dash-donut" viewBox="0 0 140 140" aria-hidden="true">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#eef2ef" strokeWidth="16" />
        {segments.map((seg) => {
          const length = (seg.value / total) * circumference
          const dash = `${length} ${circumference - length}`
          const el = (
            <circle
              key={seg.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className="dash-donut-seg"
              transform="rotate(-90 70 70)"
            />
          )
          offset += length
          return el
        })}
        <text x="70" y="66" textAnchor="middle" className="dash-donut-value">
          {centerValue}
        </text>
        <text x="70" y="84" textAnchor="middle" className="dash-donut-label">
          {centerLabel}
        </text>
      </svg>
      <ul className="dash-legend">
        {segments.map((seg) => (
          <li key={seg.label}>
            <span style={{ background: seg.color }} />
            <em>{seg.label}</em>
            <strong>{seg.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

function sparkFromValue(value: number) {
  const seed = Math.max(value, 1)
  return Array.from({ length: 7 }, (_, i) => {
    const wave = Math.sin(i * 1.1 + seed) * 0.35 + 0.65
    return Math.max(1, Math.round(seed * wave * (0.55 + i * 0.08)))
  })
}

export function Dashboard() {
  const data = useSiteData()
  const newBookings = data.bookings.filter((b) => b.status === 'new').length
  const newApplications = data.careerApplications.filter((a) => a.status === 'new').length
  const companyName = data.company.name || 'NM Group'

  const stats = [
    {
      label: 'Properties',
      value: data.properties.length,
      to: '/properties',
      icon: Building2,
      tone: 'green',
      color: '#3f8f24',
    },
    {
      label: 'Categories',
      value: data.categories.length,
      to: '/categories',
      icon: FolderKanban,
      tone: 'slate',
      color: '#4b5a72',
    },
    {
      label: 'Locations',
      value: data.locations.length,
      to: '/locations',
      icon: MapPin,
      tone: 'teal',
      color: '#0f766e',
    },
    {
      label: 'Reviews',
      value: data.reviews.length,
      to: '/reviews',
      icon: MessageSquareQuote,
      tone: 'amber',
      color: '#b45309',
    },
    {
      label: 'Associates',
      value: data.associates.length + data.bankingAssociates.length,
      to: '/associates',
      icon: Handshake,
      tone: 'teal',
      color: '#0f766e',
    },
    {
      label: 'Careers',
      value: data.careers.length,
      to: '/careers',
      icon: Briefcase,
      tone: 'slate',
      color: '#4b5a72',
    },
    {
      label: 'New applications',
      value: newApplications,
      to: '/careers',
      icon: Briefcase,
      tone: 'amber',
      color: '#b45309',
    },
    {
      label: 'New site visits',
      value: newBookings,
      to: '/bookings',
      icon: CalendarCheck2,
      tone: 'rose',
      color: '#be123c',
    },
  ]

  const inventory = useMemo(
    () => [
      { label: 'Properties', value: data.properties.length, color: '#5fb233' },
      { label: 'Locations', value: data.locations.length, color: '#0f766e' },
      { label: 'Categories', value: data.categories.length, color: '#4b5a72' },
      { label: 'Reviews', value: data.reviews.length, color: '#d97706' },
      { label: 'Careers', value: data.careers.length, color: '#2563eb' },
      {
        label: 'Associates',
        value: data.associates.length + data.bankingAssociates.length,
        color: '#0891b2',
      },
    ],
    [data],
  )

  const bookingSegments = useMemo(() => {
    const statuses = ['new', 'contacted', 'scheduled', 'completed', 'cancelled'] as const
    const colors = ['#5fb233', '#0ea5e9', '#8b5cf6', '#10b981', '#94a3b8']
    return statuses
      .map((status, i) => ({
        label: status,
        value: data.bookings.filter((b) => b.status === status).length,
        color: colors[i],
      }))
      .filter((s) => s.value > 0)
  }, [data.bookings])

  const applicationSegments = useMemo(() => {
    const statuses = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'] as const
    const colors = ['#f59e0b', '#0ea5e9', '#8b5cf6', '#ef4444', '#5fb233']
    return statuses
      .map((status, i) => ({
        label: status,
        value: data.careerApplications.filter((a) => a.status === status).length,
        color: colors[i],
      }))
      .filter((s) => s.value > 0)
  }, [data.careerApplications])

  const recentBookings = useMemo(
    () =>
      [...data.bookings]
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 5),
    [data.bookings],
  )

  const recentApplications = useMemo(
    () =>
      [...data.careerApplications]
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 5),
    [data.careerApplications],
  )

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle={`Manage all content for ${companyName}. Data saves to Firebase.`}
      />

      <div className="dash-hero-strip">
        <div className="dash-hero-card">
          <span className="dash-hero-kicker">
            <TrendingUp size={14} />
            Live overview
          </span>
          <strong>{data.properties.length + data.locations.length + data.reviews.length}</strong>
          <p>Total published content items across properties, locations & reviews</p>
        </div>
        <div className="dash-hero-card accent">
          <span className="dash-hero-kicker">Action needed</span>
          <strong>{newBookings + newApplications}</strong>
          <p>
            {newBookings} new visits · {newApplications} new applications
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              to={s.to}
              className={`stat-card tone-${s.tone}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="stat-icon">
                <Icon size={20} />
              </span>
              <StatValue value={s.value} />
              <span className="stat-label">{s.label}</span>
              <MiniSpark values={sparkFromValue(s.value)} color={s.color} id={`s${i}`} />
              <span className="stat-go" aria-hidden="true">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          )
        })}
      </div>

      <div className="dash-charts">
        <section className="panel dash-chart-panel">
          <div className="panel-head">
            <h3>Content inventory</h3>
            <span className="dash-chip">Live counts</span>
          </div>
          <BarChart items={inventory} />
        </section>

        <section className="panel dash-chart-panel">
          <div className="panel-head">
            <h3>Site visit status</h3>
            <Link to="/bookings" className="btn btn-sm">
              Open
            </Link>
          </div>
          {bookingSegments.length ? (
            <DonutChart
              segments={bookingSegments}
              centerLabel="visits"
              centerValue={data.bookings.length}
            />
          ) : (
            <p className="empty">No site visit bookings yet.</p>
          )}
        </section>

        <section className="panel dash-chart-panel">
          <div className="panel-head">
            <h3>Career pipeline</h3>
            <Link to="/careers" className="btn btn-sm">
              Open
            </Link>
          </div>
          {applicationSegments.length ? (
            <DonutChart
              segments={applicationSegments}
              centerLabel="apps"
              centerValue={data.careerApplications.length}
            />
          ) : (
            <p className="empty">No career applications yet.</p>
          )}
        </section>
      </div>

      <div className="dash-bottom">
        <section className="panel dash-panel">
          <div className="panel-head">
            <h3>Company snapshot</h3>
            <Link to="/company" className="btn btn-primary btn-sm">
              Edit company
            </Link>
          </div>
          {data.company.name ? (
            <dl className="snap-list">
              <div>
                <dt>Email</dt>
                <dd>{data.company.email || '—'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{data.company.phone || '—'}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{data.company.address || '—'}</dd>
              </div>
            </dl>
          ) : (
            <p className="empty">
              No company details yet. Open Company and save your first record to Firebase.
            </p>
          )}
        </section>

        <section className="panel dash-panel">
          <div className="panel-head">
            <h3>Recent site visits</h3>
            <Link to="/bookings" className="btn btn-sm">
              View all
            </Link>
          </div>
          {recentBookings.length ? (
            <ul className="dash-activity">
              {recentBookings.map((b) => (
                <li key={b.id}>
                  <span className={`dash-status status-${b.status}`}>{b.status}</span>
                  <div>
                    <strong>{b.name}</strong>
                    <p>
                      {b.requirement || 'Visit'} · {b.date || '—'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No recent bookings.</p>
          )}
        </section>

        <section className="panel dash-panel">
          <div className="panel-head">
            <h3>Recent applications</h3>
            <Link to="/careers" className="btn btn-sm">
              View all
            </Link>
          </div>
          {recentApplications.length ? (
            <ul className="dash-activity">
              {recentApplications.map((a) => (
                <li key={a.id}>
                  <span className={`dash-status status-${a.status}`}>{a.status}</span>
                  <div>
                    <strong>{a.name}</strong>
                    <p>{a.jobTitle || 'Career role'}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No recent applications.</p>
          )}
        </section>
      </div>
    </div>
  )
}
