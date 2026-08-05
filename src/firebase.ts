import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

/**
 * Firebase project: nmgroup-6ba39
 * Hardcoded like NMgroup so Hosting/CI builds always work.
 * Optional VITE_* env vars can override locally if needed.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyCnGrS-KXqFG5xRXUftot62SkolUuNfGW0',
  authDomain: 'nmgroup-6ba39.firebaseapp.com',
  databaseURL: 'https://nmgroup-6ba39-default-rtdb.firebaseio.com',
  projectId: 'nmgroup-6ba39',
  storageBucket: 'nmgroup-6ba39.firebasestorage.app',
  messagingSenderId: '297484692476',
  appId: '1:297484692476:web:37606148c494ef17916079',
}

// Allow local .env overrides without breaking production when secrets are empty.
if (import.meta.env.VITE_FIREBASE_API_KEY?.trim()) {
  firebaseConfig.apiKey = import.meta.env.VITE_FIREBASE_API_KEY
}
if (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()) {
  firebaseConfig.authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
}
if (import.meta.env.VITE_FIREBASE_DATABASE_URL?.trim()) {
  firebaseConfig.databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL
}
if (import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()) {
  firebaseConfig.projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
}
if (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim()) {
  firebaseConfig.storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
}
if (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim()) {
  firebaseConfig.messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
}
if (import.meta.env.VITE_FIREBASE_APP_ID?.trim()) {
  firebaseConfig.appId = import.meta.env.VITE_FIREBASE_APP_ID
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey.trim())

const app: FirebaseApp = initializeApp(firebaseConfig)
const auth: Auth = getAuth(app)
const db: Database = getDatabase(app)
const storage: FirebaseStorage = getStorage(app)

export { app, auth, db, storage }

/** Root path for all NM Group site content in Realtime Database */
export const SITE_PATH = 'site'
