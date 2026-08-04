import { useSyncExternalStore } from 'react'
import { onValue, ref, remove, set } from 'firebase/database'
import { db, isFirebaseConfigured, SITE_PATH } from '../firebase'
import type { Company, EmailConfig, HeroMedia, SiteData, VisitSection } from '../types'
import { emptySiteData, normalizeSiteData } from './empty'

type Listener = () => void

type StoreState = {
  data: SiteData
  loading: boolean
  error: string | null
  ready: boolean
}

/** Collections stored as keyed maps under `site/<collection>/<id>` */
export type CollectionKey =
  | 'categories'
  | 'properties'
  | 'locations'
  | 'whyChoose'
  | 'reviews'
  | 'careers'
  | 'careerApplications'
  | 'bookings'
  | 'associates'
  | 'bankingAssociates'

let state: StoreState = {
  data: structuredClone(emptySiteData),
  loading: true,
  error: null,
  ready: false,
}

let listeners: Listener[] = []
let started = false

function emit() {
  listeners.forEach((l) => l())
}

function setState(partial: Partial<StoreState>) {
  state = { ...state, ...partial }
  emit()
}

function startFirebaseListener() {
  if (started) return
  started = true

  if (!isFirebaseConfigured || !db) {
    setState({
      loading: false,
      ready: true,
      error: 'Firebase API key missing. Add VITE_FIREBASE_API_KEY to NMadmin/.env',
    })
    return
  }

  const siteRef = ref(db, SITE_PATH)

  onValue(
    siteRef,
    (snapshot) => {
      setState({
        data: normalizeSiteData(snapshot.val()),
        loading: false,
        error: null,
        ready: true,
      })
    },
    (err) => {
      setState({
        loading: false,
        ready: true,
        error:
          err.message ||
          'Cannot read Firebase. Allow authenticated read/write in Realtime Database rules.',
      })
    },
  )
}

function subscribe(listener: Listener) {
  listeners = [...listeners, listener]
  startFirebaseListener()
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot() {
  return state
}

export function useSiteStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({
    data: emptySiteData,
    loading: true,
    error: null,
    ready: false,
  }))
}

export function useSiteData(): SiteData {
  return useSiteStore().data
}

function requireDb() {
  if (!db) throw new Error('Firebase is not configured')
  return db
}

async function runWrite<T>(fn: () => Promise<T>): Promise<T> {
  try {
    setState({ error: null })
    return await fn()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to save to Firebase'
    setState({ error: msg.replace(/^Firebase:\s*/i, '') })
    throw e
  }
}

/** Save the single company record → site/company */
export function saveCompany(company: Company) {
  return runWrite(() => set(ref(requireDb(), `${SITE_PATH}/company`), company))
}

/** Save the single hero media record → site/hero */
export function saveHero(hero: HeroMedia) {
  return runWrite(() => set(ref(requireDb(), `${SITE_PATH}/hero`), hero))
}

/** Save the Book Site Visit section content → site/visitSection */
export function saveVisitSection(visitSection: VisitSection) {
  return runWrite(() => set(ref(requireDb(), `${SITE_PATH}/visitSection`), visitSection))
}

/** Save email notification settings → site/emailConfig */
export function saveEmailConfig(emailConfig: EmailConfig) {
  return runWrite(() => set(ref(requireDb(), `${SITE_PATH}/emailConfig`), emailConfig))
}

/** Create/update a single collection item → site/<collection>/<id> (no full-node rewrite) */
export function saveItem(collection: CollectionKey, id: string | number, value: unknown) {
  return runWrite(() =>
    set(ref(requireDb(), `${SITE_PATH}/${collection}/${id}`), value),
  )
}

/** Delete a single collection item → site/<collection>/<id> */
export function removeItem(collection: CollectionKey, id: string | number) {
  return runWrite(() => remove(ref(requireDb(), `${SITE_PATH}/${collection}/${id}`)))
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
