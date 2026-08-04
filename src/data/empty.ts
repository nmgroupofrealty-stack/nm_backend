import type { Company, EmailConfig, FormEmailSettings, HeroMedia, SiteData, VisitSection } from '../types'

export const emptyCompany: Company = {
  name: '',
  shortName: '',
  email: '',
  phone: '',
  whatsapp: '',
  tagline: '',
  footerTagline: '',
  about: '',
  address: '',
  mapEmbed: '',
  social: {
    whatsapp: '',
    facebook: '',
    instagram: '',
  },
}

export const emptyHero: HeroMedia = {
  type: 'image',
  video: '',
  poster: '',
}

function normalizeHero(hero?: Partial<HeroMedia> | null): HeroMedia {
  const merged = { ...emptyHero, ...(hero ?? {}) }
  const type =
    merged.type === 'video' || merged.type === 'image'
      ? merged.type
      : merged.video?.trim()
        ? 'video'
        : 'image'
  return { ...merged, type }
}

export const emptyVisitSection: VisitSection = {
  title: '',
  description: '',
  points: [],
}

export const emptyFormEmail: FormEmailSettings = {
  enabled: false,
  toEmail: '',
  ccEmail: '',
  subject: '',
  templateId: '',
}

export const emptyEmailConfig: EmailConfig = {
  publicKey: '',
  serviceId: '',
  siteVisit: {
    ...emptyFormEmail,
    subject: 'New Site Visit Booking',
  },
  career: {
    ...emptyFormEmail,
    subject: 'New Career Application',
  },
}

/** Empty shape used when Firebase has no data yet — no static content */
export const emptySiteData: SiteData = {
  company: emptyCompany,
  navLinks: [],
  categories: [],
  properties: [],
  whyChoose: [],
  locations: [],
  reviews: [],
  hero: emptyHero,
  visitSection: emptyVisitSection,
  careers: [],
  careerApplications: [],
  bookings: [],
  associates: [],
  bankingAssociates: [],
  emailConfig: emptyEmailConfig,
}

function asArray<T>(value: unknown): T[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean) as T[]
  if (typeof value === 'object') return Object.values(value as Record<string, T>)
  return []
}

function asStringList(value: unknown): string[] {
  return asArray<unknown>(value).filter((item): item is string => typeof item === 'string')
}

function normalizeFormEmail(
  value: Partial<FormEmailSettings> | undefined,
  fallbackSubject: string,
): FormEmailSettings {
  return {
    enabled: Boolean(value?.enabled),
    toEmail: value?.toEmail ?? '',
    ccEmail: value?.ccEmail ?? '',
    subject: value?.subject || fallbackSubject,
    templateId: value?.templateId ?? '',
  }
}

/** Normalize Firebase snapshot into SiteData (handles null / object-maps) */
export function normalizeSiteData(raw: unknown): SiteData {
  if (!raw || typeof raw !== 'object') return structuredClone(emptySiteData)

  const data = raw as Partial<SiteData>
  const company = { ...emptyCompany, ...(data.company ?? {}) }
  company.social = { ...emptyCompany.social, ...(data.company?.social ?? {}) }
  const emailRaw = data.emailConfig

  return {
    company,
    navLinks: asArray(data.navLinks),
    categories: asArray(data.categories),
    properties: asArray(data.properties).map((item) => {
      const property = item as SiteData['properties'][number]
      return {
        ...property,
        gallery: asStringList(property.gallery),
        amenities: asStringList(property.amenities),
      }
    }),
    whyChoose: asArray(data.whyChoose),
    locations: asArray(data.locations),
    reviews: asArray(data.reviews),
    hero: normalizeHero(data.hero),
    visitSection: {
      ...emptyVisitSection,
      ...(data.visitSection ?? {}),
      points: asStringList(data.visitSection?.points),
    },
    careers: asArray(data.careers),
    careerApplications: asArray(data.careerApplications),
    bookings: asArray(data.bookings),
    associates: asArray(data.associates),
    bankingAssociates: asArray(data.bankingAssociates),
    emailConfig: {
      publicKey: emailRaw?.publicKey ?? '',
      serviceId: emailRaw?.serviceId ?? '',
      siteVisit: normalizeFormEmail(emailRaw?.siteVisit, 'New Site Visit Booking'),
      career: normalizeFormEmail(emailRaw?.career, 'New Career Application'),
    },
  }
}
