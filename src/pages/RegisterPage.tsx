import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react'
import { register } from '../auth/auth'
import { isFirebaseConfigured } from '../firebase'

export function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const result = await register(name, email, password)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/', { replace: true })
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
              Create your
              <em> admin account</em>
              in seconds.
            </h1>
            <p>
              Your account is stored securely in Firebase Authentication. Once registered you can
              manage all website content instantly.
            </p>
            <ul className="showcase-points">
              <li>Secure Firebase Authentication</li>
              <li>Full control of listings & leads</li>
              <li>Live sync with Realtime Database</li>
            </ul>
          </div>
        </aside>

        <main className="login-panel">
          <form className="login-card" onSubmit={onSubmit}>
            <div className="login-card-head">
              <h2>Create account</h2>
              <p>Register a new admin for NM Group</p>
            </div>

            {!isFirebaseConfigured ? (
              <p className="login-error">
                Add <code>VITE_FIREBASE_API_KEY</code> to <code>NMadmin/.env</code> then restart
                the dev server.
              </p>
            ) : null}

            <label className="login-field">
              <span>Full name</span>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
            </label>

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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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

            <label className="login-field">
              <span>Confirm password</span>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>

            {error ? <p className="login-error">{error}</p> : null}

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={loading || !isFirebaseConfigured}
            >
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  )
}
