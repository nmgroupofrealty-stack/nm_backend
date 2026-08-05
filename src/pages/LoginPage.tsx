import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import { login } from '../auth/auth'
import { isFirebaseConfigured } from '../firebase'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <div className="grid-glow" />
        <div className="float-card float-a">
          <Building2 size={18} />
          <span>Firebase connected</span>
        </div>
        <div className="float-card float-b">
          <Sparkles size={18} />
          <span>New Town · Rajarhat</span>
        </div>
      </div>

      <div className="login-shell">
        <aside className="login-showcase">
          <div className="showcase-inner">
            <div className="showcase-brand">
              <span className="brand-mark lg">NM</span>
              <div>
                <strong>NM Group</strong>
                <small>Realty Admin</small>
              </div>
            </div>
            <h1>
              Manage your
              <em> property empire</em>
              with clarity.
            </h1>
            <p>
              All content is saved live to your Firebase Realtime Database — properties,
              reviews, locations, and site-visit leads.
            </p>
            <ul className="showcase-points">
              <li>Live sync with Firebase RTDB</li>
              <li>Secure Firebase Authentication</li>
              <li>No static seed data — you create everything</li>
            </ul>
          </div>
        </aside>

        <main className="login-panel">
          <form className="login-card" onSubmit={onSubmit}>
            <div className="login-card-head">
              <h2>Welcome back</h2>
              <p>Sign in with your Firebase Auth account</p>
            </div>

            {!isFirebaseConfigured ? (
              <p className="login-error">
                Firebase is not configured. For local: set <code>VITE_FIREBASE_API_KEY</code> in{' '}
                <code>.env</code> and restart. For live: redeploy admin with Firebase config
                included.
              </p>
            ) : null}

            <label className="login-field">
              <span>Email</span>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nmgroup.com"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error ? <p className="login-error">{error}</p> : null}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={loading || !isFirebaseConfigured}
            >
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="auth-switch">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  )
}
