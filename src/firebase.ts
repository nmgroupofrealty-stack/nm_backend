import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

/**
 * Firebase project: nmgroup-6ba39
 * Database: https://nmgroup-6ba39-default-rtdb.firebaseio.com/
 */
const firebaseConfig = {
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY as string) ||
    'AIzaSyCnGrS-KXqFG5xRXUftot62SkolUuNfGW0',
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) ||
    'nmgroup-6ba39.firebaseapp.com',
  databaseURL:
    (import.meta.env.VITE_FIREBASE_DATABASE_URL as string) ||
    'https://nmgroup-6ba39-default-rtdb.firebaseio.com',
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || 'nmgroup-6ba39',
  storageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) ||
    'nmgroup-6ba39.firebasestorage.app',
  messagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '297484692476',
  appId:
    (import.meta.env.VITE_FIREBASE_APP_ID as string) ||
    '1:297484692476:web:37606148c494ef17916079',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey?.trim())

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Database | null = null
let storage: FirebaseStorage | null = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getDatabase(app)
  storage = getStorage(app)
}

export { app, auth, db, storage }

/** Root path for all NM Group site content in Realtime Database */
export const SITE_PATH = 'site'
