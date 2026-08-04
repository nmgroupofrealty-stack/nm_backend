import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { useSyncExternalStore } from 'react'
import { auth, isFirebaseConfigured } from '../firebase'

export interface AuthUser {
  email: string
  name: string
  uid: string
}

type Listener = () => void

let listeners: Listener[] = []
let cachedUser: AuthUser | null = null
let authReady = false
let started = false

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null
  return {
    uid: user.uid,
    email: user.email ?? '',
    name: user.displayName || user.email?.split('@')[0] || 'Admin',
  }
}

function notify() {
  listeners.forEach((l) => l())
}

function startAuthListener() {
  if (started) return
  started = true

  if (!isFirebaseConfigured || !auth) {
    authReady = true
    notify()
    return
  }

  onAuthStateChanged(auth, (user) => {
    cachedUser = toAuthUser(user)
    authReady = true
    notify()
  })
}

export function subscribeAuth(listener: Listener) {
  listeners = [...listeners, listener]
  startAuthListener()
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function getAuthSnapshot() {
  return cachedUser
}

export function getAuthReady() {
  return authReady
}

export async function login(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isFirebaseConfigured || !auth) {
    return {
      ok: false,
      error:
        'Add VITE_FIREBASE_API_KEY to NMadmin/.env (Firebase → Project settings → Web app).',
    }
  }

  try {
    await signInWithEmailAndPassword(auth, email.trim(), password)
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid email or password'
    if (
      message.includes('invalid-credential') ||
      message.includes('user-not-found') ||
      message.includes('wrong-password')
    ) {
      return {
        ok: false,
        error:
          'Invalid email or password. Create this user under Firebase Authentication → Users.',
      }
    }
    if (message.includes('api-key') || message.includes('API key')) {
      return { ok: false, error: 'Invalid Firebase API key. Check NMadmin/.env' }
    }
    return { ok: false, error: message.replace(/^Firebase:\s*/i, '').split('(')[0].trim() }
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isFirebaseConfigured || !auth) {
    return {
      ok: false,
      error:
        'Add VITE_FIREBASE_API_KEY to NMadmin/.env (Firebase → Project settings → Web app).',
    }
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() })
    }
    cachedUser = toAuthUser(cred.user)
    notify()
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create account'
    if (message.includes('email-already-in-use')) {
      return { ok: false, error: 'That email is already registered. Try signing in instead.' }
    }
    if (message.includes('weak-password')) {
      return { ok: false, error: 'Password is too weak. Use at least 6 characters.' }
    }
    if (message.includes('invalid-email')) {
      return { ok: false, error: 'Please enter a valid email address.' }
    }
    if (message.includes('operation-not-allowed')) {
      return {
        ok: false,
        error: 'Enable Email/Password in Firebase → Authentication → Sign-in method.',
      }
    }
    if (message.includes('api-key') || message.includes('API key')) {
      return { ok: false, error: 'Invalid Firebase API key. Check NMadmin/.env' }
    }
    return { ok: false, error: message.replace(/^Firebase:\s*/i, '').split('(')[0].trim() }
  }
}

export async function logout() {
  if (auth) await signOut(auth)
  cachedUser = null
  notify()
}

export function useAuthReady() {
  return useSyncExternalStore(subscribeAuth, getAuthReady, () => false)
}
