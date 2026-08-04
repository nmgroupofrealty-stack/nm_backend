import { useSyncExternalStore, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  getAuthReady,
  getAuthSnapshot,
  subscribeAuth,
} from '../auth/auth'

export function useAuth() {
  return useSyncExternalStore(subscribeAuth, getAuthSnapshot, () => null)
}

export function useAuthReady() {
  return useSyncExternalStore(subscribeAuth, getAuthReady, () => false)
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuth()
  const ready = useAuthReady()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-spinner" />
        <p>Connecting to Firebase…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const user = useAuth()
  const ready = useAuthReady()

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-spinner" />
        <p>Connecting to Firebase…</p>
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />
  return children
}
