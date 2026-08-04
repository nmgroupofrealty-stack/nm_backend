import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2,
  FolderKanban,
  HelpCircle,
  Image,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareQuote,
  CalendarCheck2,
  ClipboardList,
  Briefcase,
  Building,
  Handshake,
  Mail,
} from 'lucide-react'
import { company } from './brand'
import { logout } from '../auth/auth'
import { useAuth } from './ProtectedRoute'
import { useSiteStore } from '../data/store'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/company', label: 'Company', icon: Building },
  { to: '/hero', label: 'Hero Media', icon: Image },
  { to: '/categories', label: 'Categories', icon: FolderKanban },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/why-choose', label: 'Why Choose Us', icon: HelpCircle },
  { to: '/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { to: '/associates', label: 'Associates', icon: Handshake },
  { to: '/careers', label: 'Careers', icon: Briefcase },
  { to: '/visit-section', label: 'Visit Section', icon: ClipboardList },
  { to: '/email-settings', label: 'Email Settings', icon: Mail },
  { to: '/bookings', label: 'Site Visits', icon: CalendarCheck2 },
]

export function Layout() {
  const user = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useSiteStore()

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">NM</span>
          <div>
            <strong>{company.shortName}</strong>
            <small>Admin Panel</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="avatar">{(user?.name ?? 'A').slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{user?.name ?? 'Admin'}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="topbar">
          <div>
            <h1>NM Group Admin</h1>
            <p className="topbar-sub">Synced with Firebase Realtime Database</p>
          </div>
          <span className={`topbar-badge ${error ? 'badge-error' : ''}`}>
            <span className="pulse-dot" />
            {loading ? 'Syncing…' : error ? 'Firebase error' : 'Firebase live'}
          </span>
        </header>

        {error ? (
          <div className="firebase-banner">
            <strong>Firebase:</strong> {error}
            <span>
              Set Realtime Database rules to allow authenticated users, e.g.{' '}
              <code>{`".read": "auth != null", ".write": "auth != null"`}</code>
            </span>
          </div>
        ) : null}

        <main className="page">
          {loading ? (
            <div className="boot-screen inline">
              <div className="boot-spinner" />
              <p>Loading data from Firebase…</p>
            </div>
          ) : (
            <div className="page-enter" key={location.pathname}>
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
